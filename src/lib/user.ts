import { supabase } from "@/supabase/supabase";

export interface UserProfile {
  id: string;
  full_name: string;
  email: string;
  avatar_url?: string;
  subscription_tier: string;
  total_chats: number;
  remaining_chats: number;
  billing_period_start: string;
  billing_period_end: string;
}

export interface UsageStats {
  totalChats: number;
  remainingChats: number;
  billingPeriodStart: string;
  billingPeriodEnd: string;
  plan: string;
  usageHistory: {
    period: string;
    count: number;
  }[];
}

// Get the current user's profile
export async function getUserProfile(): Promise<UserProfile> {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) throw new Error("User not authenticated");

    // Get user profile data
    const { data: profile, error: profileError } = await supabase
      .from("user_profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (profileError) {
      // If profile doesn't exist, create one
      if (profileError.code === "PGRST116") {
        return createUserProfile(
          user.id,
          user.user_metadata?.full_name || "",
          user.email || "",
        );
      }
      throw profileError;
    }

    return {
      id: profile.id,
      full_name: profile.full_name,
      email: user.email || "",
      avatar_url: profile.avatar_url,
      subscription_tier: profile.subscription_tier || "Free",
      total_chats: profile.total_chats || 500,
      remaining_chats: profile.remaining_chats || 500,
      billing_period_start:
        profile.billing_period_start || new Date().toISOString(),
      billing_period_end:
        profile.billing_period_end ||
        new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    };
  } catch (error) {
    console.error("Error getting user profile:", error);
    throw error;
  }
}

// Create a new user profile
async function createUserProfile(
  userId: string,
  fullName: string,
  email: string,
): Promise<UserProfile> {
  try {
    const now = new Date();
    const billingPeriodEnd = new Date(now);
    billingPeriodEnd.setDate(billingPeriodEnd.getDate() + 30);

    const { data: profile, error } = await supabase
      .from("user_profiles")
      .insert({
        id: userId,
        full_name: fullName,
        email: email,
        subscription_tier: "Free",
        total_chats: 500,
        remaining_chats: 500,
        billing_period_start: now.toISOString(),
        billing_period_end: billingPeriodEnd.toISOString(),
      })
      .select()
      .single();

    if (error) throw error;

    return {
      id: profile.id,
      full_name: profile.full_name,
      email: profile.email,
      avatar_url: profile.avatar_url,
      subscription_tier: profile.subscription_tier,
      total_chats: profile.total_chats,
      remaining_chats: profile.remaining_chats,
      billing_period_start: profile.billing_period_start,
      billing_period_end: profile.billing_period_end,
    };
  } catch (error) {
    console.error("Error creating user profile:", error);
    throw error;
  }
}

// Update user profile
export async function updateUserProfile(updates: Partial<UserProfile>) {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) throw new Error("User not authenticated");

    // Update auth metadata if full_name is provided
    if (updates.full_name) {
      await supabase.auth.updateUser({
        data: { full_name: updates.full_name },
      });
    }

    // Update profile in database
    const { error } = await supabase
      .from("user_profiles")
      .update({
        full_name: updates.full_name,
        avatar_url: updates.avatar_url,
      })
      .eq("id", user.id);

    if (error) throw error;

    return getUserProfile();
  } catch (error) {
    console.error("Error updating user profile:", error);
    throw error;
  }
}

// Get usage statistics
export async function getUsageStats(): Promise<UsageStats> {
  try {
    const profile = await getUserProfile();

    // Get chat history for usage stats
    const { data: chatHistory, error } = await supabase
      .from("chat_usage")
      .select("date, count")
      .order("date", { ascending: false })
      .limit(30);

    if (error) throw error;

    // Calculate usage for different time periods
    const today = new Date().toISOString().split("T")[0];
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0];
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0];

    const todayCount =
      chatHistory?.find((item) => item.date === today)?.count || 0;
    const yesterdayCount =
      chatHistory?.find((item) => item.date === yesterday)?.count || 0;

    const last7DaysCount =
      chatHistory
        ?.filter((item) => item.date >= sevenDaysAgo)
        .reduce((sum, item) => sum + item.count, 0) || 0;

    const totalPeriodCount = profile.total_chats - profile.remaining_chats;

    return {
      totalChats: profile.total_chats,
      remainingChats: profile.remaining_chats,
      billingPeriodStart: profile.billing_period_start,
      billingPeriodEnd: profile.billing_period_end,
      plan: profile.subscription_tier,
      usageHistory: [
        { period: "Today", count: todayCount },
        { period: "Yesterday", count: yesterdayCount },
        { period: "Last 7 days", count: last7DaysCount },
        { period: "This billing period", count: totalPeriodCount },
      ],
    };
  } catch (error) {
    console.error("Error getting usage stats:", error);
    throw error;
  }
}
