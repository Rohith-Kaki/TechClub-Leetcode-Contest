import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

const AuthContext = createContext(null);
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);          // Supabase user
  const [loading, setLoading] = useState(true);    // auth loading
  const [profile, setProfile] = useState(null);    // profiles row data
  const [loadingProfile, setLoadingProfile] = useState(false); // profile loading status

  // --- Helper to load profile data for a user id ---
  async function fetchProfile(userId) {
    if (!userId) {
      setProfile(null);
      return;
    }
    setLoadingProfile(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/profile?user_id=${userId}`);
      const json = await res.json();
      if (json.ok && json.profile) {
        setProfile(json.profile);
      } else {
        console.error("fetchProfile error:", json.error || "Profile not found");
        setProfile(null);
      }
    } catch (err) {
      console.error("fetchProfile exception:", err);
      setProfile(null);
    } finally {
      setLoadingProfile(false);
    }
  }

  // --- Helper to update the full_name in the profiles table after OAuth sign-in ---
const updateProfileName = async (user) => {
  const meta = user?.user_metadata || {};
  const userName = meta.full_name || meta.name;

  if (!userName) return;

  try {
    const { error } = await supabase
      .from("profiles")
      .update({ full_name: userName })
      .eq("id", user.id);

    if (error) console.error("Error updating profile name:", error.message);
  } catch (err) {
    console.error("Profile update failed:", err);
  }
};


  useEffect(() => {
    let ignore = false;

    async function loadUserAndProfile() {
      const { data, error } = await supabase.auth.getUser();
      if (ignore) return;

      if (error || !data?.user) {
        setUser(null);
        setProfile(null);
        setLoading(false);
        return;
      }

      setUser(data.user);
      setLoading(false);
      // Fetch the profile immediately after knowing we have an auth user
      await fetchProfile(data.user.id);
    }

    loadUserAndProfile();

    const { data: sub } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        const u = session?.user ?? null;
        setUser(u);
        setProfile(null); // Clear profile until fetched

        if (u) {
          // Fetch profile after any auth state change
          await fetchProfile(u.id);

          // Update full_name in DB specifically on sign-in (for OAuth users)
          if (_event === "SIGNED_IN") {
            await updateProfileName(u);
          }
        }
      }
    );

    return () => {
      ignore = true;
      sub.subscription.unsubscribe();
    };
  }, []); // Empty dependency array means this runs once on mount

  // Combine all context values
  const value = {
    user,
    loading, // auth loading
    profile,
    loadingProfile,
    hasAccess: !!profile?.has_access, // Expose a derived value
    signOut: async () => {
      await supabase.auth.signOut();
      setUser(null);
      setProfile(null);
    },
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
