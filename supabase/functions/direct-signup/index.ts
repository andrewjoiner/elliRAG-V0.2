import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.6";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    console.log("Function invoked with URL:", req.url);

    // Get request body
    const { email, password, fullName } = await req.json();

    if (!email || !password || !fullName) {
      throw new Error("Email, password, and full name are required");
    }

    // Create a Supabase client with the Admin key
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_KEY");

    console.log("Using Supabase URL:", supabaseUrl);
    console.log("Service key available:", !!supabaseKey);

    if (!supabaseUrl || !supabaseKey) {
      throw new Error(
        "Supabase credentials not found. Please check environment variables.",
      );
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // Create user
    const { data: userData, error: createUserError } =
      await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { full_name: fullName },
      });

    if (createUserError) {
      throw createUserError;
    }

    if (!userData.user) {
      throw new Error("Failed to create user");
    }

    // Create profile entry
    const { error: profileError } = await supabaseAdmin
      .from("profiles")
      .insert({
        id: userData.user.id,
        full_name: fullName,
        email: email,
      });

    if (profileError) {
      console.error("Error creating profile:", profileError);
      // Continue anyway as the user was created
    }

    return new Response(
      JSON.stringify({
        success: true,
        user: userData.user,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      },
    );
  } catch (error) {
    console.error("Error in direct-signup:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      },
    );
  }
});
