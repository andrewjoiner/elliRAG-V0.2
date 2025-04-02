import { useState, useEffect, useRef, useCallback } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Settings, FileText, Zap, Loader2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { TopicSelector } from "@/components/ui/topic-selector";
import ChatSidebar from "./ChatSidebar";
import MessageThread from "./MessageThread";
import RagControls, { RagSettings } from "./RagControls";
import DocumentManager from "./DocumentManager";
import SettingsPanel from "./SettingsPanel";
import ChatUsageTracker from "./ChatUsageTracker";
import { useToast } from "@/components/ui/use-toast";
import {
  Message,
  sendMessage,
  createChatSession,
  getChatMessages,
} from "@/lib/api";
import { useParams, useNavigate } from "react-router-dom";

interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: string;
  sources?: {
    id: string;
    title: string;
    url: string;
    snippet: string;
    confidence: number;
  }[];
}

const topics = [
  { value: "carbon-markets", label: "Carbon Markets" },
  { value: "methane-reduction", label: "Methane Reduction" },
  { value: "renewable-energy", label: "Renewable Energy" },
  { value: "biogas-frameworks", label: "Biogas Frameworks" },
  { value: "climate-finance", label: "Climate Finance" },
  { value: "emissions-trading", label: "Emissions Trading" },
  { value: "sustainability-reporting", label: "Sustainability Reporting" },
  { value: "climate-policy", label: "Climate Policy" },
];

export default function ChatInterface() {
  // Set dark mode as default
  useEffect(() => {
    document.documentElement.classList.add("dark");
  }, []);

  const { sessionId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [inputValue, setInputValue] = useState<string>("");
  const [messageSent, setMessageSent] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [currentSessionId, setCurrentSessionId] = useState<string>(
    sessionId || "",
  );
  const [ragSettings, setRagSettings] = useState<RagSettings>({
    documentSearch: true,
    webSearch: false,
    webScraping: false,
  });

  const [messages, setMessages] = useState<Message[]>([]);

  // Initialize chat session or load existing one
  useEffect(() => {
    const initializeChat = async () => {
      try {
        if (sessionId) {
          // Load existing chat session
          const chatMessages = await getChatMessages(sessionId);
          setMessages(chatMessages);
          setCurrentSessionId(sessionId);
        } else {
          // Create a new chat session
          const session = await createChatSession();
          setCurrentSessionId(session.id);
          navigate(`/dashboard/${session.id}`);

          // Add welcome message
          setMessages([
            {
              id: "welcome",
              content:
                "Hi there! I'm elli, your AI regulatory guide for climate frameworks. I can search through your documents, the web, and other sources to provide accurate information. What would you like to know about today?",
              isUser: false,
              timestamp: new Date().toLocaleTimeString(),
            },
          ]);
        }
      } catch (error) {
        console.error("Error initializing chat:", error);
        toast({
          title: "Error",
          description: "Failed to initialize chat session. Please try again.",
          variant: "destructive",
        });
      }
    };

    initializeChat();
  }, [sessionId, navigate, toast]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = useCallback(async () => {
    if (!inputValue.trim() || !currentSessionId || isLoading) return;

    try {
      setIsLoading(true);

      // Add user message to UI immediately for better UX
      const tempUserMessage: Message = {
        id: `temp-${Date.now()}`,
        content: inputValue,
        isUser: true,
        timestamp: new Date().toLocaleTimeString(),
      };

      setMessages((prev) => [...prev, tempUserMessage]);
      setInputValue("");

      // Increment message counter to trigger usage tracking
      setMessageSent((prev) => prev + 1);

      // Send message to backend and get response
      const { userMessage, aiMessage } = await sendMessage(
        inputValue,
        currentSessionId,
        ragSettings,
      );

      // Replace temp message with actual message from backend and add AI response
      setMessages((prev) => [
        ...prev.filter((msg) => msg.id !== `temp-${Date.now()}`),
        userMessage,
        aiMessage,
      ]);
    } catch (error) {
      console.error("Error sending message:", error);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [inputValue, currentSessionId, isLoading, ragSettings, toast]);

  const handleFeedback = async (messageId: string, isPositive: boolean) => {
    try {
      // Import here to avoid circular dependency
      const { submitMessageFeedback } = await import("@/lib/api");
      await submitMessageFeedback(messageId, isPositive);

      toast({
        title: "Feedback Submitted",
        description: `Thank you for your ${isPositive ? "positive" : "negative"} feedback!`,
        variant: "default",
      });
    } catch (error) {
      console.error("Error submitting feedback:", error);
      toast({
        title: "Error",
        description: "Failed to submit feedback. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex h-screen bg-background text-foreground">
      <ChatSidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="p-4 border-b border-border flex items-center justify-between bg-card/30 backdrop-blur-sm">
          <div className="flex items-center gap-2">
            <img src="/elli-icon.svg" alt="elli logo" className="h-10 w-auto" />
            <h1 className="text-xl font-bold">elli</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => (window.location.href = "/account")}
              className="text-sm"
            >
              My Account
            </Button>
          </div>
        </div>

        <div className="flex-1 overflow-hidden flex">
          <div className="flex-1 flex flex-col">
            <MessageThread messages={messages} onFeedback={handleFeedback} />
            <div ref={messagesEndRef} />
            <ChatUsageTracker onSend={messageSent} />

            <div className="p-4 border-t border-border bg-card/30 backdrop-blur-sm">
              <div className="flex items-center gap-2 max-w-4xl mx-auto">
                <Input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Type your message..."
                  className="flex-1 bg-background/50 border-border text-foreground"
                  onKeyDown={(e) =>
                    e.key === "Enter" && !isLoading && handleSendMessage()
                  }
                  disabled={isLoading}
                />
                <Button
                  onClick={handleSendMessage}
                  className="bg-primary text-primary-foreground hover:bg-primary/80"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </div>

          <div className="w-[300px] min-w-[250px] max-w-[350px] border-l border-border p-4 overflow-y-auto">
            <Tabs defaultValue="rag">
              <TabsList className="w-full mb-4 bg-background/50 grid grid-cols-3 gap-1">
                <TabsTrigger value="rag" className="px-2">
                  <Zap className="h-4 w-4 mr-2" />
                  RAG Tools
                </TabsTrigger>
                <TabsTrigger value="docs" className="px-2">
                  <FileText className="h-4 w-4 mr-2" />
                  Documents
                </TabsTrigger>
                <TabsTrigger
                  value="settings"
                  className="px-2 flex items-center justify-center"
                >
                  <Settings className="h-4 w-4 mr-2" />
                  <span className="whitespace-nowrap">Settings</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="rag" className="mt-0 space-y-4">
                <RagControls onSettingsChange={setRagSettings} />
              </TabsContent>

              <TabsContent value="docs" className="mt-0">
                <DocumentManager />
              </TabsContent>

              <TabsContent value="settings" className="mt-0">
                <SettingsPanel
                  onSettingsChange={(settings) =>
                    console.log("Settings updated:", settings)
                  }
                />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper functions to generate mock data
function generateAIResponse(
  query: string,
  topic: string,
  ragSettings: RagSettings,
): string {
  const topicText = topic
    ? ` about ${topics.find((t) => t.value === topic)?.label || topic}`
    : "";
  const toolsUsed = [];
  if (ragSettings.documentSearch) toolsUsed.push("document search");
  if (ragSettings.webSearch) toolsUsed.push("web search");
  if (ragSettings.webScraping) toolsUsed.push("web scraping");

  const toolsText =
    toolsUsed.length > 0
      ? ` I've used ${toolsUsed.join(", ")} to find this information.`
      : "";

  return `Based on your question${topicText}, here's what I found:  
  
The climate regulatory landscape is constantly evolving, with new frameworks being developed to address various aspects of climate change mitigation and adaptation. Recent developments include updates to carbon accounting methodologies, enhanced transparency requirements for emissions reporting, and new standards for climate risk disclosure.${toolsText}  
  
Would you like me to elaborate on any specific aspect of these regulations?`;
}

function generateSources() {
  return [
    {
      id: "s1",
      title: "IPCC Sixth Assessment Report",
      url: "https://www.ipcc.ch/assessment-report/ar6/",
      snippet:
        "The Sixth Assessment Report provides a comprehensive assessment of the physical science basis of climate change, impacts, adaptation and vulnerability, and mitigation.",
      confidence: 0.92,
    },
    {
      id: "s2",
      title: "EU Emissions Trading System (EU ETS) Handbook",
      url: "https://ec.europa.eu/clima/eu-action/eu-emissions-trading-system-eu-ets_en",
      snippet:
        "The EU ETS is a cornerstone of the EU's policy to combat climate change and its key tool for reducing greenhouse gas emissions cost-effectively.",
      confidence: 0.85,
    },
    {
      id: "s3",
      title: "Carbon Disclosure Project (CDP) Reporting Guidelines",
      url: "https://www.cdp.net/en/guidance",
      snippet:
        "CDP's reporting guidelines help companies disclose their environmental impacts and provide investors with information to make informed decisions.",
      confidence: 0.78,
    },
  ];
}
