import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function AuthCallbackPage() {
  const navigate = useNavigate();
  const { user, loading, hasAccess, loadingProfile } = useAuth();

  useEffect(() => {
    // Wait until both auth & profile status are known
    if (loading || loadingProfile) return;

    // If no user after callback → auth failed → go to login
    if (!user) {
      navigate("/login", { replace: true });
      return;
    }

    // If user exists, decide based on hasAccess
    if (hasAccess) {
      navigate("/problems", { replace: true });
    } else {
      navigate("/payment", { replace: true });
    }
  }, [user, loading, hasAccess, loadingProfile, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white">
      <p>Finishing sign-in...</p>
    </div>
  );
}
