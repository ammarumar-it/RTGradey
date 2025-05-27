import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "../../../supabase/auth";
import { LoadingSpinner } from "../ui/loading-spinner";
import { useToast } from "@/components/ui/use-toast";

const LoginForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Check if Supabase environment variables are set
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      setError(
        "Supabase configuration is missing. Please check your environment variables.",
      );
      toast({
        title: "Configuration Error",
        description:
          "Supabase configuration is missing. Please check your environment variables.",
        variant: "destructive",
      });
    } else {
      // Log masked values for debugging
      const maskedKey = supabaseKey
        ? `${supabaseKey.substring(0, 5)}...`
        : "not set";

      // Format URL for debugging
      let formattedUrl = supabaseUrl;
      if (!formattedUrl.startsWith("http")) {
        formattedUrl = `https://${formattedUrl}`;
      }
      if (
        formattedUrl.includes(".supabase.co") &&
        !formattedUrl.endsWith(".supabase.co")
      ) {
        const projectRef = formattedUrl.split(".")[0].split("//")[1];
        formattedUrl = `https://${projectRef}.supabase.co`;
      }

      console.log(
        `LoginForm - Supabase URL: ${formattedUrl}, Key: ${maskedKey}`,
      );
    }
  }, [toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      if (!email || !password) {
        throw new Error("Please enter both email and password");
      }

      console.log("Attempting to sign in with:", { email });

      // Check Supabase URL and key before attempting to sign in
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

      if (!supabaseUrl || !supabaseKey) {
        throw new Error(
          "Supabase configuration is missing. Please check your environment variables.",
        );
      }

      console.log("Attempting to sign in with Supabase...");

      const { error: signInError } = await signIn(email, password);
      if (signInError) throw signInError;

      console.log("Sign in successful, redirecting to dashboard");
      // Store username in localStorage for welcome message
      localStorage.setItem("welcomeUser", email.split("@")[0]);

      // Use window.location instead of navigate for a full page reload
      window.location.href = "/dashboard";
    } catch (err: any) {
      console.error("Login error:", err);
      setError(err.message || "Failed to sign in");
      toast({
        title: "Login Failed",
        description:
          err.message ||
          "Failed to sign in. Please check your credentials or network connection.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FAF6F0] p-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-sm p-8 border border-gray-100">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">
            Welcome back
          </h1>
          <p className="text-gray-500">Sign in to continue to RTGradey</p>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Email
            </label>
            <Input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700"
              >
                Password
              </label>
              <Link
                to="/forgot-password"
                className="text-sm text-blue-600 hover:text-blue-500"
              >
                Forgot password?
              </Link>
            </div>
            <Input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full"
            />
          </div>

          <Button
            type="submit"
            className="w-full bg-[#FFB672] hover:bg-[#FFA050] text-[#1B1B1B]"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <LoadingSpinner size="sm" className="mr-2" />
                Signing in...
              </>
            ) : (
              "Sign in"
            )}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-600">
            Don't have an account?{" "}
            <Link to="/signup" className="text-blue-600 hover:text-blue-500">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
