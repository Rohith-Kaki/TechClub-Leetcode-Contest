import React, { useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { Link } from "react-router-dom";
import clublogo from "../assets/Club_logo_white.png";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState({
    loading: false,
    msg: null,
    err: null,
  });
  const [inputErrors, setInputErrors] = useState({});

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus({ loading: true, msg: null, err: null });
    setInputErrors({});

    const errors = {};
    if (!email.trim()) errors.email = "Email is required.";
    else if (!validateEmail(email)) errors.email = "Enter a valid email address.";

    if (Object.keys(errors).length > 0) {
      setInputErrors(errors);
      setStatus({ loading: false, msg: null, err: null });
      return;
    }

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/update-password`,
      });

      if (error) throw error;

      setStatus({
        loading: false,
        msg: "Password reset link sent! Check your email.",
        err: null,
      });
    } catch (err) {
      console.error("resetPassword error:", err);
      setStatus({ loading: false, msg: null, err: err.message });
    }
  }

  return (
    <>
      <div className="fixed top-2 left-2 px-4 pt-4 x-40">
        <Link
          to="/login"
          className="px-4 py-2 rounded-2xl bg-black border-[#673de6] text-white text-lg font-dm-sans font-extrabold hover:bg-[#673de6]"
        >
          ← Login
        </Link>
      </div>
      <div className="fixed right-2 px-4 -top-2 z-40">
        <img src={clublogo} alt="Club Logo" className="h-30 w-aut0" />
      </div>
      <div className="min-h-screen flex items-center justify-center bg-black text-white font-dm-sans">
        <div className="bg-[#111] p-6 rounded-xl w-full max-w-md space-y-4">
          <h1 className="text-2xl font-bold">Forgot Password</h1>

          <p className="text-gray-400 text-md">
            Enter your email to receive a password reset link.
          </p>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <input
              type="email"
              required
              className={`w-full px-3 py-2 bg-black border rounded-md ${
                inputErrors.email ? "border-red-500" : "border-gray-700"
              }`}
              placeholder="your@email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            {inputErrors.email && (
              <p className="text-red-400 text-sm mt-1">{inputErrors.email}</p>
            )}

            {status.err && <p className="text-red-400 text-sm">{status.err}</p>}
            {status.msg && (
              <p className="text-green-400 text-sm">{status.msg}</p>
            )}

            <button
              type="submit"
              disabled={status.loading}
              className="w-full py-2 font-bold hover:bg-[#673de6] hover:text-white text-black bg-white rounded-md disabled:opacity-50"
            >
              {status.loading ? "Sending..." : "Send Reset Link"}
            </button>
          </form>
          <p className="text-xs text-gray-400 mt-4 text-center">
            Note: If you signed up using Google, you manage your password on their platform. Use their account recovery process and log in with the social button.
          </p>
        </div>
      </div>
    </>
  );
}
