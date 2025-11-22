// src/App.jsx
import { Routes, Route } from "react-router-dom";
import HomePage from "./pages/home.jsx";
import ProgressPage from "./pages/problems.jsx";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/problems" element={<ProgressPage />} />
    </Routes>
  );
}
