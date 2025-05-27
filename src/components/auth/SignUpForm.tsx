import { useState, useEffect } from "react";
import { useAuth } from "../../../supabase/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNavigate, Link } from "react-router-dom";
import AuthLayout from "./AuthLayout";
import { useToast } from "@/components/ui/use-toast";

export default function SignUpForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [error, setError] = useState("");
  const [userType, setUserType] = useState<"student" | "teacher">("student");
  const [isLoading, setIsLoading] = useState(false);
  const { signUp } = useAuth();
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
    }
  }, [toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setIsLoading(false);
      return;
    }

    try {
      if (!email || !password || !fullName) {
        throw new Error("Please fill in all required fields");
      }

      console.log("Attempting to sign up with:", { email, userType });
      const { error: signUpError } = await signUp(email, password, fullName);
      if (signUpError) throw signUpError;

      toast({
        title: "Account created successfully",
        description: "Please check your email to verify your account.",
        duration: 5000,
      });

      // Use window.location instead of navigate for a full page reload
      window.location.href = "/login";
    } catch (err: any) {
      console.error("Sign up error:", err);
      setError(err.message || "Error creating account");
      toast({
        title: "Sign Up Failed",
        description:
          err.message || "Failed to create account. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="bg-white rounded-2xl shadow-sm p-8 w-full max-w-md mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-semibold tracking-tight">
            Join RTGradey
          </h2>
          <p className="text-lg font-medium text-gray-500 mt-2">
            Create your account to start your grading journey
          </p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <Input
              id="fullName"
              placeholder="Full Name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              className="h-12 rounded-full border-gray-300 focus:ring-[#FFB672] focus:border-[#FFB672]"
            />

            <Input
              id="email"
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="h-12 rounded-full border-gray-300 focus:ring-[#FFB672] focus:border-[#FFB672]"
            />

            <Input
              id="password"
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="h-12 rounded-full border-gray-300 focus:ring-[#FFB672] focus:border-[#FFB672]"
            />

            <Input
              id="confirmPassword"
              type="password"
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="h-12 rounded-full border-gray-300 focus:ring-[#FFB672] focus:border-[#FFB672]"
            />

            <div className="flex rounded-full overflow-hidden border border-gray-300">
              <button
                type="button"
                onClick={() => setUserType("student")}
                className={`flex-1 py-3 text-center ${userType === "student" ? "bg-[#E6E0FF] text-[#1B1B1B]" : "bg-white text-[#4A4A4A]"}`}
              >
                Student
              </button>
              <button
                type="button"
                onClick={() => setUserType("teacher")}
                className={`flex-1 py-3 text-center ${userType === "teacher" ? "bg-[#E6E0FF] text-[#1B1B1B]" : "bg-white text-[#4A4A4A]"}`}
              >
                Teacher
              </button>
            </div>
          </div>

          {error && <p className="text-sm text-[#FF9B9B]">{error}</p>}

          <Button
            type="submit"
            className="w-full h-12 rounded-full bg-[#FFB672] text-[#1B1B1B] hover:bg-[#FFD700] text-sm font-medium"
            disabled={isLoading}
          >
            {isLoading ? "Creating Account..." : "Register"}
          </Button>

          <div className="text-xs text-center text-[#4A4A4A] mt-6">
            By creating an account, you agree to our{" "}
            <Link to="/" className="text-[#FFB672] hover:underline">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link to="/" className="text-[#FFB672] hover:underline">
              Privacy Policy
            </Link>
          </div>

          <div className="text-sm text-center text-[#4A4A4A] mt-6">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-[#FFB672] hover:underline font-medium"
            >
              Login
            </Link>
          </div>
        </form>
      </div>
    </AuthLayout>
  );
}
