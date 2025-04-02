import { supabase } from "../supabase/supabase";

/**
 * Assigns a role to a user
 * @param userId The user ID to assign the role to
 * @param role The role to assign (e.g., 'free', 'premium', 'admin')
 */
export const assignUserRole = async (userId: string, role: string) => {
  try {
    const { data, error } = await supabase.functions.invoke(
      "supabase-functions-user-management",
      {
        body: { action: "assign_role", userId, role },
      },
    );

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error("Error assigning user role:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
};

/**
 * Provisions a user by creating necessary profile records and setting up default values
 * @param userId The user ID to provision
 * @param metadata Optional additional metadata to store with the user
 */
export const provisionUser = async (
  userId: string,
  metadata?: Record<string, any>,
) => {
  try {
    const { data, error } = await supabase.functions.invoke(
      "supabase-functions-user-management",
      {
        body: { action: "provision_user", userId, metadata },
      },
    );

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error("Error provisioning user:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
};

/**
 * Updates a user's subscription status and assigns appropriate role
 * @param userId The user ID to update
 * @param subscriptionStatus The subscription status ('active', 'trialing', 'canceled', etc.)
 * @param plan Optional plan name if the subscription is active
 */
export const updateSubscriptionStatus = async (
  userId: string,
  subscriptionStatus: string,
  plan?: string,
) => {
  try {
    const { data, error } = await supabase.functions.invoke(
      "supabase-functions-user-management",
      {
        body: {
          action: "update_subscription_status",
          userId,
          metadata: { subscription_status: subscriptionStatus, plan },
        },
      },
    );

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error("Error updating subscription status:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
};

/**
 * Gets the current user's role
 * @returns The user's role or null if not authenticated
 */
export const getCurrentUserRole = async () => {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Not authenticated" };

    // First try to get role from user metadata
    const roleFromMetadata = user.user_metadata?.role;
    if (roleFromMetadata) {
      return { success: true, role: roleFromMetadata };
    }

    // If not in metadata, try to get from profiles table
    const { data: profile, error } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (error) throw error;
    return { success: true, role: profile?.role || "free" };
  } catch (error) {
    console.error("Error getting user role:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
};
