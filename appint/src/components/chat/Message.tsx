import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { FileText, MessageSquare, User } from "lucide-react";

export interface MessageProps {
  id?: string;
  content?: string;
  role?: "user" | "assistant";
  timestamp?: string;
  hasSources?: boolean;
  isLoading?: boolean;
  documents?: {
    id: string;
    name: string;
    size: number;
    type: string;
  }[];
}

const Message = ({
  id = "msg-1",
  content = "This is a placeholder message content. It will be replaced with actual message content when provided.",
  role = "user",
  timestamp = new Date().toLocaleTimeString(),
  hasSources = false,
  isLoading = false,
  documents = [],
}: MessageProps) => {
  return (
    <div
      className={cn(
        "flex w-full gap-4 p-4 border-b bg-background",
        role === "assistant" ? "bg-muted/50" : "bg-background",
      )}
      id={id}
    >
      {/* Avatar section */}
      <div className="flex-shrink-0">
        <Avatar>
          {role === "user" ? (
            <>
              <AvatarFallback className="bg-primary/10 text-primary">
                <User size={20} />
              </AvatarFallback>
            </>
          ) : (
            <>
              <AvatarFallback className="bg-secondary/10 text-secondary">
                <MessageSquare size={20} />
              </AvatarFallback>
            </>
          )}
        </Avatar>
      </div>

      {/* Message content section */}
      <div className="flex flex-col flex-1 gap-2">
        <div className="flex items-center justify-between">
          <span className="font-medium">
            {role === "user" ? "You" : "Assistant"}
          </span>
          <span className="text-xs text-muted-foreground">{timestamp}</span>
        </div>

        <div
          className={cn(
            "prose prose-sm max-w-none",
            isLoading ? "opacity-70" : "",
          )}
        >
          {isLoading ? (
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-primary rounded-full animate-bounce delay-75"></div>
              <div className="w-2 h-2 bg-primary rounded-full animate-bounce delay-100"></div>
              <div className="w-2 h-2 bg-primary rounded-full animate-bounce delay-150"></div>
            </div>
          ) : (
            <p className="whitespace-pre-wrap">{content}</p>
          )}
        </div>

        {role === "assistant" && !isLoading && (
          <div className="flex items-center gap-2 mt-2">
            {hasSources && (
              <Button variant="outline" size="sm" className="text-xs">
                View Sources
              </Button>
            )}
          </div>
        )}

        {documents && documents.length > 0 && (
          <div className="flex flex-col gap-2 mt-3 border rounded-md p-2 bg-muted/30">
            <p className="text-xs font-medium">Uploaded Documents:</p>
            <div className="flex flex-wrap gap-2">
              {documents.map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-center gap-1.5 text-xs bg-background rounded-md p-1.5 border"
                >
                  <FileText size={14} className="text-primary" />
                  <span className="max-w-[150px] truncate">{doc.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Message;
