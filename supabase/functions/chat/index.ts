import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface RagSettings {
  documentSearch: boolean;
  webSearch: boolean;
  webScraping: boolean;
}

interface RequestBody {
  message: string;
  sessionId: string;
  ragSettings: RagSettings;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { message, sessionId, ragSettings } =
      (await req.json()) as RequestBody;

    if (!message || !sessionId) {
      throw new Error("Missing required parameters");
    }

    // Call the external API endpoint
    const aiResponse = await callExternalAPI(message, ragSettings);

    return new Response(JSON.stringify(aiResponse), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error processing chat request:", error);

    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

// Function to call the external API
async function callExternalAPI(query: string, ragSettings: RagSettings) {
  try {
    // Get previous messages from the session if available
    // For now we'll just use the current query
    const messages = [{ role: "user", content: query }];

    // Prepare the request payload
    const payload = {
      messages,
      filter: {},
      limit: 10,
    };

    // Make the API call
    const response = await fetch("http://20.169.234.207:7272/v3/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer YOUR_API_KEY", // Replace with actual API key from env
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`API responded with status: ${response.status}`);
    }

    // Parse the response
    const data = await response.json();

    // Format the response to match our expected structure
    return {
      message:
        data.answer ||
        data.response ||
        "Sorry, I couldn't generate a response.",
      sources: formatSources(data.sources || data.documents),
    };
  } catch (error) {
    console.error("Error calling external API:", error);
    // Return a fallback response
    return generateFallbackResponse(query, ragSettings);
  }
}

// Helper function to format sources from the API response
function formatSources(apiSources) {
  if (!apiSources || !Array.isArray(apiSources) || apiSources.length === 0) {
    return undefined;
  }

  return apiSources.map((source, index) => ({
    id: `s${index + 1}`,
    title: source.title || `Source ${index + 1}`,
    url: source.url || "",
    snippet: source.snippet || source.content || "",
    confidence: source.confidence || 0.7,
  }));
}

// Fallback response generator in case the API call fails
function generateFallbackResponse(query: string, ragSettings: RagSettings) {
  const toolsUsed = [];
  if (ragSettings.documentSearch) toolsUsed.push("document search");
  if (ragSettings.webSearch) toolsUsed.push("web search");
  if (ragSettings.webScraping) toolsUsed.push("web scraping");

  const toolsText =
    toolsUsed.length > 0
      ? ` I've used ${toolsUsed.join(", ")} to find this information.`
      : "";

  const response = {
    message: `I apologize, but I'm having trouble connecting to my knowledge base at the moment. Please try again later.${toolsText}`,
    sources: undefined,
  };

  return response;
}
