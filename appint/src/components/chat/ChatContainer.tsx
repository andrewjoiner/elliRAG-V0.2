import React, { useState } from "react";
import TopBar from "./TopBar";
import MessageList from "./MessageList";
import ChatInputArea from "./ChatInputArea";
import { cn } from "@/lib/utils";

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

interface ChatContainerProps {
  /**
   * Initial messages to display in the chat
   */
  initialMessages?: ChatMessage[];

  /**
   * Whether the R2R API is connected
   */
  isConnected?: boolean;

  /**
   * Additional CSS class names
   */
  className?: string;
}

/**
 * Main content area containing the chat interface with message history, input area, and tool controls.
 */
const ChatContainer = ({
  initialMessages = [
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
  isConnected = true,
  className = "",
}: ChatContainerProps) => {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [status, setStatus] = useState<"idle" | "typing" | "loading" | "error">(
    "idle",
  );
  const [statusMessage, setStatusMessage] = useState(
    "AI is processing your request...",
  );

  // Handle sending a new message
  const handleSendMessage = (content: string, files?: File[]) => {
    if (!content.trim() && (!files || files.length === 0)) return;

    // Process uploaded documents if any
    const documents = files?.map((file) => ({
      id: `doc-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      name: file.name,
      size: file.size,
      type: file.type,
    }));

    // Create a new user message
    const newUserMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      content,
      role: "user",
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      documents,
    };

    // Add the new message to the chat
    setMessages((prev) => [...prev, newUserMessage]);

    // Set status to loading to show the AI is thinking
    setStatus("typing");

    // Simulate AI response after a delay
    setTimeout(() => {
      const newAssistantMessage: ChatMessage = {
        id: `assistant-${Date.now()}`,
        content:
          "I understand your question about adapting to industry changes. Based on the trends we discussed, companies should consider:\n\n1. Investing in digital transformation initiatives to stay competitive\n\n2. Developing innovation strategies to counter new market entrants\n\n3. Implementing sustainability practices to improve brand perception\n\n4. Training employees on new technologies and approaches\n\nWould you like me to elaborate on any specific adaptation strategy?",
        role: "assistant",
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        hasSources: true,
        showSources: false,
        sources: [
          {
            id: "4",
            title: "Digital Transformation Guide",
            excerpt:
              "Companies that invest in digital transformation see 20-30% improvement in operational efficiency and customer satisfaction metrics.",
            confidence: 0.89,
            type: "document",
          },
          {
            id: "5",
            title: "Innovation Strategy Framework",
            excerpt:
              "Successful companies are responding to new market entrants by allocating 15-20% of their R&D budget to disruptive innovation projects.",
            confidence: 0.82,
            type: "document",
          },
        ],
      };

      setMessages((prev) => [...prev, newAssistantMessage]);
      setStatus("idle");
    }, 2000);
  };

  // Handle feedback on messages
  const handleFeedback = (
    messageId: string,
    type: "positive" | "negative",
    comment?: string,
  ) => {
    console.log(
      `Feedback for message ${messageId}: ${type}${comment ? `, Comment: ${comment}` : ""}`,
    );
    // Here you would send the feedback to your backend
  };

  // Handle starting a new chat
  const handleNewChat = () => {
    setMessages([]);
    setStatus("idle");
  };

  // Handle exporting the chat
  const handleExportChat = () => {
    console.log("Exporting chat...");
    // Here you would implement the export functionality
  };

  // Handle clearing the chat
  const handleClearChat = () => {
    setMessages([]);
  };

  // Handle copying the chat
  const handleCopyChat = () => {
    const chatText = messages
      .map((msg) => `${msg.role === "user" ? "You" : "AI"}: ${msg.content}`)
      .join("\n\n");
    navigator.clipboard.writeText(chatText);
  };

  return (
    <div className={cn("flex flex-col h-full w-full bg-background", className)}>
      <TopBar
        isConnected={isConnected}
        onNewChat={handleNewChat}
        onExportChat={handleExportChat}
        onClearChat={handleClearChat}
        onCopyChat={handleCopyChat}
      />

      <div className="flex-1 overflow-hidden">
        <MessageList
          messages={messages}
          status={status}
          statusMessage={statusMessage}
          onFeedback={handleFeedback}
        />
      </div>

      <ChatInputArea
        onSendMessage={handleSendMessage}
        isLoading={status !== "idle"}
        disabled={status === "error"}
        placeholder="Type your message here..."
      />
    </div>
  );
};

export default ChatContainer;
