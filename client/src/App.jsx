import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";

import HomePage from "./pages/home.jsx";
import LeaderBoard from "./pages/leaderboard.jsx";
import ProgressPage from "./pages/problems.jsx";
import RulesPage from "./pages/rules.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import SignupPage from "./pages/SignupPage.jsx";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import UpdatePasswordPage from "./pages/UpdatePasswordPage";
import AuthCallbackPage from "./pages/AuthCallbackPage.jsx";
import PaymentPage from "./pages/PaymentPage";
import ProtectedRoutePaid from "./components/ProtectedRoutePaid";

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/rules" element={<RulesPage />} />

        <Route path="/signup" element={<SignupPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/payment" element={<PaymentPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/update-password" element={<UpdatePasswordPage />} />
        <Route path="/auth-callback" element={<AuthCallbackPage />} />
        <Route
          path="/problems"
          element={
            <ProtectedRoutePaid>
              <ProgressPage />
            </ProtectedRoutePaid>
          }
        />
        <Route
          path="/leaderboard"
          element={
            <ProtectedRoutePaid>
              <LeaderBoard />
            </ProtectedRoutePaid>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  );
}
