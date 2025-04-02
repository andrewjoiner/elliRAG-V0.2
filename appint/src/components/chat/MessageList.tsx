import React, { useState } from "react";
import Message from "./Message";
import SourceCitation from "./SourceCitation";
import FeedbackControls from "./FeedbackControls";
import StatusIndicator from "./StatusIndicator";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ChatMessage {
  id: string;
  content: string;
  role: "user" | "assistant";
  timestamp: string;
  hasSources?: boolean;
  showSources?: boolean;
  sources?: {
    id: string;
    title: string;
    excerpt: string;
    confidence: number;
    type: "document" | "web";
    url?: string;
  }[];
  documents?: {
    id: string;
    name: string;
    size: number;
    type: string;
  }[];
}

interface MessageListProps {
  messages?: ChatMessage[];
  status?: "idle" | "typing" | "loading" | "error";
  statusMessage?: string;
  onFeedback?: (
    messageId: string,
    type: "positive" | "negative",
    comment?: string,
  ) => void;
}

const MessageList = ({
  messages = [
    {
      id: "user-1",
      content: "What are the latest trends in the industry?",
      role: "user",
      timestamp: "10:30 AM",
    },
    {
      id: "assistant-1",
      content:
        "Based on the latest reports, there are several key trends emerging in the industry:\n\n1. Increased adoption of digital solutions, leading to a 15% growth in Q3 compared to last year.\n\n2. A shift in the competitive landscape with new market entrants driving established companies to invest more in innovation.\n\n3. Growing preference for sustainable solutions, with environmentally responsible companies seeing improved customer loyalty.\n\nThese trends suggest that companies focusing on digital transformation while emphasizing sustainability will likely see the strongest growth in the coming quarters.",
      role: "assistant",
      timestamp: "10:31 AM",
      hasSources: true,
      showSources: false,
      sources: [
        {
          id: "1",
          title: "Industry Report 2023",
          excerpt:
            "According to the latest findings, the industry has shown a 15% growth in Q3 compared to the previous year. Market analysts attribute this growth to increased adoption of digital solutions and favorable regulatory changes.",
          confidence: 0.92,
          type: "document",
        },
        {
          id: "2",
          title: "Competitive Analysis",
          excerpt:
            "The competitive landscape has shifted significantly with the entry of new players. Established companies are responding by investing in innovation and customer experience improvements.",
          confidence: 0.85,
          type: "document",
        },
        {
          id: "3",
          title: "Market Trends Blog",
          excerpt:
            "Recent trends indicate a growing preference for sustainable solutions. Companies that emphasize environmental responsibility are seeing improved customer loyalty and brand perception.",
          confidence: 0.78,
          type: "web",
          url: "https://example.com/market-trends",
        },
      ],
    },
    {
      id: "user-2",
      content: "How should companies adapt to these changes?",
      role: "user",
      timestamp: "10:33 AM",
    },
  ],
  status = "idle",
  statusMessage = "AI is processing your request...",
  onFeedback = () => {},
}: MessageListProps) => {
  const [expandedSources, setExpandedSources] = useState<
    Record<string, boolean>
  >({});

  const toggleSourcesVisibility = (messageId: string) => {
    setExpandedSources((prev) => ({
      ...prev,
      [messageId]: !prev[messageId],
    }));
  };

  return (
    <div className="flex flex-col h-full w-full bg-background">
      <ScrollArea className="flex-1 p-0">
        <div className="flex flex-col">
          {messages.map((message) => (
            <div key={message.id} className="message-container">
              <Message
                id={message.id}
                content={message.content}
                role={message.role}
                timestamp={message.timestamp}
                hasSources={message.hasSources}
                isLoading={message.role === "assistant" && status === "typing"}
                documents={message.documents}
              />

              {message.role === "assistant" && (
                <div className="pl-14 pr-4">
                  {/* Show sources if expanded */}
                  {message.hasSources &&
                    expandedSources[message.id] &&
                    message.sources && (
                      <SourceCitation
                        sources={message.sources}
                        messageId={message.id}
                      />
                    )}

                  {/* Feedback controls for assistant messages */}
                  <div className="flex justify-end mt-1">
                    <FeedbackControls
                      messageId={message.id}
                      onFeedback={onFeedback}
                    />
                  </div>
                </div>
              )}
            </div>
          ))}

          {/* Status indicator for typing/loading states */}
          {status !== "idle" && (
            <div className="p-4">
              <StatusIndicator status={status} message={statusMessage} />
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

export default MessageList;
