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
    const { action, userId, role, subscriptionId, metadata } = await req.json();

    // Handle different user management actions
    if (action === "assign_role") {
      // Validate required parameters
      if (!userId || !role) {
        throw new Error("Missing required parameters: userId and role");
      }

      // Update user's role in auth.users metadata
      const { error: updateError } = await supabase.auth.admin.updateUserById(
        userId,
        { user_metadata: { role } },
      );

      if (updateError) throw updateError;

      // Update user's role in profiles table for easier querying
      const { error: profileError } = await supabase
        .from("profiles")
        .update({ role })
        .eq("id", userId);

      if (profileError) throw profileError;

      return new Response(
        JSON.stringify({
          success: true,
          message: `Role '${role}' assigned to user ${userId}`,
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        },
      );
    } else if (action === "provision_user") {
      // Validate required parameters
      if (!userId) {
        throw new Error("Missing required parameter: userId");
      }

      // Get user details
      const { data: userData, error: userError } =
        await supabase.auth.admin.getUserById(userId);

      if (userError) throw userError;
      if (!userData.user) throw new Error("User not found");

      // Check if profile exists
      const { data: existingProfile, error: profileCheckError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (profileCheckError && profileCheckError.code !== "PGRST116") {
        // PGRST116 means no rows returned, which is expected if profile doesn't exist
        throw profileCheckError;
      }

      // If profile doesn't exist, create it
      if (!existingProfile) {
        const defaultRole = "free";
        const { error: createProfileError } = await supabase
          .from("profiles")
          .insert({
            id: userId,
            full_name: userData.user.user_metadata?.full_name || null,
            avatar_url: userData.user.user_metadata?.avatar_url || null,
            role: defaultRole,
          });

        if (createProfileError) throw createProfileError;

        // Also update auth user metadata with role
        await supabase.auth.admin.updateUserById(userId, {
          user_metadata: {
            ...userData.user.user_metadata,
            role: defaultRole,
          },
        });
      }

      // If subscription ID is provided, link user to subscription
      if (subscriptionId) {
        const { error: subscriptionError } = await supabase
          .from("subscriptions")
          .update({ user_id: userId })
          .eq("id", subscriptionId);

        if (subscriptionError) throw subscriptionError;
      }

      // If additional metadata is provided, update user metadata
      if (metadata) {
        const { error: metadataError } =
          await supabase.auth.admin.updateUserById(userId, {
            user_metadata: { ...userData.user.user_metadata, ...metadata },
          });

        if (metadataError) throw metadataError;
      }

      return new Response(
        JSON.stringify({
          success: true,
          message: `User ${userId} provisioned successfully`,
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        },
      );
    } else if (action === "update_subscription_status") {
      // Validate required parameters
      if (!userId || !metadata?.subscription_status) {
        throw new Error(
          "Missing required parameters: userId and subscription_status",
        );
      }

      // Get user details
      const { data: userData, error: userError } =
        await supabase.auth.admin.getUserById(userId);

      if (userError) throw userError;
      if (!userData.user) throw new Error("User not found");

      // Update user metadata with subscription status
      const { error: updateError } = await supabase.auth.admin.updateUserById(
        userId,
        {
          user_metadata: {
            ...userData.user.user_metadata,
            subscription_status: metadata.subscription_status,
          },
        },
      );

      if (updateError) throw updateError;

      // Assign appropriate role based on subscription status
      let role = "free";
      if (metadata.subscription_status === "active") {
        role = metadata.plan || "premium";
      }

      // Update user's role in profiles table
      const { error: profileError } = await supabase
        .from("profiles")
        .update({ role })
        .eq("id", userId);

      if (profileError) throw profileError;

      return new Response(
        JSON.stringify({
          success: true,
          message: `Subscription status updated for user ${userId}`,
          role: role,
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
    console.error("Error in user-management function:", error);

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
