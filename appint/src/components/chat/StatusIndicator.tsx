import React from "react";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

interface StatusIndicatorProps {
  status: "idle" | "typing" | "loading" | "error";
  message?: string;
}

const StatusIndicator = ({
  status = "idle",
  message = "AI is thinking...",
}: StatusIndicatorProps) => {
  if (status === "idle") return null;

  return (
    <div className="flex items-center gap-2 text-sm text-muted-foreground bg-background p-2 rounded-md">
      {status === "typing" && (
        <>
          <div className="flex items-center gap-1">
            <span className="animate-pulse h-2 w-2 bg-blue-500 rounded-full"></span>
            <span className="animate-pulse delay-75 h-2 w-2 bg-blue-500 rounded-full"></span>
            <span className="animate-pulse delay-150 h-2 w-2 bg-blue-500 rounded-full"></span>
          </div>
          <span>AI is typing...</span>
        </>
      )}

      {status === "loading" && (
        <>
          <Loader2 className="h-4 w-4 animate-spin text-primary" />
          <span>{message}</span>
        </>
      )}

      {status === "error" && (
        <>
          <div className="h-4 w-4 bg-red-500 rounded-full"></div>
          <span className="text-red-500">{message || "An error occurred"}</span>
        </>
      )}
    </div>
  );
};

export default StatusIndicator;
