import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function AuthCallbackPage() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading) {
      if (user) {
        // later we can decide: /payment or /problems based on has_access
        navigate("/payment", { replace: true });
      } else {
        navigate("/payment", { replace: true });
      }
    }
  }, [user, loading, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white">
      <p>Finishing sign-in...</p>  
    </div>
  );
}
