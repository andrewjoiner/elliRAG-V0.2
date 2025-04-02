import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, AlertCircle, CheckCircle } from "lucide-react";
import { supabase } from "@/supabase/supabase";

export default function SupabaseDebug() {
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [details, setDetails] = useState<any>(null);
  const [errorMessage, setErrorMessage] = useState<string>("");

  const checkConnection = async () => {
    setStatus("loading");
    setErrorMessage("");

    try {
      // Check environment variables
      const envVars = {
        url: import.meta.env.VITE_SUPABASE_URL ? "✓" : "✗",
        key: import.meta.env.VITE_SUPABASE_ANON_KEY ? "✓" : "✗",
      };

      // Try to get session
      const { data: sessionData, error: sessionError } =
        await supabase.auth.getSession();

      // Try a simple database query
      const { data: dbData, error: dbError } = await supabase
        .from("profiles")
        .select("count", { count: "exact", head: true });

      setDetails({
        environment: envVars,
        auth: { success: !sessionError, error: sessionError?.message },
        database: { success: !dbError, error: dbError?.message },
      });

      if (sessionError || dbError) {
        setStatus("error");
        setErrorMessage(
          sessionError?.message || dbError?.message || "Unknown error",
        );
      } else {
        setStatus("success");
      }
    } catch (error) {
      setStatus("error");
      setErrorMessage(error instanceof Error ? error.message : String(error));
    }
  };

  useEffect(() => {
    checkConnection();
  }, []);

  return (
    <Card className="w-full max-w-md mx-auto mt-8">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {status === "loading" && <Loader2 className="h-5 w-5 animate-spin" />}
          {status === "success" && (
            <CheckCircle className="h-5 w-5 text-green-500" />
          )}
          {status === "error" && (
            <AlertCircle className="h-5 w-5 text-red-500" />
          )}
          Supabase Connection Status
        </CardTitle>
      </CardHeader>
      <CardContent>
        {status === "loading" && (
          <div className="flex justify-center py-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}

        {status === "error" && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        )}

        {details && (
          <div className="space-y-4">
            <div>
              <h3 className="font-medium mb-2">Environment Variables</h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>SUPABASE_URL:</div>
                <div>{details.environment.url}</div>
                <div>SUPABASE_ANON_KEY:</div>
                <div>{details.environment.key}</div>
              </div>
            </div>

            <div>
              <h3 className="font-medium mb-2">Connection Tests</h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>Auth Service:</div>
                <div
                  className={
                    details.auth.success ? "text-green-500" : "text-red-500"
                  }
                >
                  {details.auth.success ? "Connected" : "Failed"}
                </div>
                <div>Database:</div>
                <div
                  className={
                    details.database.success ? "text-green-500" : "text-red-500"
                  }
                >
                  {details.database.success ? "Connected" : "Failed"}
                </div>
              </div>
            </div>

            {(details.auth.error || details.database.error) && (
              <div>
                <h3 className="font-medium mb-2">Error Details</h3>
                {details.auth.error && (
                  <p className="text-sm text-red-500 mb-2">
                    Auth: {details.auth.error}
                  </p>
                )}
                {details.database.error && (
                  <p className="text-sm text-red-500">
                    Database: {details.database.error}
                  </p>
                )}
              </div>
            )}
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button
          onClick={checkConnection}
          disabled={status === "loading"}
          className="w-full"
        >
          {status === "loading"
            ? "Testing Connection..."
            : "Test Connection Again"}
        </Button>
      </CardFooter>
    </Card>
  );
}
