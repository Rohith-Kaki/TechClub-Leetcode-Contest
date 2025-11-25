import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import googlelogo from "../assets/googlelogo.png";
import clublogo from "../assets/Club_logo_white.png"; // Assuming you use the logo here too

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState(null);
  const [inputErrors, setInputErrors] = useState({});

  // Helper functions for validation
  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  async function handleSubmit(e) {
    e.preventDefault();
    setApiError(null);
    setInputErrors({});

    // --- Manual Validation Logic ---
    const errors = {};
    if (!email.trim()) errors.email = "Email is required.";
    else if (!validateEmail(email)) errors.email = "Enter a valid email address.";
    if (!password) errors.password = "Password is required.";
    else if (password.length < 6) errors.password = "Password must be at least 6 characters.";

    if (Object.keys(errors).length > 0) {
      setInputErrors(errors);
      return;
    }
    // --- End of Validation Logic ---

    setLoading(true);

    try {
      // Supabase sign-in logic for email/password
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      // Redirect after successful email/password login
      navigate("/problems", { replace: true }); 

    } catch (err) {
      console.error("login error:", err);
      setApiError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleAuth() {
    try {
      await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          // Point this to your local route that uses AuthCallbackPage
          redirectTo: `${window.location.origin}/auth-callback`, 
        },
      });
      // Supabase handles the redirect away from this page
    } catch (err) {
      console.error("Google auth exception:", err);
    }
  }

  return (
    <>
      {/* Top Left: Home Link (You can add these here if you want them on login page too) */}
      <div className="fixed top-2 left-2 px-4 pt-4 z-50">
        <Link
          to="/"
          className="px-4 py-2 rounded-2xl bg-black border-[#673de6] text-white text-lg font-dm-sans font-extrabold hover:bg-[#673de6]"
        >
          ← Home
        </Link>
      </div>


      <div className="fixed right-2 px-4 -top-2 z-40">
        <img src={clublogo} alt="Club Logo" className="h-24 w-auto" />
      </div>

      <div className="min-h-screen font-dm-sans flex items-center justify-center bg-black text-white">
        <form
          onSubmit={handleSubmit}
          className="bg-[#111] p-6 rounded-xl w-full max-w-md space-y-4"
        >
          <h1 className="text-2xl font-bold">Login</h1>

          {/* Email Input with Validation */}
          <div>
            <label className="block text-md mb-1">Email</label>
            <input
              type="email"
              required
              className={`w-full px-3 py-2 rounded-md bg-black border ${
                inputErrors.email ? "border-red-500" : "border-gray-700"
              }`}
              value={email}
              onChange={(e) => setEmail(e.target.value.trim())}
            />
            {inputErrors.email && <p className="text-red-400 text-sm mt-1">{inputErrors.email}</p>}
          </div>

          {/* Password Input with Validation */}
          <div>
            <label className="block text-md mb-1">Password</label>
            <input
              type="password"
              required
              className={`w-full px-3 py-2 rounded-md bg-black border ${
                inputErrors.password ? "border-red-500" : "border-gray-700"
              }`}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            {inputErrors.password && <p className="text-red-400 text-sm mt-1">{inputErrors.password}</p>}
          </div>

          <p className="text-sm mt-2 text-right">
            <a
              href="/forgot-password" // Assuming you have this route
              className="text-purple-400 hover:underline"
            >
              Forgot password?
            </a>
          </p>

          {apiError && <p className="text-red-400 text-sm">{apiError}</p>}

          <p className="text-sm text-gray-400 mt-4 text-center">
            Signed up with Google? Use the 'Continue with Google' button below.
          </p>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 rounded-md font-bold hover:bg-[#673de6] bg-white hover:text-white text-black disabled:opacity-50 transition duration-300"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
          <button
            type="button"
            onClick={handleGoogleAuth}
            className="w-full py-2 rounded-md font-bold disabled:opacity-50 hover:bg-[#673de6] hover:text-white text-black bg-white flex items-center justify-center gap-2 transition duration-300 active:bg-purple-800 active:scale-95"
          >
            <img src={googlelogo} alt="" className="w-10 h-6" />
            <span>Continue with Google</span>
          </button>
        </form>
      </div>
    </>
  );
}
