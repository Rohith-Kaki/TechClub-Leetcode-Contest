import { Link, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import clublogo from "../assets/Club_logo_white.png";


export function Navbar() {
  const location = useLocation();
  // Determines if the current path is exactly '/leaderboard'
  const isLeaderboard = location.pathname === "/leaderboard";
  // Determines if the current path is exactly '/problems'
  const isProblems =
    location.pathname === "/problems" || location.pathname === "/"; // Assuming root path is also problems

  // Base styling for inactive/default button
  const defaultButtonClass = `h-[45px] px-4 font-dm-sans rounded-lg font-bold flex md:text-base items-center justify-center transition-colors duration-400`;

  // Styling for the active (selected) button
  const activeButtonClass = `bg-white text-black`;

  // Styling for the inactive button
  const inactiveButtonClass = `bg-transparent text-white hover:bg-white hover:text-black`;

  return (
    <>
      <header className="w-full bg-[#000000] px-4 md:px-14 py-3 h-24 flex items-center gap-4">
        {/* PROBLEMS LINK */}
        <Link
          to="/problems"
          className={`${defaultButtonClass} ${
            isProblems ? activeButtonClass : inactiveButtonClass
          }`}
        >
          <span className="relative z-10">Problems</span>
        </Link>

        {/* LEADERBOARD LINK */}
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
      {/* This divider line uses the purple border from your original code */}
      <div className="max-w-full border-b-2 px-6 border-gray-700"></div>
    </>
  );
}

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";

// --- LOADER COMPONENT ---
// A simple component to show while fetching data.
const Loader = () => (
  <div className="flex justify-center items-center py-8">
    <svg
      className="animate-spin h-5 w-5 text-[#673de6]"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-50"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      ></circle>
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      ></path>
    </svg>
    <p className="ml-3 text-sm text-slate-400">Loading leaderboard data...</p>
  </div>
);
// --- END LOADER COMPONENT ---

export function Leaderboard() {
  const { user, loading: authLoading } = useAuth();
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setError("You must be logged in to view leaderboard.");
      setLoading(false);
      return;
    }

    async function fetchLeaderboard() {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch(`${API_BASE_URL}/api/leaderboard`);

        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }

        const json = await res.json();

        if (json.ok !== true) {
          throw new Error(
            json.error || "Failed to fetch leaderboard: Backend error"
          );
        }

        const rows = json.leaderboard || [];
        setLeaderboard(rows);
      } catch (err) {
        console.error("fetch leaderboard error:", err);
        setError(err.message || "Something went wrong during data fetching");
      } finally {
        setLoading(false);
      }
    }

    fetchLeaderboard();
  }, [authLoading, user]);

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-7xl mx-auto p-4 md:p-8 ">
        {/* Primary heading using Tailwind's purple for accent */}
        <h1 className="text-6xl font-bold mb-6 text-[#673de6] font-stack-notch text-center">
          LeaderBoard
        </h1>

        {/* --- STATE RENDERING --- */}
        {error && <p className="text-red-400 text-sm mb-4">Error: {error}</p>}

        {/* Use the Loader component while loading */}
        {loading && <Loader />}

        {!loading && !error && leaderboard.length === 0 && (
          <p className="text-slate-400 text-sm">
            No solves yet. Start solving problems!
          </p>
        )}

        {/* Leaderboard Table */}
        {!loading && !error && leaderboard.length > 0 && (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm border-separate border-spacing-y-1">
              <thead>
                <tr className="uppercase font-roboto font-bold tracking-widest text-white">
                  <th className="px-4 py-3 text-left">Rank</th>
                  <th className="px-4 py-3 text-left">Name</th>
                  <th className="px-4 py-3 text-center">Total Solved</th>
                </tr>
              </thead>
              <tbody>
                {leaderboard.map((row, index) => {
                  const isMe = row.user_id === user.id;
                  return (
                    <tr
                      key={row.user_id}
                      className={
                        // Base row styling and separator
                        `rounded-2xl overflow-hidden transition-colors duration-300
                        ${
                          isMe
                            ? //Current User highlight
                              "bg-[#673de6] text-white shadow-lg"
                            : // Alternate row colors for dark theme
                              "bg-black text-white"
                        }`
                      }
                    >
                      <td
                        className={`font-roboto ${
                          index + 1 < 4 ? "px-4 py-3" : "px-4 py-3"
                        }`}
                      >
                        {index + 1 < 4 ? (
                          // Circle style for ranks 1, 2, 3
                          <span className="inline-flex items-center justify-center h-10 w-10 rounded-full bg-white text-black font-extrabold text-base font-roboto">
                            {index + 1}
                          </span>
                        ) : (
                          // Default style for other ranks
                          <span className="text-lg inline-flex items-center justify-center h-10 w-10 rounded-full bg-black text-white font-roboto">
                            {index + 1}
                          </span>
                        )}
                      </td>

                      <td className="px-4 py-3 font-normal text-sm">
                        {/* updated with name instead of id */}
                        {row.full_name}
                        {isMe && (
                          <span className="ml-3 text-sm text-white font-bold">
                            (You)
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 font-semibold text-center">
                        {row.total_solved}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
