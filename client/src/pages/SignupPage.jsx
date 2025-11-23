import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";

export default function SignupPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) throw error;

      const user = data.user;
      if (user) {
        const { error: profileError } = await supabase
          .from("profiles")
          .update({
            full_name: fullName || null,
            phone: phone || null,
          })
          .eq("id", user.id);

        if (profileError) {
          console.error("profile update error:", profileError);
        }
      }

      navigate("/problems");
    } catch (err) {
      console.error("signup error:", err);
      setError(err.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <div className="fixed top-2 left-2 px-4 pt-4 x-40">
        <Link
          to="/"
          className="px-4 py-2 rounded-2xl bg-black border-[#673de6] text-white text-lg font-dm-sans font-extrabold hover:bg-[#673de6]"
        >
          ← Home
        </Link>
      </div>
      <div className="min-h-screen font-dm-sans flex items-center justify-center bg-black text-white">
        <form
          onSubmit={handleSubmit}
          className="bg-[#111] p-6 rounded-xl w-full max-w-md space-y-4"
        >
          <h1 className="text-2xl font-bold ">Sign Up</h1>

          <div>
            <label className="block text-sm mb-1">Full Name</label>
            <input
              className="w-full px-3 py-2 rounded-md bg-black border border-gray-700"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm mb-1">Phone Number</label>
            <input
              type="tel"
              className="w-full px-3 py-2 rounded-md bg-black border border-gray-700 text-white"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm mb-1">Email</label>
            <input
              type="email"
              required
              className="w-full px-3 py-2 rounded-md bg-black border border-gray-700"
              value={email}
              onChange={(e) => setEmail(e.target.value.trim())}
            />
          </div>

          <div>
            <label className="block text-sm mb-1">Password</label>
            <input
              type="password"
              required
              minLength={6}
              className="w-full px-3 py-2 rounded-md bg-black border border-gray-700"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {error && <p className="text-red-400 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 rounded-md bg-purple-600 hover:bg-purple-700 disabled:opacity-50"
          >
            {loading ? "Signing up..." : "Signup"}
          </button>
        </form>
      </div>
    </>
  );
}
