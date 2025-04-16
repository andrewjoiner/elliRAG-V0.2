 // @ts-nocheck
 /// <reference lib="deno" />
 // @ts-nocheck
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
    // Get the Supabase URL and key from environment variables
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "https://obrkolpufyshzcoajwyo.supabase.co";
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
    const { action, email, password, fullName } = await req.json();

    // Handle different auth actions
    if (action === "sign_in") {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      return new Response(
        JSON.stringify({
          success: true,
          user: data.user,
          session: data.session,
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        },
      );
    } else if (action === "create_user") {
      // First check if user exists
      const { data: existingUsers } = await supabase
        .from("users")
        .select("*")
        .eq("email", email)
        .limit(1);

      if (existingUsers && existingUsers.length > 0) {
        throw new Error("User with this email already exists");
      }

      // Create user with admin privileges
      const { data: userData, error: userError } =
        await supabase.auth.admin.createUser({
          email,
          password,
          email_confirm: true, // Auto-confirm email
          user_metadata: { full_name: fullName },
        });

      if (userError) throw userError;

      // Create user profile
      if (userData.user) {
        const { error: profileError } = await supabase.from("users").insert({
          id: userData.user.id,
          email: email,
          full_name: fullName,
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
    } else if (action === "check_user") {
      // Check if user exists
      const { data: existingUsers } = await supabase
        .from("users")
        .select("*")
        .eq("email", email)
        .limit(1);

      return new Response(
        JSON.stringify({
          exists: existingUsers && existingUsers.length > 0,
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        },
      );
    }

    // If no valid action is provided
    return new Response(
      JSON.stringify({
        error: "Invalid action",
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      },
    );
  } catch (error) {
    console.error("Error in auth-debug function:", error);

    return new Response(
      JSON.stringify({
        error: error.message || "Internal server error",
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      },
    );
  }
});
