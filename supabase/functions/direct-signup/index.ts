import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.6";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // This is needed if you're planning to invoke your function from a browser.
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Get the Supabase URL and key from environment variables
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !supabaseKey) {
      throw new Error("Missing Supabase credentials");
    }

    // Create Supabase client with admin privileges
    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // Parse request body
    const { email, password, fullName } = await req.json();

    if (!email || !password || !fullName) {
      throw new Error("Missing required fields: email, password, or fullName");
    }

    // First check if user exists
    const { data: existingUsers, error: checkError } = await supabase
      .from("profiles")
      .select("*")
      .eq("email", email)
      .limit(1);

    if (checkError) {
      console.error("Error checking existing user:", checkError);
    }

    if (existingUsers && existingUsers.length > 0) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "User with this email already exists",
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        },
      );
    }

    // Create user with admin privileges
    const { data: userData, error: userError } =
      await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true, // Auto-confirm email
        user_metadata: { full_name: fullName },
      });

    if (userError) {
      console.error("Error creating user:", userError);
      throw userError;
    }

    // Create user profile
    if (userData.user) {
      const { error: profileError } = await supabase.from("profiles").insert({
        id: userData.user.id,
        email: email,
        full_name: fullName,
        role: "free",
      });

      if (profileError) {
        console.error("Error creating user profile:", profileError);
      }
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
    console.error("Error in direct-signup function:", error);

    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || "Internal server error",
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      },
    );
  }
});
