import { supabase } from "../../supabase/supabase";
import { RagSettings } from "@/components/chat/RagControls";

export interface Message {
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

export interface ChatSession {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
  user_id: string;
}

// Send a message to the AI and get a response
export async function sendMessage(
  message: string,
  sessionId: string,
  ragSettings: RagSettings,
) {
  try {
    // First, save the user message to the database
    const { data: userMessageData, error: userMessageError } = await supabase
      .from("messages")
      .insert({
        session_id: sessionId,
        content: message,
        is_user: true,
      })
      .select()
      .single();

    if (userMessageError) throw userMessageError;

    // Call the AI service to get a response
    const { data: aiResponse, error: aiError } =
      await supabase.functions.invoke("supabase-functions-chat", {
        body: {
          message,
          sessionId,
          ragSettings,
        },
      });

    if (aiError) throw aiError;

    // Save the AI response to the database
    const { data: aiMessageData, error: aiMessageError } = await supabase
      .from("messages")
      .insert({
        session_id: sessionId,
        content: aiResponse.message,
        is_user: false,
        sources: aiResponse.sources,
      })
      .select()
      .single();

    if (aiMessageError) throw aiMessageError;

    return {
      userMessage: formatMessage(userMessageData),
      aiMessage: formatMessage(aiMessageData),
    };
  } catch (error) {
    console.error("Error sending message:", error);
    throw error;
  }
}

// Create a new chat session
export async function createChatSession(title: string = "New Conversation") {
  try {
    const { data: session, error } = await supabase
      .from("chat_sessions")
      .insert({ title })
      .select()
      .single();

    if (error) throw error;
    return session;
  } catch (error) {
    console.error("Error creating chat session:", error);
    throw error;
  }
}

// Get all chat sessions for the current user
export async function getChatSessions() {
  try {
    const { data: sessions, error } = await supabase
      .from("chat_sessions")
      .select("*")
      .order("updated_at", { ascending: false });

    if (error) throw error;
    return sessions;
  } catch (error) {
    console.error("Error fetching chat sessions:", error);
    throw error;
  }
}

// Get all messages for a specific chat session
export async function getChatMessages(sessionId: string) {
  try {
    const { data: messages, error } = await supabase
      .from("messages")
      .select("*")
      .eq("session_id", sessionId)
      .order("created_at", { ascending: true });

    if (error) throw error;
    return messages.map(formatMessage);
  } catch (error) {
    console.error("Error fetching chat messages:", error);
    throw error;
  }
}

// Update chat session title
export async function updateChatSessionTitle(sessionId: string, title: string) {
  try {
    const { error } = await supabase
      .from("chat_sessions")
      .update({ title })
      .eq("id", sessionId);

    if (error) throw error;
  } catch (error) {
    console.error("Error updating chat session title:", error);
    throw error;
  }
}

// Delete a chat session
export async function deleteChatSession(sessionId: string) {
  try {
    const { error } = await supabase
      .from("chat_sessions")
      .delete()
      .eq("id", sessionId);

    if (error) throw error;
  } catch (error) {
    console.error("Error deleting chat session:", error);
    throw error;
  }
}

// Submit feedback for a message
export async function submitMessageFeedback(
  messageId: string,
  isPositive: boolean,
) {
  try {
    const { error } = await supabase.from("message_feedback").insert({
      message_id: messageId,
      is_positive: isPositive,
    });

    if (error) throw error;
  } catch (error) {
    console.error("Error submitting message feedback:", error);
    throw error;
  }
}

// Upload a document to the external API
export async function uploadDocumentToExternalAPI(file: File, metadata: any) {
  try {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("metadata", JSON.stringify(metadata));

    const response = await fetch(
      "http://20.169.234.207:7272/v3/documents/upload",
      {
        method: "POST",
        headers: {
          Authorization: "Bearer YOUR_API_KEY", // Replace with actual API key from env
        },
        body: formData,
      },
    );

    if (!response.ok) {
      throw new Error(`API responded with status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error uploading document to external API:", error);
    throw error;
  }
}

// Upload a document via URL to the external API
export async function uploadDocumentUrlToExternalAPI(
  url: string,
  metadata: any,
) {
  try {
    const response = await fetch(
      "http://20.169.234.207:7272/v3/documents/upload-url",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer YOUR_API_KEY", // Replace with actual API key from env
        },
        body: JSON.stringify({
          url,
          metadata,
        }),
      },
    );

    if (!response.ok) {
      throw new Error(`API responded with status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error uploading document URL to external API:", error);
    throw error;
  }
}

// Helper function to format message data
function formatMessage(message: any): Message {
  return {
    id: message.id,
    content: message.content,
    isUser: message.is_user,
    timestamp: new Date(message.created_at).toLocaleTimeString(),
    sources: message.sources,
  };
}
