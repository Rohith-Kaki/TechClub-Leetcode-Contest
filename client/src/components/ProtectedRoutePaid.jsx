import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoutePaid({ children }) {
  const { user, loading, hasAccess, loadingProfile } = useAuth();

  // still loading auth or profile → show nothing or a loader
  if (loading || loadingProfile) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  // not logged in → go to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // logged in but not paid → go to payment
  if (!hasAccess) {
    return <Navigate to="/payment" replace />;
  }

  // logged in + paid → render the page
  return children;
}
