import { Link } from "react-router-dom";
import clublogo from "../assets/Club_logo_white.png";

export function Rules() {
  const contestName = "";

  const rules = [
    {
      id: 1,
      title: "Contest Duration & Structure",
      body: "The contest runs across 7 weeks. Each week starts on Monday and covers a single focused topic (progressing from basics to advanced).",
    },
    {
      id: 2,
      title: "Weekly Teaching Session",
      body: "Every Monday we will host an offline class session explaining the week’s topic and sample problems.",
    },
    {
      id: 3,
      title: "Problem Solving Window",
      body: "After the Monday class, participants have the next six days (Tuesday → Sunday) to solve the weekly problems.",
    },
    {
      id: 4,
      title: "Access & Marking",
      body: "Clicking a problem records a start timestamp; marking it solved records an end timestamp. Duration helps validate legitimate solving.",
    },
    {
      id: 5,
      title: "Anti-Cheat / Time Validation",
      body: "Very short durations (for example, under 10 minutes) may be flagged for review and could result in disqualification upon verification.",
    },
    {
      id: 6,
      title: "Leaderboard & Ranking",
      body: "Ranking is by total problems solved; ties are broken by earliest completion time. Leaderboard updates live.",
    },
    {
      id: 7,
      title: "Final Selection & Interviews",
      body: "Top 10 after Week 7 will be shortlisted for 1-on-1 DSA interviews. Top 3 selected from interviews receive rewards and cash prizes.",
    },
    {
      id: 8,
      title: "Rewards",
      body: "Top 3 winners will receive the announced prizes. Winners will be contacted with instructions for claiming rewards.",
    },
    {
      id: 9,
      title: "No Refund Policy",
      body: "All registrations are final and non-refundable. Once the payment is completed, no refunds will be issued under any circumstances, including withdrawal, disqualification, or inability to participate.",
    },
    {
      id: 10,
      title: "Support & Queries",
      body: "For any queries, contact us at: technology.club@woxsen.edu.in.",
    },
  ];

  return (
    <div className="min-h-screen bg-black text-white">
      {/* TOP-LEFT BACK BUTTON */}
      <div className="fixed top-2 left-2 px-4 pt-4">
        <Link
          to="/"
          className="px-4 py-2 rounded-2xl bg-black border-[#673de6] text-white text-lg font-dm-sans font-extrabold hover:bg-[#673de6]"
        >
          ← Home
        </Link>
      </div>

      <div className="fixed right-2 px-4 -top-4 z-40">
        <img src={clublogo} alt="Club Logo" className="h-30" />
      </div>

      <main className="max-w-4xl mx-auto px-4 py-10">
        <div className="bg-slate-800  border-[#673de6]  border-5 rounded-lg p-6 shadow-sm">
          {/* Contest Title */}
          <h1 className="text-2xl md:text-3xl font-extrabold font-dm-sans text-white mb-6 text-center">
            {contestName} Contest Rules
          </h1>

          {/* Rule list */}
          <div className="mt-6 space-y-4 text-white">
            {rules.map((r) => (
              <div key={r.id}>
                <h3 className="font-bold font-dm-sans">
                  {r.id}. {r.title}
                </h3>
                <p className="text-sm font-dm-sans">{r.body}</p>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
