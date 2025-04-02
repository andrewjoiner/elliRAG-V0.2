import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.6";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      },
    );

    // Get the user ID from the request
    const { user_id } = await req.json();

    if (!user_id) {
      throw new Error("Missing user_id parameter");
    }

    // Get the user's subscription
    const { data: subscriptionData, error: subscriptionError } =
      await supabaseClient
        .from("subscriptions")
        .select("*")
        .eq("user_id", user_id)
        .eq("status", "active")
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

    if (subscriptionError && subscriptionError.code !== "PGRST116") {
      throw subscriptionError;
    }

    // Get the plan details
    const planId = subscriptionData?.plan_id || "free";
    const { data: planData, error: planError } = await supabaseClient
      .from("plans")
      .select("*")
      .eq("id", planId)
      .single();

    if (planError) {
      throw planError;
    }

    // Get the user's chat usage for the current month
    const today = new Date();
    const startOfMonth = new Date(
      today.getFullYear(),
      today.getMonth(),
      1,
    ).toISOString();
    const endOfMonth = new Date(
      today.getFullYear(),
      today.getMonth() + 1,
      0,
    ).toISOString();

    const { data: usageData, error: usageError } = await supabaseClient
      .from("chat_usage")
      .select("chat_count")
      .eq("user_id", user_id)
      .gte("created_at", startOfMonth)
      .lte("created_at", endOfMonth)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (usageError && usageError.code !== "PGRST116") {
      throw usageError;
    }

    const currentCount = usageData?.chat_count || 0;
    const chatLimit = planData.features?.chat_limit || 50; // Default to 50 for free tier
    const remainingChats = Math.max(0, chatLimit - currentCount - 1); // Subtract 1 for the current chat

    // Increment the chat count
    if (!usageData) {
      // Create a new usage record if none exists
      await supabaseClient.from("chat_usage").insert({
        user_id,
        chat_count: 1,
        plan_id: planId,
        billing_period_start: startOfMonth,
        billing_period_end: endOfMonth,
      });
    } else {
      // Update the existing usage record
      await supabaseClient
        .from("chat_usage")
        .update({ chat_count: currentCount + 1 })
        .eq("user_id", user_id)
        .gte("created_at", startOfMonth)
        .lte("created_at", endOfMonth);
    }

    return new Response(
      JSON.stringify({
        success: true,
        remaining_chats: remainingChats,
        total_chats: chatLimit,
        plan: planId,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      },
    );
  } catch (error) {
    console.error("Error incrementing chat count:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
