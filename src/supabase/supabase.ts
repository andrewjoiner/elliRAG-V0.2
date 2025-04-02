import { createClient } from "@supabase/supabase-js";
import type { Database } from "../types/supabase";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Add more detailed logging to help diagnose the issue
console.log("Supabase initialization:", {
  url: supabaseUrl ? "URL exists" : "URL missing",
  key: supabaseAnonKey ? "Key exists" : "Key missing",
});

if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    "Missing Supabase credentials. Check your environment variables.",
  );
}

// Maximum number of retries for Supabase operations
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

// Helper function to add retry logic
const withRetry = async (
  operation: () => Promise<any>,
  retries = MAX_RETRIES,
) => {
  try {
    return await operation();
  } catch (error) {
    if (retries > 0) {
      console.log(
        `Operation failed, retrying... (${MAX_RETRIES - retries + 1}/${MAX_RETRIES})`,
      );
      await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY));
      return withRetry(operation, retries - 1);
    }
    throw error;
  }
};

// Create the Supabase client with additional options for better reliability
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
    fetch: (...args) => {
      console.log("Supabase fetch request initiated");
      return fetch(...args)
        .then((response) => {
          console.log("Supabase fetch response:", {
            status: response.status,
            ok: response.ok,
            statusText: response.statusText,
          });
          return response;
        })
        .catch((err) => {
          console.error("Supabase fetch error:", err);
          throw err;
        });
    },
  },
});

// Enhanced Supabase client with retry logic
export const enhancedSupabase = {
  auth: {
    signUp: async (credentials: any) => {
      return withRetry(() => supabase.auth.signUp(credentials));
    },
    signInWithPassword: async (credentials: any) => {
      return withRetry(() => supabase.auth.signInWithPassword(credentials));
    },
    signOut: async () => {
      return withRetry(() => supabase.auth.signOut());
    },
    getSession: async () => {
      return withRetry(() => supabase.auth.getSession());
    },
    getUser: async () => {
      return withRetry(() => supabase.auth.getUser());
    },
    onAuthStateChange: (callback: any) => {
      return supabase.auth.onAuthStateChange(callback);
    },
  },
  from: (table: string) => ({
    select: (columns: string) => ({
      eq: async (column: string, value: any) => {
        return withRetry(() =>
          supabase.from(table).select(columns).eq(column, value),
        );
      },
      single: async () => {
        return withRetry(() => supabase.from(table).select(columns).single());
      },
      limit: (limit: number) => ({
        eq: async (column: string, value: any) => {
          return withRetry(() =>
            supabase.from(table).select(columns).limit(limit).eq(column, value),
          );
        },
      }),
    }),
    insert: async (data: any) => {
      return withRetry(() => supabase.from(table).insert(data));
    },
    update: (data: any) => ({
      eq: async (column: string, value: any) => {
        return withRetry(() =>
          supabase.from(table).update(data).eq(column, value),
        );
      },
    }),
    delete: () => ({
      eq: async (column: string, value: any) => {
        return withRetry(() => supabase.from(table).delete().eq(column, value));
      },
    }),
  }),
  functions: {
    invoke: async (functionName: string, options?: any) => {
      return withRetry(() => supabase.functions.invoke(functionName, options));
    },
  },
};

// Add a simple test function to verify the client is working
export const testSupabaseConnection = async () => {
  try {
    console.log("Testing Supabase connection...");
    const { data, error } = await withRetry(() =>
      supabase.from("profiles").select("count", { count: "exact", head: true }),
    );

    if (error) {
      console.error("Supabase connection test failed:", error);
      return { success: false, error: error.message };
    }

    console.log("Supabase connection test successful");
    return { success: true };
  } catch (err) {
    console.error("Supabase connection test error:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : String(err),
    };
  }
};

// Run the test on import
testSupabaseConnection();
