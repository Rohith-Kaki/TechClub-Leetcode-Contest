import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

const AuthContext = createContext(null);
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(false);

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

  const updateProfileName = async (user) => {
    const meta = user?.user_metadata || {};
    const userName = meta.full_name || meta.name;

    if (userName) {
      try {
        const { error } = await supabase
          .from("profiles")
          .update({ full_name: userName })
          .eq("id", user.id);

        if (error) console.error("Error updating profile name:", error.message);
      } catch (err) {
        console.error("Profile update failed:", err);
      }
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
      await fetchProfile(data.user.id);
    }

    loadUserAndProfile();

    const { data: sub } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        const u = session?.user ?? null;
        setUser(u);
        setProfile(null);

        if (u) {
          // update full_name on sign-in (for Google etc.)
          if (event === "SIGNED_IN") {
            await updateProfileName(u);
          }
          await fetchProfile(u.id);
        }
      }
    );

    return () => {
      ignore = true;
      sub.subscription.unsubscribe();
    };
  }, []);

  // NEW: function to let pages manually refresh profile after some action (like payment)
  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user.id);
    }
  };

  const value = {
    user,
    loading,
    profile,
    loadingProfile,
    hasAccess: !!profile?.has_access,
    refreshProfile,
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
