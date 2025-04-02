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
import { LogIn } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "../../../supabase/supabase";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    if (!email || !password) {
      setError("Email and password are required");
      setIsLoading(false);
      return;
    }

    try {
      console.log("Login attempt with email:", email);
      let loginSuccess = false;

      // Try to use the auth-debug edge function first
      try {
        console.log("Attempting login via edge function");
        // Try direct function name first
        try {
          const { data, error } = await supabase.functions.invoke(
            "auth-debug",
            {
              body: { action: "sign_in", email, password },
            },
          );

          if (error) {
            console.error("Direct function name error:", error);
            throw error;
          }

          if (data && data.success) {
            loginSuccess = true;
            console.log("Direct function login successful");

            toast({
              title: "Login successful",
              description: "Welcome back to elli!",
              variant: "default",
            });
            navigate("/dashboard");
            return;
          }
        } catch (directError) {
          console.log(
            "Direct function call failed, trying with prefix:",
            directError,
          );
          // Continue to fallback with prefixed name
        }

        // Try with prefixed function name
        const { data, error } = await supabase.functions.invoke(
          "supabase-functions-auth-debug",
          {
            body: { action: "sign_in", email, password },
          },
        );

        if (error) {
          console.error("Edge function error:", error);
          throw error;
        }

        console.log("Edge function login result:", data);

        if (data && data.success && data.user) {
          loginSuccess = true;
          console.log("Edge function login successful");

          toast({
            title: "Login successful",
            description: "Welcome back to elli!",
            variant: "default",
          });
          navigate("/dashboard");
          return;
        }
      } catch (edgeFnError) {
        console.log(
          "Edge function login failed, falling back to direct login",
          edgeFnError,
        );
        // Continue to fallback method
      }

      // Fallback: Direct login with Supabase client
      if (!loginSuccess) {
        console.log("Attempting direct Supabase login");
        const result = await signIn(email, password);
        console.log("Direct login result:", result);

        if (result?.user) {
          loginSuccess = true;
          console.log("Direct login successful");

          toast({
            title: "Login successful",
            description: "Welcome back to elli!",
            variant: "default",
          });
          navigate("/dashboard");
        } else {
          throw new Error("Failed to sign in. Please check your credentials.");
        }
      }
    } catch (error: any) {
      console.error("Login error:", error);
      let errorMessage = "Failed to sign in";

      if (error?.message) {
        errorMessage = error.message;
        // If it's a network error, provide a clearer message
        if (
          error.message.includes("fetch") ||
          error.message.includes("network")
        ) {
          errorMessage =
            "Network error. Please check your internet connection and try again.";
        } else if (
          error.message.includes("Invalid login") ||
          error.message.includes("credentials")
        ) {
          errorMessage = "Invalid email or password. Please try again.";
        }
      }

      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout>
      <Card className="w-full">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-center flex items-center justify-center gap-2">
            <LogIn className="h-5 w-5" /> Sign in
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
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
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Signing in..." : "Sign in"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <div className="text-sm text-center text-slate-600">
            Don't have an account?{" "}
            <Link to="/signup" className="text-primary hover:underline">
              Sign up
            </Link>
          </div>
        </CardFooter>
      </Card>
    </AuthLayout>
  );
}
