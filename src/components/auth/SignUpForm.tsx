import { useState } from "react";
import { useAuth } from "@/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useNavigate, Link } from "react-router-dom";
import AuthLayout from "./AuthLayout";
import { UserPlus } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/supabase/supabase";
// Get the anon key for direct API calls
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export default function SignUpForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { signUp, signIn } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    if (!email || !password || !fullName) {
      setError("All fields are required");
      setIsLoading(false);
      return;
    }

    try {
      console.log("Starting signup process with:", { email, fullName });
      let signupSuccess = false;

      // Try our new direct-signup edge function first
      try {
        console.log("Trying direct-signup edge function");
        // Use the Supabase client to invoke the function
        const { data, error } = await supabase.functions.invoke(
          "direct-signup",
          {
            body: { email, password, fullName },
          },
        );

        if (error) {
          console.error("Direct-signup function error:", error);
          throw error;
        }

        if (data && data.success) {
          signupSuccess = true;
          console.log("Direct-signup function successful:", data);

          // Try to sign in the user immediately
          try {
            await signIn(email, password);
            console.log("Auto sign-in successful");
          } catch (signInError) {
            console.log(
              "Auto sign-in failed, user will need to sign in manually",
              signInError,
            );
          }
        }
      } catch (directSignupError) {
        console.log(
          "Direct-signup function failed, trying fallback methods",
          directSignupError,
        );

        // Skip standard signup and try auth-debug function as last resort
        try {
          console.log("Trying auth-debug function");
          const { data, error } = await supabase.functions.invoke(
            "supabase-functions-auth-debug",
            {
              body: { action: "create_user", email, password, fullName },
            },
          );

          if (error) {
            console.error("Auth-debug function error:", error);
            throw error;
          }

          if (data && data.success) {
            signupSuccess = true;
            console.log("Auth-debug function signup successful");
          }
        } catch (authDebugError) {
          console.error("All signup methods failed", authDebugError);
          throw authDebugError;
        }
      }

      if (signupSuccess) {
        toast({
          title: "Account created successfully",
          description: "You can now sign in with your credentials.",
          variant: "default",
        });

        // Navigate to success page
        navigate("/success", { state: { email } });
      } else {
        throw new Error("Failed to create account through all methods");
      }
    } catch (error: any) {
      console.error("SignUp error:", error);
      let errorMessage = "Failed to create account";

      if (error?.message) {
        errorMessage = error.message;
        // If it's a network error, provide a clearer message
        if (
          error.message.includes("fetch") ||
          error.message.includes("network")
        ) {
          errorMessage =
            "Network error. Please check your internet connection and try again.";
        } else if (error.message.includes("already registered")) {
          errorMessage =
            "This email is already registered. Please sign in instead.";
        }
      }

      setError(errorMessage);

      toast({
        title: "Signup Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout>
      <Card className="w-full">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-center flex items-center justify-center gap-2">
            <UserPlus className="h-5 w-5" /> Create an account
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                placeholder="John Doe"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Create a password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Creating account..." : "Create account"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <div className="text-sm text-center text-slate-600">
            Already have an account?{" "}
            <Link to="/login" className="text-primary hover:underline">
              Sign in
            </Link>
          </div>
        </CardFooter>
      </Card>
    </AuthLayout>
  );
}
