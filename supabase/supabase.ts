import { createClient } from "@supabase/supabase-js";

const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL ||
  "https://obrkolpufyshzcoajwyo.supabase.co";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "";

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

// Add a simple test function to verify the client is working
export const testSupabaseConnection = async () => {
  try {
    console.log("Testing Supabase connection...");
    const { data, error } = await supabase
      .from("profiles")
      .select("count", { count: "exact", head: true });

    if (error) {
      console.error("Supabase connection test failed:", error);
      return false;
    }

    console.log("Supabase connection test successful");
    return true;
  } catch (err) {
    console.error("Supabase connection test error:", err);
    return false;
  }
};

// Run the test on import
testSupabaseConnection();
