import React, { useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useNavigate, Link } from "react-router-dom";
import clublogo from "../assets/Club_logo_white.png";

export default function UpdatePasswordPage() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [status, setStatus] = useState({
    loading: false,
    msg: null,
    err: null,
  });

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus({ loading: true, msg: null, err: null });

    if (password !== confirm) {
      setStatus({
        loading: false,
        msg: null,
        err: "Passwords do not match",
      });
      return;
    }

    try {
      const { error } = await supabase.auth.updateUser({
        password: password,
      });

      if (error) throw error;

      setStatus({
        loading: false,
        msg: "Password updated successfully!",
        err: null,
      });

      setTimeout(() => navigate("/login"), 1500);
    } catch (err) {
      console.error("updateUser password error:", err);
      setStatus({ loading: false, msg: null, err: err.message });
    }
  }

  return (
    <>
      <div className="fixed right-2 px-4 -top-4 z-40">
        <img src={clublogo} alt="Club Logo" className="h-30 w-auto" />
      </div>
      <div className="min-h-screen flex items-center justify-center bg-black text-white font-dm-sans">
        <div className="bg-[#111] p-6 rounded-xl w-full max-w-md space-y-4">
          <h1 className="text-2xl font-bold">Set New Password</h1>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-md mb-1">New Password</label>
              <input
                type="password"
                required
                className="w-full px-3 py-2 bg-black border border-gray-700 rounded-md"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-md mb-1">Confirm Password</label>
              <input
                type="password"
                required
                className="w-full px-3 py-2 bg-black border border-gray-700 rounded-md"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
              />
            </div>

            {status.err && <p className="text-red-400 text-sm">{status.err}</p>}
            {status.msg && (
              <p className="text-green-400 text-sm">{status.msg}</p>
            )}

            <button
              type="submit"
              disabled={status.loading}
              className="w-full py-2 font-bold hover:bg-[#673de6] hover:text-white text-black bg-white rounded-md disabled:opacity-50"
            >
              {status.loading ? "Updating..." : "Update Password"}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
