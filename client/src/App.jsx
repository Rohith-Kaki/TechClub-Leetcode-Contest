// src/App.jsx
import { Routes, Route } from "react-router-dom";
import HomePage from "./pages/home.jsx";
import LeaderBoard from "./pages/leaderboard.jsx"

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage/>} />
      <Route path="/leaderboard" element={<LeaderBoard/>} />
      {/* later you can add more routes here, like /login, /admin, etc. */}
    </Routes>
  );
}
