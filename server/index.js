import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import { nowISO } from "./helper.js";
import { supabase } from "./db.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 4000;
const THRESHOLD_SECONDS  = process.env.ANTICHEAT_THRESHOLD_SECONDS || 600;

app.get("/health", (req, res) => res.json({ ok: true, "now": nowISO() }));

/**
 * ADMIN: Add a problem
 * Body: { title, difficulty, link, week, position }
 * For now, no auth check – we’ll add that later.
 */
app.post("/api/admin/problems", async (req, res) => {
  try {
    const { title, difficulty, link, week, position } = req.body;

    if (!title || !difficulty || !link) {
      return res
        .status(400)
        .json({ ok: false, error: "title, difficulty, link are required" });
    }

    const { data, error } = await supabase
      .from("problems")
      .insert([
        {
          title,
          difficulty,
          link,
          week: week ?? null,
          position: position ?? null,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error("insert problem error:", error);
      return res
        .status(500)
        .json({ ok: false, error: "Failed to insert problem" });
    }

    res.json({ ok: true, problem: data });
  } catch (err) {
    console.error("admin/problems exception:", err);
    res.status(500).json({ ok: false, error: "Server error" });
  }
});

/**
 * Get problems
 * Optional query: ?week=1 to filter by week
 */
app.get("/api/problems", async (req, res) => {
  try {
    const { week } = req.query;

    let query = supabase
      .from("problems")
      .select("*")
      .order("week", { ascending: true })
      .order("position", { ascending: true });

    if (week) {
      query = query.eq("week", Number(week));
    }

    const { data, error } = await query;

    if (error) {
      console.error("get problems error:", error);
      return res
        .status(500)
        .json({ ok: false, error: "Failed to fetch problems" });
    }

    res.json({ ok: true, problems: data });
  } catch (err) {
    console.error("get /api/problems exception:", err);
    res.status(500).json({ ok: false, error: "Server error" });
  }
});

/**
 * Progress start
 * Called when user clicks problem link
 * Body: { user_id, problem_id }
 *
 * Behavior:
 *  - If no row exists → insert with start_ts = now
 *  - If row exists → DO NOT update start_ts, return existing start_ts
 */
app.post('/api/progress/start', async (req, res) => {
  try {
    const { user_id, problem_id } = req.body;

    if (!user_id || !problem_id) {
      return res.status(400).json({ ok: false, error: 'user_id and problem_id are required' });
    }

    const start_ts = nowISO();

    // Check if a progress row already exists
    const { data: existing, error: selError } = await supabase
      .from('user_progress')
      .select('*')
      .eq('user_id', user_id)
      .eq('problem_id', problem_id)
      .maybeSingle();

    if (selError) {
      console.error('select user_progress error:', selError);
      return res.status(500).json({ ok: false, error: 'Failed to fetch progress' });
    }

    if (existing) {
      // Already exists → DO NOT UPDATE start_ts
      return res.json({
        ok: true,
        start_ts: existing.start_ts,
        mode: 'already_started'
      });
    }

    // Insert only once
    const { error: insError } = await supabase
      .from('user_progress')
      .insert([{
        user_id,
        problem_id,
        start_ts,
        solved: false,
        flagged: false,
        flagged_at: null
      }]);

    if (insError) {
      console.error('insert user_progress error:', insError);
      return res.status(500).json({ ok: false, error: 'Failed to create progress' });
    }

    return res.json({ ok: true, start_ts, mode: 'time_started' });

  } catch (err) {
    console.error('progress/start exception:', err);
    res.status(500).json({ ok: false, error: 'Server error' });
  }
});


app.post('/api/progress/finish', async (req, res) => {
  try {
    const { user_id, problem_id, solved = true } = req.body;

    if (!user_id || !problem_id) {
      return res.status(400).json({ ok: false, error: 'user_id and problem_id are required' });
    }

    const end_ts = nowISO();

    // 1. Fetch existing progress to get start_ts, solved, flag info
    const { data: existing, error: selError } = await supabase
      .from('user_progress')
      .select('id, start_ts, solved, flagged, flagged_at, end_ts, duration_seconds')
      .eq('user_id', user_id)
      .eq('problem_id', problem_id)
      .maybeSingle();

    if (selError) {
      console.error('select existing progress error:', selError);
      return res.status(500).json({ ok: false, error: 'Failed to fetch progress' });
    }

    // ❗ If already solved earlier, do NOT change anything
    if (existing && existing.solved) {
      return res.json({
        ok: true,
        progress: existing,
        note: 'already_solved_no_change'
      });
    }

    const original_start_ts = existing?.start_ts ?? null;

    // 2. Calculate duration only if start_ts exists
    const calcDuration = (start, end) => {
      if (!start || !end) return null;
      return Math.max(
        0,
        Math.round((new Date(end).getTime() - new Date(start).getTime()) / 1000)
      );
    };

    const duration_seconds = calcDuration(original_start_ts, end_ts);

    // 3. Determine if this attempt should be flagged
    let flagged = existing?.flagged || false;
    let flagged_at = existing?.flagged_at || null;

    if (duration_seconds !== null && duration_seconds < THRESHOLD_SECONDS && !flagged) {
      flagged = true;
      flagged_at = end_ts; // first time we flag
    }

    // 4. UPSERT into user_progress (insert if no row yet, update if exists & not solved yet)
    const { data: upsertData, error: upsertError } = await supabase
      .from('user_progress')
      .upsert(
        [
          {
            user_id,
            problem_id,

            start_ts: original_start_ts,  // do NOT overwrite
            end_ts,
            duration_seconds,
            solved,                       // first time solve
            solved_at: solved ? end_ts : null,

            flagged,
            flagged_at,

            updated_at: nowISO()
          }
        ],
        {
          onConflict: 'user_id, problem_id',
          ignoreDuplicates: false
        }
      )
      .select()
      .single();

    if (upsertError) {
      console.error('upsert user_progress error:', upsertError);
      return res.status(500).json({ ok: false, error: 'Failed to update progress' });
    }

    // 5. If flagged, upsert into flagged_problems (to avoid unique violation)
    if (flagged) {
      const reason = duration_seconds !== null
        ? `duration ${duration_seconds}s < threshold ${THRESHOLD_SECONDS}s`
        : 'flagged without duration (missing start_ts)';

      const { error: flagUpsertError } = await supabase
        .from('flagged_problems')
        .upsert(
          [
            {
              user_id,
              problem_id,
              reason,
              flagged_at: flagged_at || end_ts
            }
          ],
          {
            onConflict: 'user_id, problem_id',
            ignoreDuplicates: false
          }
        );

      if (flagUpsertError) {
        console.error('upsert flagged_problems error:', flagUpsertError);
        // don’t fail the whole request; just log it
      }
    }

    return res.json({
      ok: true,
      progress: upsertData,
      note: existing ? 'updated_first_solve' : 'inserted_first_solve',
      flagged,
      duration_seconds
    });

  } catch (err) {
    console.error('progress/finish exception:', err);
    res.status(500).json({ ok: false, error: 'Server error' });
  }
});


app.listen(PORT, () => console.log(`Server running on ${PORT}`));
