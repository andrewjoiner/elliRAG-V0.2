import { useEffect, useState } from "react";
import { useAuth } from "@/auth";
import { supabase } from "@/supabase/supabase";
import { useToast } from "@/components/ui/use-toast";

interface ChatUsageTrackerProps {
  onSend: number; // Changed to number to track when messages are sent
}

export default function ChatUsageTracker({ onSend }: ChatUsageTrackerProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [remainingChats, setRemainingChats] = useState<number | null>(null);

  // Track chat usage when a message is sent
  useEffect(() => {
    if (onSend === 0) return; // Skip initial render

    const trackChatUsage = async () => {
      if (!user) return;

      try {
        // Call the increment-chat-count edge function
        const { data, error } = await supabase.functions.invoke(
          "increment-chat-count",
          {
            body: { user_id: user.id },
          },
        );

        if (error) {
          console.error("Error tracking chat usage:", error);
          return;
        }

        // Update remaining chats count
        setRemainingChats(data.remaining_chats);

        // Show warning if running low on remaining chats
        if (data.remaining_chats <= 10) {
          toast({
            title: "Chat Limit Warning",
            description: `You have ${data.remaining_chats} questions remaining in your current plan. Consider upgrading for more.`,
            variant: "default",
          });
        }

        // Show error if out of chats
        if (data.remaining_chats <= 0) {
          toast({
            title: "Chat Limit Reached",
            description:
              "You've reached your monthly question limit. Please upgrade your plan to continue chatting.",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error("Error tracking chat usage:", error);
      }
    };

    trackChatUsage();
  }, [onSend, user, toast]);

  // This is a utility component that doesn't render anything
  return null;
}
