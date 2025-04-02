import { useEffect, useState } from "react";
import { testSupabaseConnection } from "@/supabase/supabase";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";

export function SupabaseConnectionTest() {
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading",
  );
  const [message, setMessage] = useState<string>("");
  const [isVisible, setIsVisible] = useState(true);

  const testConnection = async () => {
    setStatus("loading");
    try {
      const result = await testSupabaseConnection();
      if (result.success) {
        setStatus("success");
        setMessage("Successfully connected to Supabase!");
      } else {
        setStatus("error");
        setMessage(`Failed to connect to Supabase: ${result.error}`);
      }
    } catch (error) {
      setStatus("error");
      setMessage(`Error testing connection: ${error}`);
    }
  };

  useEffect(() => {
    testConnection();
  }, []);

  if (!isVisible) return null;

  return (
    <Alert className="fixed bottom-4 right-4 w-96 z-50 border border-border shadow-lg">
      <div className="flex items-center gap-2">
        {status === "loading" && (
          <Loader2 className="h-5 w-5 text-muted-foreground animate-spin" />
        )}
        {status === "success" && (
          <CheckCircle2 className="h-5 w-5 text-green-500" />
        )}
        {status === "error" && <XCircle className="h-5 w-5 text-destructive" />}
        <AlertTitle>
          {status === "loading" && "Testing Supabase Connection..."}
          {status === "success" && "Connection Successful"}
          {status === "error" && "Connection Failed"}
        </AlertTitle>
      </div>
      <AlertDescription className="mt-2">
        {message}
        <div className="flex justify-between mt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={testConnection}
            disabled={status === "loading"}
          >
            {status === "loading" ? "Testing..." : "Test Again"}
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setIsVisible(false)}>
            Dismiss
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  );
}
