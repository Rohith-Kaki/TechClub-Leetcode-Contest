import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import clublogo from "../assets/Club_logo_white.png";
import googlelogo from "../assets/googlelogo.png";

export default function SignupPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState(null); // Use a distinct name for API errors
  const [inputErrors, setInputErrors] = useState({}); // State for input validation errors

  // Helper functions for validation
  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const validatePhone = (phone) => /^\d{10}$/.test(phone); // Basic 10-digit check

  async function handleSubmit(e) {
    e.preventDefault();
    setApiError(null);
    setInputErrors({}); // Clear previous input errors

    // --- Manual Validation Logic ---
    const errors = {};
    if (!fullName.trim()) errors.fullName = "Full Name is required.";
    if (phone && !validatePhone(phone))
      errors.phone = "Enter a valid 10-digit phone number.";
    if (!email.trim()) errors.email = "Email is required.";
    else if (!validateEmail(email))
      errors.email = "Enter a valid email address.";
    if (!password) errors.password = "Password is required.";
    else if (password.length < 6)
      errors.password = "Password must be at least 6 characters.";

    if (Object.keys(errors).length > 0) {
      setInputErrors(errors);
      return; // Stop the form submission
    }
    // --- End of Validation Logic ---

    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) throw error;

      const user = data.user;
      if (user) {
        // Update the profiles table after successful signup
        const { error: profileError } = await supabase
          .from("profiles")
          .update({
            full_name: fullName.trim() || null,
            phone: phone || null,
          })
          .eq("id", user.id);

        if (profileError) {
          console.error("profile update error:", profileError);
        }
      }

      // Redirect after successful email/password signup
      navigate("/payment");
    } catch (err) {
      console.error("signup error:", err);
      setApiError(err.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleAuth() {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth-callback`, // change naviagate to payments in auth-callback
        },
      });

      if (error) {
        console.error("Google auth error:", error);
      }
      // Supabase will redirect to Google then back to /auth/callback
    } catch (err) {
      console.error("Google auth exception:", err);
    }
  }

  return (
    <>
      <div className="fixed top-2 left-2 px-4 pt-4 z-50">
        <Link
          to="/"
          className="px-4 py-2 rounded-2xl bg-black border-[#673de6] text-white text-lg font-dm-sans font-extrabold hover:bg-[#673de6]"
        >
          ← Home
        </Link>
      </div>

      {/* Top Right: Club Logo (You can add these here if you want them on login page too) */}
      <div className="fixed right-2 px-4 -top-2 z-40">
        <img src={clublogo} alt="Club Logo" className="h-24 w-auto" />
      </div>

      <div className="min-h-screen font-dm-sans flex items-center justify-center bg-black text-white">
        <form
          onSubmit={handleSubmit}
          className="bg-[#111] p-6 rounded-xl w-full max-w-md space-y-4"
        >
          <h1 className="text-2xl font-bold ">Sign Up</h1>

          {/* Full Name Input with Validation */}
          <div>
            <label className="block text-md mb-1">Full Name</label>
            <input
              className={`w-full px-3 py-2 rounded-md bg-black border ${
                inputErrors.fullName ? "border-red-500" : "border-gray-700"
              }`}
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
            {inputErrors.fullName && (
              <p className="text-red-400 text-sm mt-1">
                {inputErrors.fullName}
              </p>
            )}
          </div>

          {/* Phone Number Input with Validation */}
          <div>
            <label className="block text-md mb-1">Phone Number</label>
            <input
              type="tel"
              className={`w-full px-3 py-2 rounded-md bg-black border ${
                inputErrors.phone ? "border-red-500" : "border-gray-700"
              }`}
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
            {inputErrors.phone && (
              <p className="text-red-400 text-sm mt-1">{inputErrors.phone}</p>
            )}
          </div>

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
            {inputErrors.email && (
              <p className="text-red-400 text-sm mt-1">{inputErrors.email}</p>
            )}
          </div>

          {/* Password Input with Validation */}
          <div>
            <label className="block text-md mb-1">Password</label>
            <input
              type="password"
              required
              minLength={6}
              className={`w-full px-3 py-2 rounded-md bg-black border ${
                inputErrors.password ? "border-red-500" : "border-gray-700"
              }`}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            {inputErrors.password && (
              <p className="text-red-400 text-sm mt-1">
                {inputErrors.password}
              </p>
            )}
          </div>

          {/* General API error display (e.g., "Email already registered") */}
          {apiError && <p className="text-red-400 text-sm">{apiError}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 rounded-md font-bold hover:bg-[#673de6] bg-white hover:text-white text-black disabled:opacity-50 transition duration-300"
          >
            {loading ? "Signing up..." : "Sign Up"}
          </button>

          <button
            type="button"
            onClick={handleGoogleAuth}
            className="w-full py-2 rounded-md font-bold disabled:opacity-50 hover:bg-[#673de6] hover:text-white text-black bg-white flex items-center justify-center gap-2 transition duration-300 active:bg-purple-800 active:scale-95"
          >
            <img src={googlelogo} alt="" className="w-10 h-6" />
            <span>Continue with Google</span>
          </button>
          <p className="text-xs text-gray-400 mt-4 text-center">
            Note: When signing up with Google, your password is managed entirely
            by Google account recovery.
          </p>
        </form>
      </div>
    </>
  );
}
