// src/App.jsx
import { Routes, Route } from "react-router-dom";
import HomePage from "./pages/home.jsx";
import LeaderBoard from "./pages/leaderboard.jsx"
import ProgressPage from "./pages/problems.jsx";
import RulesPage from "./pages/rules.jsx";  


export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage/>} />
      <Route path="/leaderboard" element={<LeaderBoard/>} />
      <Route path="/problems" element={<ProgressPage />} />
      <Route path="/rules" element={<RulesPage />} />
    </Routes>
  );
}
