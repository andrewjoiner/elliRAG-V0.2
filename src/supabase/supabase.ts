import { createClient } from "@supabase/supabase-js";
import type { Database } from "../types/supabase";

// Use correct Supabase URL and key
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Log the actual URL being used
console.log("Using Supabase URL:", supabaseUrl);

// Log connection details for debugging
console.log("Supabase connection attempt:", {
  url: supabaseUrl ? "URL exists" : "URL missing",
  key: supabaseAnonKey ? "Key exists" : "Key missing",
  fullUrl: supabaseUrl,
});

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Missing Supabase credentials. Check environment variables.");
}

// Create Supabase client with robust configuration
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
  global: {
    headers: {
      "Content-Type": "application/json",
    },
  },
  functionsUrl: `${supabaseUrl}/functions/v1`
} as any);

// Create enhanced client (used in auth.tsx)
export const enhancedSupabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
  global: {
    headers: {
      "Content-Type": "application/json",
    },
  },
  functionsUrl: `${supabaseUrl}/functions/v1`
} as any);

// Simple test function to verify connection
export const testSupabaseConnection = async () => {
  try {
    console.log("Testing Supabase connection...");

    // First try a simple health check
    const { error: healthError } = await supabase
      .from("profiles")
      .select("count", { count: "exact", head: true });

    if (healthError) {
      console.error("Supabase health check failed:", healthError);

      // Try a direct auth check as fallback
      const { data: authData, error: authError } =
        await supabase.auth.getSession();

      if (authError) {
        console.error("Auth check also failed:", authError);
        return { success: false, error: authError.message };
      }

      // Auth worked but DB didn't
      console.log("Auth connection works but database query failed");
      return {
        success: true,
        warning: "Auth connected but database queries may fail",
      };
    }

    console.log("Supabase connection successful");
    return { success: true };
  } catch (err) {
    console.error("Supabase connection test error:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : String(err),
    };
  }
};

// Run the test immediately
testSupabaseConnection();
