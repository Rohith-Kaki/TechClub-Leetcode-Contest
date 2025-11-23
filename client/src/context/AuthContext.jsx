import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);   // supabase user
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let ignore = false;

    async function loadUser() {
      const { data, error } = await supabase.auth.getUser();
      if (!ignore) {
        if (error) {
          console.error("getUser error:", error);
          setUser(null);
        } else {
          setUser(data?.user ?? null);
        }
        setLoading(false);
      }
    }

    loadUser();

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      ignore = true;
      sub.subscription.unsubscribe();
    };
  }, []);

  const value = {
    user,
    loading,
    signOut: async () => {
      await supabase.auth.signOut();
      setUser(null);
    },
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
