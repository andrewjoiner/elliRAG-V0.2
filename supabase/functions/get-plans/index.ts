import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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
    // Return hardcoded plans that match the landing page
    const plans = [
      {
        id: "free",
        object: "plan",
        active: true,
        amount: 0,
        currency: "usd",
        interval: "month",
        interval_count: 1,
        product: "free_tier",
        created: Date.now(),
        livemode: true,
        name: "Free",
        features: {
          chat_limit: 50,
          document_pages: 5,
          history_days: 30,
        },
      },
      {
        id: "pro_monthly",
        object: "plan",
        active: true,
        amount: 3900,
        currency: "usd",
        interval: "month",
        interval_count: 1,
        product: "pro_tier",
        created: Date.now(),
        livemode: true,
        name: "Pro",
        features: {
          chat_limit: 500,
          document_pages: -1, // unlimited
          history_days: 90,
        },
      },
      {
        id: "pro_yearly",
        object: "plan",
        active: true,
        amount: 39900,
        currency: "usd",
        interval: "year",
        interval_count: 1,
        product: "pro_tier",
        created: Date.now(),
        livemode: true,
        name: "Pro (Annual)",
        features: {
          chat_limit: 500,
          document_pages: -1, // unlimited
          history_days: 90,
        },
      },
      {
        id: "enterprise",
        object: "plan",
        active: true,
        amount: 0, // custom pricing
        currency: "usd",
        interval: "month",
        interval_count: 1,
        product: "enterprise_tier",
        created: Date.now(),
        livemode: true,
        name: "Enterprise",
        features: {
          chat_limit: -1, // unlimited
          document_pages: -1, // unlimited
          history_days: -1, // unlimited
        },
      },
    ];

    return new Response(JSON.stringify(plans), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Error in get-plans function:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
