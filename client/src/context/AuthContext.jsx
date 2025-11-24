import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  //update fullname to profiles table after sign in
  const updateProfileName = async (user) => {
    const userName = user.user_metadata.full_name || user.user_metadata.name;

    if (userName) {
      try {
        // Update the 'profiles' table with the retrieved name
        const { error } = await supabase
          .from('profiles')
          .update({ full_name: userName })
          .eq('id', user.id); 

        if (error) console.error("Error updating profile name:", error.message);
        // else console.log("Profile name updated successfully for user:", user.email);

      } catch (err) {
        console.error("Profile update failed:", err);
      }
    }
  };


  useEffect(() => {
    let ignore = false;

    async function loadUser() {
      // Your existing loadUser logic
      const { data, error } = await supabase.auth.getUser();
      if (!ignore) {
        if (error) {
          console.error("getUser error:", error);
          setUser(null);
        } else {
          setUser(data?.user ?? null);
          // Optional: You could call updateProfileName(data.user) here too 
          // if you want to ensure it runs even on initial page load for Google users
        }
        setLoading(false);
      }
    }

    loadUser();

    // The key part: listen for the SIGNED_IN event
    const { data: sub } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setUser(session?.user ?? null);
      
      // Check for the specific event type that happens right after login
      if (_event === 'SIGNED_IN' && session?.user) {
        await updateProfileName(session.user);
      }
    });

    return () => {
      ignore = true;
      sub.subscription.unsubscribe();
    };
  }, []); // Dependecy array is empty as you had it

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
