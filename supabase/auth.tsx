import { createContext, useContext, useEffect, useState } from "react";
import { User } from "@supabase/supabase-js";
import { supabase } from "./supabase";

type AuthContextType = {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error?: Error }>;
  signUp: (
    email: string,
    password: string,
    fullName: string,
    userType?: "student" | "teacher",
  ) => Promise<{ error?: Error }>;
  signOut: () => Promise<{ error?: Error }>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    // Check if Supabase environment variables are set
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "";
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "";

    if (!supabaseUrl || !supabaseKey) {
      console.error(
        "Supabase configuration is missing. Please check your environment variables.",
      );
      setAuthError("Supabase configuration is missing");
      setLoading(false);
      return;
    }

    // Check active sessions and sets the user
    supabase.auth
      .getSession()
      .then(({ data: { session } }) => {
        setUser(session?.user ?? null);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error getting session:", err);
        setLoading(false);
      });

    // Listen for changes on auth state (signed in, signed out, etc.)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (
    email: string,
    password: string,
    fullName: string,
    userType: "student" | "teacher" = "student",
  ) => {
    try {
      console.log("Signing up with Supabase...");
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            user_type: userType,
          },
          emailRedirectTo: window.location.origin + "/dashboard",
        },
      });

      if (error) {
        console.error("Supabase signup error:", error);
        throw error;
      }

      console.log(
        "Sign up successful:",
        data.user ? "User created" : "No user",
      );

      // Create user record in public.users table
      if (data.user) {
        try {
          const { error: profileError } = await supabase.from("users").insert({
            id: data.user.id,
            email: email,
            full_name: fullName,
            user_type: userType,
            token_identifier: data.user.id,
            created_at: new Date().toISOString(),
          });

          if (profileError) {
            console.error("Error creating user profile:", profileError);
          }
        } catch (profileErr) {
          console.error("Exception creating user profile:", profileErr);
        }
      }

      return {};
    } catch (error: any) {
      console.error("Sign up error:", error);
      return { error };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      console.log("Signing in with Supabase...");
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error("Supabase auth error:", error);
        throw error;
      }

      console.log(
        "Sign in successful:",
        data.session ? "Session created" : "No session",
      );
      return {};
    } catch (error: any) {
      console.error("Sign in error:", error);
      return { error };
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      return {};
    } catch (error: any) {
      console.error("Sign out error:", error);
      return { error };
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
