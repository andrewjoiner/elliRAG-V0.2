import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Plus,
  Search,
  Settings,
  FolderOpen,
  MessageSquare,
  Loader2,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import {
  getChatSessions,
  createChatSession,
  deleteChatSession,
} from "@/lib/api";
import { useToast } from "@/components/ui/use-toast";

interface ChatHistoryItem {
  id: string;
  title: string;
  date: string;
  active?: boolean;
  hidden?: boolean;
}

export default function ChatSidebar() {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isCreatingChat, setIsCreatingChat] = useState(false);
  const [chatHistory, setChatHistory] = useState<ChatHistoryItem[]>([]);

  // Fetch chat history from backend
  useEffect(() => {
    const fetchChatHistory = async () => {
      try {
        setIsLoading(true);
        const sessions = await getChatSessions();

        const formattedHistory = sessions.map((session) => ({
          id: session.id,
          title: session.title,
          date: formatDate(new Date(session.updated_at)),
          active: session.id === sessionId,
        }));

        setChatHistory(formattedHistory);
      } catch (error) {
        console.error("Error fetching chat history:", error);
        toast({
          title: "Error",
          description: "Failed to load chat history. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchChatHistory();
  }, [sessionId, toast]);

  // Helper function to format dates
  const formatDate = (date: Date) => {
    const now = new Date();
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === now.toDateString()) {
      return "Today";
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    } else if (now.getTime() - date.getTime() < 7 * 24 * 60 * 60 * 1000) {
      return `${Math.ceil((now.getTime() - date.getTime()) / (24 * 60 * 60 * 1000))} days ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const filteredHistory = chatHistory.filter(
    (item) =>
      !item.hidden &&
      item.title.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const setActiveChat = (id: string) => {
    navigate(`/dashboard/${id}`);
  };

  const handleNewChat = async () => {
    try {
      setIsCreatingChat(true);
      const session = await createChatSession();
      navigate(`/dashboard/${session.id}`);
    } catch (error) {
      console.error("Error creating new chat:", error);
      toast({
        title: "Error",
        description: "Failed to create new chat. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsCreatingChat(false);
    }
  };

  const handleDeleteChat = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await deleteChatSession(id);
      setChatHistory(chatHistory.filter((chat) => chat.id !== id));

      // If the deleted chat was active, navigate to a new chat
      if (id === sessionId) {
        handleNewChat();
      }

      toast({
        title: "Success",
        description: "Chat deleted successfully.",
        variant: "default",
      });
    } catch (error) {
      console.error("Error deleting chat:", error);
      toast({
        title: "Error",
        description: "Failed to delete chat. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="w-64 h-full border-r border-border bg-card/50 flex flex-col">
      <div className="p-4">
        <Button
          variant="default"
          className="w-full justify-start gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
          onClick={handleNewChat}
          disabled={isCreatingChat}
        >
          {isCreatingChat ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <Plus size={16} />
          )}
          New Chat
        </Button>

        <div className="mt-4 relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search conversations..."
            className="pl-8 bg-background/50 border-border"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="px-2">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : filteredHistory.length > 0 ? (
            filteredHistory.map((item) => (
              <Button
                key={item.id}
                variant="ghost"
                className={`w-full justify-start text-left font-normal mb-1 ${item.active ? "bg-secondary text-primary" : ""}`}
                onClick={() => setActiveChat(item.id)}
              >
                <div className="flex flex-col items-start flex-1">
                  <span className="truncate w-52">{item.title}</span>
                  <span className="text-xs text-muted-foreground">
                    {item.date}
                  </span>
                </div>
              </Button>
            ))
          ) : (
            <div className="text-center py-4 text-muted-foreground">
              No conversations found
            </div>
          )}
        </div>
      </ScrollArea>

      <div className="p-4 border-t border-border">
        <div className="flex gap-2 mb-2">
          <Button
            variant="outline"
            className="flex-1 gap-2"
            title="Recent Chats"
            onClick={() => {
              // Filter to show only recent chats (last 7 days)
              const sevenDaysAgo = new Date();
              sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

              setSearchQuery(""); // Clear any existing search
              setChatHistory((prevHistory) =>
                prevHistory.map((chat) => ({
                  ...chat,
                  active: false, // Reset active state
                  hidden:
                    chat.date !== "Today" &&
                    chat.date !== "Yesterday" &&
                    !chat.date.includes("days ago"),
                })),
              );
            }}
          >
            <MessageSquare className="h-4 w-4" />
            <span className="text-sm">Recent</span>
          </Button>
          <Button
            variant="outline"
            className="flex-1 gap-2"
            title="Saved Documents"
            onClick={() => {
              // This would typically show saved documents
              // For demo purposes, we'll just show a different filter
              setSearchQuery(""); // Clear any existing search
              setChatHistory((prevHistory) =>
                prevHistory.map((chat) => ({
                  ...chat,
                  active: false, // Reset active state
                  hidden: false, // Show all documents
                })),
              );
            }}
          >
            <FolderOpen className="h-4 w-4" />
            <span className="text-sm">Saved</span>
          </Button>
        </div>
        <Button
          variant="outline"
          className="w-full gap-2 text-muted-foreground hover:text-destructive"
          onClick={() => {
            const { signOut } = require("../../../supabase/auth").useAuth();
            signOut();
            window.location.href = "/";
          }}
        >
          <Settings className="h-4 w-4" />
          <span className="text-sm">Log Out</span>
        </Button>
      </div>
    </div>
  );
}
