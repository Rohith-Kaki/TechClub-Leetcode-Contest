import Razorpay from "razorpay";
import crypto from "crypto";
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
const THRESHOLD_SECONDS  = Number(process.env.ANTICHEAT_THRESHOLD_SECONDS || 600);
const PAYMENT_AMOUNT_PAISE = Number(process.env.PAYMENT_AMOUNT_PAISE || 19900); // 199 INR


const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

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
      return res
        .status(400)
        .json({ ok: false, error: "user_id and problem_id are required" });
    }

    const end_ts = nowISO();

    // 1. Fetch existing progress
    const { data: existing, error: selError } = await supabase
      .from("user_progress")
      .select("id, user_id, problem_id, start_ts, solved, flagged, flagged_at, end_ts, duration_seconds")
      .eq("user_id", user_id)
      .eq("problem_id", problem_id)
      .maybeSingle();

    if (selError) {
      console.error("select existing progress error:", selError);
      return res
        .status(500)
        .json({ ok: false, error: "Failed to fetch progress" });
    }

    // Helper to compute duration
    const calcDuration = (start, end) => {
      if (!start || !end) return null;
      return Math.max(
        0,
        Math.round((new Date(end).getTime() - new Date(start).getTime()) / 1000)
      );
    };

    // CASE 1: No existing row at all → user never hit /start
    if (!existing) {
      const duration_seconds = null;
      const flagged = true;
      const flagged_at = end_ts;
      const flagReason = "Solved without starting (missing start_ts)";

      // Insert new row
      const { data: inserted, error: insError } = await supabase
        .from("user_progress")
        .insert([
          {
            user_id,
            problem_id,
            start_ts: null,
            end_ts,
            duration_seconds,
            solved,
            solved_at: solved ? end_ts : null,
            flagged,
            flagged_at,
            created_at: nowISO(),
            updated_at: nowISO(),
          },
        ])
        .select()
        .single();

      if (insError) {
        console.error("insert user_progress error:", insError);
        return res
          .status(500)
          .json({ ok: false, error: "Failed to create progress" });
      }

      // Insert into flagged_problems
      const { error: flagInsertError } = await supabase
        .from("flagged_problems")
        .upsert(
          [
            {
              user_id,
              problem_id,
              reason: flagReason,
              flagged_at,
            },
          ],
          { onConflict: "user_id, problem_id" }
        );

      if (flagInsertError) {
        console.error("flagged_problems insert error:", flagInsertError);
      }

      return res.json({
        ok: true,
        progress: inserted,
        note: "inserted_no_start_ts_flagged",
        flagged: true,
        duration_seconds: null,
      });
    }

    // CASE 2: Row exists and already solved → do nothing
    if (existing.solved) {
      return res.json({
        ok: true,
        progress: existing,
        note: "already_solved_no_change",
      });
    }

    // CASE 3: Row exists, not solved yet → normal solve flow
    const original_start_ts = existing.start_ts ?? null;
    const duration_seconds = calcDuration(original_start_ts, end_ts);

    let flagged = existing.flagged || false;
    let flagged_at = existing.flagged_at || null;
    let flagReason = null;

    if (!original_start_ts) {
      // Should not normally happen if /start was used, but handle anyway
      flagged = true;
      flagged_at = end_ts;
      flagReason = "Solved without starting (missing start_ts in existing row)";
    } else if (
      duration_seconds !== null &&
      duration_seconds < THRESHOLD_SECONDS &&
      !flagged
    ) {
      flagged = true;
      flagged_at = end_ts;
      flagReason = `duration ${duration_seconds}s < threshold ${THRESHOLD_SECONDS}s`;
    }

    // Update existing row
    const { data: updated, error: updError } = await supabase
      .from("user_progress")
      .update({
        end_ts,
        duration_seconds,
        solved,
        solved_at: solved ? end_ts : null,
        flagged,
        flagged_at,
        updated_at: nowISO(),
      })
      .eq("id", existing.id)
      .select()
      .single();

    if (updError) {
      console.error("update user_progress error:", updError);
      return res
        .status(500)
        .json({ ok: false, error: "Failed to update progress" });
    }

    if (flagged && flagReason) {
      const { error: flagUpsertError } = await supabase
        .from("flagged_problems")
        .upsert(
          [
            {
              user_id,
              problem_id,
              reason: flagReason,
              flagged_at: flagged_at || end_ts,
            },
          ],
          { onConflict: "user_id, problem_id" }
        );

      if (flagUpsertError) {
        console.error("flagged_problems upsert error:", flagUpsertError);
      }
    }

    return res.json({
      ok: true,
      progress: updated,
      note: "updated_first_solve",
      flagged,
      duration_seconds,
    });
  } catch (err) {
    console.error("progress/finish exception:", err);
    res.status(500).json({ ok: false, error: "Server error" });
  }
});



app.get('/api/leaderboard', async (req, res) => {
    try{
      const {data, error} = await supabase.rpc("get_leaderboard");

      if(error){
        console.error('leaderboard query error', error);
        return res.status(500).json({ok: false, error: 'Failed to fetch leaderboard data '});
      }

      res.json({ok:true, leaderboard:data })
    } catch (err) {
    console.error('Query for leaderboard exception:', err);
    res.status(500).json({ ok: false, error: 'Database error' });
  }
});


app.get('/api/progress/solved', async(req, res) => {
  try{
    const {user_id} = req.query;

    if(!user_id){
      return res.status(400).json({ok:false, error:'user_id is required'});
    }
    const {data, error} = await supabase
    .from('user_progress')
    .select('problem_id, solved')
    .eq('user_id', user_id)
    .eq('solved', true);
   
    if (error){
      console.error('Supabase Error:', error);
      return res.status(500).json({ok:false, error:'Failed to fetch solved problems'});  
    }
    const solvedProblemIds = data.map((row) => row.problem_id);
    return res.json({ok:true, solvedProblemIds});
  } catch(err){
    console.error('progress/solved exception', err);
    res.status(500).json({ok:false, error:'Server error'})
  }
})
  

/**
 * Create Razorpay order
 * Body: { user_id }
 */
// app.post("/api/payment/order", async (req, res) => {
//   try {
//     const { user_id } = req.body;

//     if (!user_id) {
//       return res
//         .status(400)
//         .json({ ok: false, error: "user_id is required" });
//     }

//     if (!razorpay) {
//       return res
//         .status(500)
//         .json({ ok: false, error: "Razorpay not configured" });
//     }

//     const options = {
//       amount: PAYMENT_AMOUNT_PAISE, // in paise
//       currency: "INR",
//       receipt: `order_rcpt_${user_id}_${Date.now()}`,
//     };

//     const order = await razorpay.orders.create(options);

//     // store in payments table
//     const { error: dbError } = await supabase.from("payments").insert([
//       {
//         user_id,
//         razorpay_order_id: order.id,
//         amount: options.amount,
//         currency: options.currency,
//         status: "created",
//       },
//     ]);

//     if (dbError) {
//       console.error("insert payments error:", dbError);
//       return res
//         .status(500)
//         .json({ ok: false, error: "Failed to create payment record" });
//     }

//     return res.json({
//       ok: true,
//       order_id: order.id,
//       amount: order.amount,
//       currency: order.currency,
//       key_id: process.env.RAZORPAY_KEY_ID,
//     });
//   } catch (err) {
//     console.error("payment/order exception:", err);
//     res.status(500).json({ ok: false, error: "Server error/order" });
//   }
// });


app.post("/api/payment/order", async (req, res) => {
  try {
    const { user_id } = req.body;

    if (!user_id) {
      return res
        .status(400)
        .json({ ok: false, error: "user_id is required" });
    }

    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      console.error(
        "RAZORPAY_KEY_ID or RAZORPAY_KEY_SECRET missing in .env"
      );
      return res
        .status(500)
        .json({ ok: false, error: "Razorpay not configured" });
    }

    const amount = Number(process.env.PAYMENT_AMOUNT_PAISE || 20000);
    console.log("Creating Razorpay order for user:", user_id, "amount:", amount);

    const options = {
      amount,
      currency: "INR",
      receipt: `rcpt_${user_id.slice(0, 6)}_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);
    console.log("Razorpay order created:", order);

    const { error: dbError } = await supabase.from("payments").insert([
      {
        user_id,
        razorpay_order_id: order.id,
        amount: order.amount,
        currency: order.currency,
        status: "created",
      },
    ]);

    if (dbError) {
      console.error("insert payments error:", dbError);
      return res
        .status(500)
        .json({ ok: false, error: "Failed to create payment record" });
    }

    return res.json({
      ok: true,
      order_id: order.id,
      amount: order.amount,
      currency: order.currency,
      key_id: process.env.RAZORPAY_KEY_ID,
    });
  } catch (err) {
    console.error("payment/order exception:", err);
    res.status(500).json({ ok: false, error: "Server error" });
  }
});


/**
 * Verify Razorpay payment
 * Body: {
 *   user_id,
 *   razorpay_order_id,
 *   razorpay_payment_id,
 *   razorpay_signature
 * }
 */
app.post("/api/payment/verify", async (req, res) => {
  try {
    const {
      user_id,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = req.body;

    if (!user_id || !razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({
        ok: false,
        error: "user_id, razorpay_order_id, razorpay_payment_id, razorpay_signature are required",
      });
    }

    const key_secret = process.env.RAZORPAY_KEY_SECRET;
    const body = `${razorpay_order_id}|${razorpay_payment_id}`;

    const expectedSignature = crypto
      .createHmac("sha256", key_secret)
      .update(body)
      .digest("hex");

    const isValid = expectedSignature === razorpay_signature;

    if (!isValid) {
      // mark payment failed
      await supabase
        .from("payments")
        .update({ status: "failed" })
        .eq("razorpay_order_id", razorpay_order_id);

      return res.status(400).json({ ok: false, error: "Invalid signature" });
    }

    // 1) Update payment as 'paid'
    const { error: payError } = await supabase
      .from("payments")
      .update({
        status: "paid",
        razorpay_payment_id,
        paid_at: nowISO(),
      })
      .eq("razorpay_order_id", razorpay_order_id);

    if (payError) {
      console.error("update payments error:", payError);
      return res
        .status(500)
        .json({ ok: false, error: "Failed to update payment" });
    }

    // 2) Grant access: profiles.has_access = true
    const { error: profError } = await supabase
      .from("profiles")
      .update({ has_access: true })
      .eq("id", user_id);

    if (profError) {
      console.error("update profiles error:", profError);
      // still return success for payment, but log error
    }

    return res.json({ ok: true });
  } catch (err) {
    console.error("payment/verify exception:", err);
    res.status(500).json({ ok: false, error: "Server error/verify" });
  }
});


app.get("/api/profile", async (req, res) => {
  try {
    const { user_id } = req.query;

    if (!user_id) {
      return res
        .status(400)
        .json({ ok: false, error: "user_id is required" });
    }

    const { data, error } = await supabase
      .from("profiles")
      .select("id, full_name, phone, has_access")
      .eq("id", user_id)
      .maybeSingle();

    if (error) {
      console.error("profile query error:", error);
      return res
        .status(500)
        .json({ ok: false, error: "Failed to fetch profile" });
    }

    if (!data) {
      return res
        .status(404)
        .json({ ok: false, error: "Profile not found" });
    }

    return res.json({ ok: true, profile: data });
  } catch (err) {
    console.error("/api/profile exception:", err);
    res.status(500).json({ ok: false, error: "Server error/profile" });
  }
});



app.listen(PORT, () => console.log(`Server running on ${PORT}`));