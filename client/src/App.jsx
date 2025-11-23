import React from "react";
import {Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";

import HomePage from "./pages/home.jsx";
import LeaderBoard from "./pages/leaderboard.jsx";
import ProgressPage from "./pages/problems.jsx";
import RulesPage from "./pages/rules.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import SignupPage from "./pages/SignupPage.jsx";

export default function App() {
  return (
    <AuthProvider>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/rules" element={<RulesPage />} />

          <Route path="/signup" element={<SignupPage />} />
          <Route path="/login" element={<LoginPage />} />

          <Route path="/leaderboard" element={<LeaderBoard />} />
          <Route path="/problems" element={<ProgressPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    </AuthProvider>
  );
}
