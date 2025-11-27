import { useState, useRef, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import clublogo from "../assets/Club_logo_white.png";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";

export function Navbar() {
  const location = useLocation();
  const isLeaderboard = location.pathname === "/leaderboard";
  const isProblems = location.pathname === "/problems";

  const defaultButtonClass = `h-[45px] px-4 font-dm-sans rounded-lg font-bold flex md:text-base items-center justify-center transition-colors duration-400`;
  const activeButtonClass = `bg-white text-black`;
  const inactiveButtonClass = `bg-transparent text-white hover:bg-white hover:text-black`;

  return (
    <>
      <header className="w-full bg-[#000000] px-4 md:px-14 py-3 h-24 flex items-center gap-4">
        <Link
          to="/problems"
          className={`${defaultButtonClass} ${
            isProblems ? activeButtonClass : inactiveButtonClass
          }`}
        >
          <span className="relative z-10">Problems</span>
        </Link>

        <Link
          to="/leaderboard"
          className={`${defaultButtonClass} ${
            isLeaderboard ? activeButtonClass : inactiveButtonClass
          }`}
        >
          <span className="relative z-10">Leaderboard</span>
        </Link>

        <div className="ml-auto">
          <img src={clublogo} alt="Club Logo" className="h-30 w-auto" />
        </div>
      </header>
    </>
  );
}

function Bar({ percent = 0 }) {
  // clamp percent between 0 and 100 and protect NaN
  const p = Number.isFinite(percent)
    ? Math.max(0, Math.min(100, Math.round(percent)))
    : 0;
  return (
    <div className="w-full bg-white h-1.5 rounded-full overflow-hidden mt-1">
      <div
        className="h-full bg-[#673de6] rounded-full"
        style={{ width: `${p}%` }}
      />
    </div>
  );
}

export function ProgressBar({
  totalSolved = 0,
  totalProblems = 0,
  easySolved = 0,
  easyTotal = 0,
  mediumSolved = 0,
  mediumTotal = 0,
  hardSolved = 0,
  hardTotal = 0,
}) {
  const totalPercent =
    totalProblems > 0 ? Math.round((totalSolved / totalProblems) * 100) : 0;
  const easyPercent = easyTotal > 0 ? (easySolved / easyTotal) * 100 : 0;
  const mediumPercent =
    mediumTotal > 0 ? (mediumSolved / mediumTotal) * 100 : 0;
  const hardPercent = hardTotal > 0 ? (hardSolved / hardTotal) * 100 : 0;

  return (
    <>
      <div className="border-b-2 border-gray-700 max-w-full"></div>
      <div className="max-w-full z-40 bg-[#121212]">
        <div className="bg-black p-6 px-8 flex items-center justify-between text-white">
          {/* Total Progress (left) */}
          <div className="flex items-center gap-4 bg-[#1E1E1E] p-4 rounded-lg mr-2">
            <div className="gap-16 flex items-center">
              <div>
                <div className="text-mb font-extraboldfont-dm-sans text-white">
                  Total Progress
                </div>
                <div className="text-xl text-white font-dm-sans font-bold">
                  {totalSolved} / {totalProblems}
                </div>
              </div>

              {/* Circular progress indicator (fills according to totalPercent) */}
              <div className="relative w-16 h-16">
                {/* compute circle values */}
                {(() => {
                  const radius = 14; // radius in viewBox units
                  const stroke = 3.5; // stroke width
                  const normalizedRadius = radius;
                  const circumference = 2 * Math.PI * normalizedRadius;
                  // clamp percent 0..100
                  const pct =
                    totalPercent && Number.isFinite(totalPercent)
                      ? Math.max(0, Math.min(100, totalPercent))
                      : 0;
                  const dashoffset =
                    circumference - (pct / 100) * circumference;

                  // Render SVG using the computed values
                  return (
                    <svg
                      height="100%"
                      width="100%"
                      viewBox={`0 0 ${radius * 2 + stroke} ${
                        radius * 2 + stroke
                      }`}
                      className="block"
                      aria-hidden
                    >
                      {/* Center translate so stroke sits inside viewbox */}
                      <g transform={`translate(${stroke / 2}, ${stroke / 2})`}>
                        {/* Track / background circle */}
                        <circle
                          stroke="#2b2b2b"
                          fill="transparent"
                          strokeWidth={stroke}
                          r={normalizedRadius}
                          cx={normalizedRadius}
                          cy={normalizedRadius}
                        />
                        {/* Progress arc */}
                        <circle
                          stroke="#673de6"
                          fill="transparent"
                          strokeWidth={stroke}
                          strokeLinecap="round"
                          r={normalizedRadius}
                          cx={normalizedRadius}
                          cy={normalizedRadius}
                          strokeDasharray={`${circumference} ${circumference}`}
                          strokeDashoffset={dashoffset}
                          style={{ transition: "stroke-dashoffset 300ms ease" }}
                          transform={`rotate(-90 ${normalizedRadius} ${normalizedRadius})`} // start at top
                        />
                      </g>
                    </svg>
                  );
                })()}

                <div className="absolute inset-0 flex items-center justify-center text-sm">
                  {totalPercent}%
                </div>
              </div>
            </div>
          </div>

          {/* Easy */}
          <div className="flex-1 px-6 border-l border-gray-700">
            <div className="text-md text-white font-bold font-dm-sans">
              Easy
            </div>
            <div className="font-semibold text-xl text-[#DCDCDC] font-dm-sans">
              {easySolved} / {easyTotal}{" "}
              <span className="text-gray-400">completed</span>
            </div>
            <Bar percent={easyPercent} />
          </div>

          {/* Medium */}
          <div className="flex-1 px-6 border-l border-gray-700">
            <div className="text-md text-white font-bold font-dm-sans">
              Medium
            </div>
            <div className="font-semibold text-xl text-[#DCDCDC] font-dm-sans">
              {mediumSolved} / {mediumTotal}{" "}
              <span className="text-gray-400">completed</span>
            </div>
            <Bar percent={mediumPercent} />
          </div>

          {/* Hard */}
          <div className="flex-1 px-6 border-l border-gray-700">
            <div className="text-md text-white font-bold font-dm-sans">
              Hard
            </div>
            <div className="font-semibold text-xl text-[#DCDCDC] font-dm-sans">
              {hardSolved} / {hardTotal}{" "}
              <span className="text-gray-400">completed</span>
            </div>
            <Bar percent={hardPercent} />
          </div>
        </div>
      </div>
      <div className="border-b-2 border-gray-700 max-w-full"></div>
    </>
  );
}

function Chevron({ open }) {
  return (
    <svg
      className={`w-5 h-5 text-white transform transition-transform duration-200 ${
        open ? "rotate-90" : "rotate-0"
      }`}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <polyline points="9 18 15 12 9 6" />
    </svg>
  );
}

async function apiStart(userId, problemId) {
  try {
    const res = await fetch(`${API_BASE_URL}/api/progress/start`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: userId, problem_id: problemId }),
    });
    return await res.json();
  } catch (err) {
    console.error("start API error:", err);
  }
}

async function apiFinish(userId, problemId) {
  try {
    const res = await fetch(`${API_BASE_URL}/api/progress/finish`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: userId, problem_id: problemId }),
    });
    const json = await res.json();
    if (!json.ok) {
      console.error("finish error:", json.error);
    }
    return json;
  } catch (err) {
    console.error("finish API error:", err);
  }
}

function WeekItem({
  title,
  count,
  problems,
  isOpen,
  onToggle,
  checkedCount,
  checkedMap,
  onToggleProblem,
  id,
}) {
  const contentRef = useRef(null);
  const [maxHeight, setMaxHeight] = useState(0);

  useEffect(() => {
    const el = contentRef.current;
    if (!el) return;
    if (isOpen) {
      setMaxHeight(el.scrollHeight);
      const handleResize = () => setMaxHeight(el.scrollHeight);
      window.addEventListener("resize", handleResize);
      return () => window.removeEventListener("resize", handleResize);
    } else {
      setMaxHeight(0);
    }
  }, [isOpen]);

  const percent = count > 0 ? Math.round((checkedCount / count) * 100) : 0;

  return (
    <div>
      <button
        onClick={onToggle}
        className="w-full h-20 text-left bg-black px-12 py-4 flex items-center justify-between hover:bg-[#222] cursor-pointer"
        type="button"
        aria-expanded={isOpen}
        aria-controls={`week-content-${id}`}
      >
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-6 h-6">
            <Chevron open={isOpen} />
          </div>
          <span className="text-white font-bold text-lg font-dm-sans">
            {title}
          </span>
        </div>

        <div className="flex items-center gap-4">
          <div className="w-40 h-2 bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-[#673de6] rounded-full transition-all"
              style={{ width: `${percent}%` }}
            />
          </div>
          <span className="text-white text-sm">
            {checkedCount} / {count}
          </span>
        </div>
      </button>

      <div
        id={`week-content-${id}`}
        className="bg-black border-b border-gray-800 px-4 overflow-hidden"
        style={{
          maxHeight: `${maxHeight}px`,
          transition: "max-height 320ms cubic-bezier(.2,.8,.2,1)",
        }}
        aria-hidden={!isOpen}
      >
        <div ref={contentRef} className="max-w-7xl mx-auto py-4">
          <div className="grid grid-cols-[80px_1fr_120px] items-center gap-4 px-6 py-3 bg-[#1E1E1E] text-white font-dm-sans font-medium text-sm rounded-md">
            <div>Status</div>
            <div className="flex items-center gap-3">
              <span>Problem</span>
            </div>
            <div className="text-right">Difficulty</div>
          </div>

          <div>
            {problems.map((p, i) => (
              <div
                key={p.id}
                className="grid grid-cols-[80px_1fr_120px] items-center gap-4 px-6 py-4"
              >
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    aria-label={`status-${id}-${i}`}
                    checked={!!checkedMap[i]}
                    // only allow checking if not already solved
                    onChange={() => {
                      if (!checkedMap[i]) {
                        onToggleProblem(p, i);
                      }
                    }}
                    className="w-4 h-4 text-orange-500 bg-gray-900 border-gray-700 rounded focus:ring-0"
                  />
                </div>

                {/* CLICKABLE TITLE: opens p.link in a new tab if present */}
                <div className="text-white font-medium font-dm-sans">
                  {p.link ? (
                    <a
                      href={p.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-medium hover:underline text-lg"
                      onClick={(e) => {
                        e.preventDefault();
                        if (p.onClick) p.onClick();
                      }}
                    >
                      {p.title}
                    </a>
                  ) : (
                    <div className="font-medium text-lg">{p.title}</div>
                  )}

                  {p.subtitle && (
                    <div className="text-xs text-white mt-1">{p.subtitle}</div>
                  )}
                </div>

                <div className="flex justify-end">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      p.difficulty === "Easy"
                        ? "bg-green-900 text-green-300"
                        : p.difficulty === "Medium"
                        ? "bg-yellow-900 text-yellow-300"
                        : "bg-red-900 text-red-300"
                    }`}
                  >
                    {p.difficulty}
                  </span>
                </div>
              </div>
            ))}

            {problems.length === 0 && (
              <div className="px-6 py-6 text-gray-400">
                No problems available for this week.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function groupProblemsByWeek(problems, solvedIds = new Set()) {
  const map = new Map();

  problems.forEach((p) => {
    const weekNum = p.week ?? 0;

    if (!map.has(weekNum)) {
      const topic = p.topic_name; 
      let title = weekNum === 0 ? "Unassigned Week" : `Week ${weekNum}`;
      if (topic) {
        title += ` - ${topic}`;
      }

      map.set(weekNum, {
        week: weekNum,
        title: title,
        problems: [],
      });
    }

    const normalizedDifficulty =
      p.difficulty === "easy"
        ? "Easy"
        : p.difficulty === "medium"
        ? "Medium"
        : p.difficulty === "hard"
        ? "Hard"
        : p.difficulty;

    map.get(weekNum).problems.push({
      id: p.id,
      title: p.title,
      difficulty: normalizedDifficulty,
      link: p.link,
      position: p.position ?? 0,
    });
  });

  const weeksArray = Array.from(map.values()).sort((a, b) => a.week - b.week);

  return weeksArray.map((w) => ({
    title: w.title,
    count: w.problems.length,
    problems: w.problems.sort((a, b) => a.position - b.position),
    // checked if problem id is in solvedIds
    checked: w.problems.map((p) => solvedIds.has(p.id)),
  }));
}

export function Week() {
  const { user, loading: authLoading } = useAuth();
  const [openIndex, setOpenIndex] = useState(null);
  const [weeksState, setWeeksState] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // fetch problems + solved list
  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setError("You must be logged in to view problems.");
      setLoading(false);
      return;
    }

    async function fetchData() {
      try {
        setLoading(true);
        setError(null);

        // 1) get problems
        const problemsRes = await fetch(`${API_BASE_URL}/api/problems`);
        const problemsJson = await problemsRes.json();
        if (!problemsJson.ok) {
          throw new Error(problemsJson.error || "Failed to fetch problems");
        }
        const problems = problemsJson.problems || [];

        // 2) get solved problem ids for this user
        const progressRes = await fetch(
          `${API_BASE_URL}/api/progress/solved?user_id=${user.id}`
        );
        const progressJson = await progressRes.json();
        if (!progressJson.ok) {
          throw new Error(progressJson.error || "Failed to fetch progress");
        }
        const solvedIds = new Set(progressJson.solvedProblemIds || []);

        // 3) build weeksState with checked[] based on solvedIds
        const groupedWeeks = groupProblemsByWeek(problems, solvedIds);
        setWeeksState(groupedWeeks);
      } catch (err) {
        console.error("fetch problems/progress error:", err);
        setError(err.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [authLoading, user]);

  const toggleProblem = async (problem, weekIndex, probIndex) => {
    if (!user) return;

    // update UI immediately
    setWeeksState((prev) =>
      prev.map((w, wi) => {
        if (wi !== weekIndex) return w;
        const newChecked = [...w.checked];
        newChecked[probIndex] = true; // one-way: false -> true
        return { ...w, checked: newChecked };
      })
    );

    // call finish API
    const result = await apiFinish(user.id, problem.id);
    if (result?.flagged) {
      console.warn("Solve flagged as suspicious:", result);
      // optional: show toast / warning
    }
  };

  // Totals for ProgressBar
  let easyTotal = 0,
    mediumTotal = 0,
    hardTotal = 0;
  let easySolved = 0,
    mediumSolved = 0,
    hardSolved = 0;

  weeksState.forEach((week) => {
    week.problems.forEach((p, pi) => {
      if (p.difficulty === "Easy") easyTotal++;
      else if (p.difficulty === "Medium") mediumTotal++;
      else hardTotal++;

      if (week.checked[pi]) {
        if (p.difficulty === "Easy") easySolved++;
        else if (p.difficulty === "Medium") mediumSolved++;
        else hardSolved++;
      }
    });
  });

  const totalProblems = easyTotal + mediumTotal + hardTotal;
  const totalSolved = easySolved + mediumSolved + hardSolved;

  return (
    <div className="max-w-full mx-auto">
      <ProgressBar
        totalSolved={totalSolved}
        totalProblems={totalProblems}
        easySolved={easySolved}
        easyTotal={easyTotal}
        mediumSolved={mediumSolved}
        mediumTotal={mediumTotal}
        hardSolved={hardSolved}
        hardTotal={hardTotal}
      />

      <div className="bg-black overflow-hidden">
        {(loading || authLoading) && (
          <div className="px-6 py-4 text-gray-400 text-center">Loading...</div>
        )}

        {!loading && !authLoading && error && (
          <div className="px-6 py-4 text-red-400 text-sm text-center">{error}</div>
        )}

        {!loading &&
          !authLoading &&
          !error &&
          weeksState.map((w, idx) => {
            const checkedCount = w.checked.filter(Boolean).length;
            return (
              <WeekItem
                key={idx}
                id={idx}
                title={w.title}
                count={w.problems.length}
                problems={w.problems.map((p, i) => ({
                  ...p,
                  // wrap click to record start
                  onClick: () => {
                    if (p.link && user) {
                      apiStart(user.id, p.id);
                      window.open(p.link, "_blank", "noopener,noreferrer");
                    }
                  },
                }))}
                isOpen={openIndex === idx}
                onToggle={() => setOpenIndex(openIndex === idx ? null : idx)}
                checkedCount={checkedCount}
                checkedMap={w.checked}
                onToggleProblem={(problem, probIndex) =>
                  toggleProblem(problem, idx, probIndex)
                }
              />
            );
          })}
      </div>
    </div>
  );
}
