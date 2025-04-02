import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ChatBubble } from "@/components/ui/chat-bubble";
import {
  ThumbsUp,
  ThumbsDown,
  ChevronDown,
  ChevronUp,
  ExternalLink,
} from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

interface Source {
  id: string;
  title: string;
  url: string;
  snippet: string;
  confidence: number;
}

interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: string;
  sources?: Source[];
}

interface MessageThreadProps {
  messages: Message[];
  onFeedback: (messageId: string, isPositive: boolean) => void;
}

export default function MessageThread({
  messages,
  onFeedback,
}: MessageThreadProps) {
  const [expandedSources, setExpandedSources] = useState<
    Record<string, boolean>
  >({
    // Default all source sections to collapsed
  });

  const toggleSourceExpansion = (messageId: string) => {
    setExpandedSources((prev) => ({
      ...prev,
      [messageId]: !prev[messageId],
    }));
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-6">
      {messages.map((message) => (
        <div key={message.id} className="space-y-2">
          <ChatBubble
            isUser={message.isUser}
            timestamp={message.timestamp}
            avatar={
              <Avatar className="h-8 w-8">
                <AvatarImage
                  src={message.isUser ? "/user-avatar.svg" : "/elli-icon.svg"}
                  alt={message.isUser ? "User" : "elli"}
                />
                <AvatarFallback>{message.isUser ? "U" : "E"}</AvatarFallback>
              </Avatar>
            }
          >
            {message.content}
          </ChatBubble>

          {!message.isUser && message.sources && message.sources.length > 0 && (
            <div className="ml-12 mt-1">
              <Collapsible
                open={expandedSources[message.id]}
                onOpenChange={() => toggleSourceExpansion(message.id)}
                className="border border-border rounded-md bg-card/30"
              >
                <CollapsibleTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full flex justify-between items-center p-2 text-xs text-muted-foreground hover:text-foreground"
                  >
                    <span>{message.sources.length} sources</span>
                    {expandedSources[message.id] ? (
                      <ChevronUp size={14} />
                    ) : (
                      <ChevronDown size={14} />
                    )}
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="p-2 space-y-2">
                  {message.sources.map((source) => (
                    <div
                      key={source.id}
                      className="text-xs border-l-2 border-primary/50 pl-2 py-1"
                    >
                      <div className="font-medium">{source.title}</div>
                      <div className="text-muted-foreground mt-1">
                        {source.snippet}
                      </div>
                      <div className="flex justify-between items-center mt-1">
                        <span className="text-primary text-[10px]">
                          Confidence: {Math.round(source.confidence * 100)}%
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 px-2 text-[10px]"
                          asChild
                        >
                          <a
                            href={source.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1"
                          >
                            View <ExternalLink size={10} />
                          </a>
                        </Button>
                      </div>
                    </div>
                  ))}
                </CollapsibleContent>
              </Collapsible>
            </div>
          )}

          {!message.isUser && (
            <div className="flex items-center gap-2 ml-12">
              <Button
                variant="outline"
                size="icon"
                className="h-7 w-7 rounded-full"
                onClick={() => onFeedback(message.id, true)}
              >
                <ThumbsUp className="h-3 w-3" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-7 w-7 rounded-full"
                onClick={() => onFeedback(message.id, false)}
              >
                <ThumbsDown className="h-3 w-3" />
              </Button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
