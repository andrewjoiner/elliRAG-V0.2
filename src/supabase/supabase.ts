import { createClient } from "@supabase/supabase-js";
import type { Database } from "../types/supabase";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

// Test function to verify connection
export const testSupabaseConnection = async () => {
  try {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .limit(1);
    if (error) {
      console.error("Supabase connection error:", error);
      return { success: false, error: error.message || JSON.stringify(error) };
    }
    console.log("Supabase connection successful:", data);
    return { success: true, data };
  } catch (error) {
    console.error("Supabase connection error:", error);
    const errorMessage =
      error instanceof Error ? error.message : JSON.stringify(error);
    return { success: false, error: errorMessage };
  }
};
