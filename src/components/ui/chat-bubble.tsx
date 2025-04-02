import * as React from "react";
import { cn } from "@/lib/utils";

export interface ChatBubbleProps extends React.HTMLAttributes<HTMLDivElement> {
  isUser?: boolean;
  avatar?: React.ReactNode;
  timestamp?: string;
}

const ChatBubble = React.forwardRef<HTMLDivElement, ChatBubbleProps>(
  (
    { className, isUser = false, avatar, timestamp, children, ...props },
    ref,
  ) => {
    return (
      <div
        ref={ref}
        className={cn(
          "flex items-start gap-2 mb-4",
          isUser ? "justify-end" : "justify-start",
          className,
        )}
        {...props}
      >
        {!isUser && avatar && <div className="flex-shrink-0">{avatar}</div>}
        <div
          className={cn(
            "p-3 rounded-lg max-w-[80%]",
            isUser
              ? "bg-primary/20 rounded-tr-none text-foreground"
              : "bg-secondary rounded-tl-none text-foreground",
          )}
        >
          {children}
          {timestamp && (
            <div className="text-xs text-muted-foreground mt-1">
              {timestamp}
            </div>
          )}
        </div>
        {isUser && avatar && <div className="flex-shrink-0">{avatar}</div>}
      </div>
    );
  },
);

ChatBubble.displayName = "ChatBubble";

export { ChatBubble };
