import { supabase } from "@/supabase/supabase";

export interface ApiKey {
  id: string;
  key_name: string;
  api_key: string;
  created_at: string;
  last_used: string | null;
  is_active: boolean;
}

// Generate a new API key
export async function generateApiKey(keyName: string): Promise<ApiKey> {
  try {
    // Generate a random API key
    const apiKey = `elli_${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`;

    // Save to database
    const { data, error } = await supabase
      .from("api_keys")
      .insert({
        key_name: keyName,
        api_key: apiKey,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error generating API key:", error);
    throw error;
  }
}

// Get all API keys for the current user
export async function getApiKeys(): Promise<ApiKey[]> {
  try {
    const { data, error } = await supabase
      .from("api_keys")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Error fetching API keys:", error);
    throw error;
  }
}

// Deactivate an API key
export async function deactivateApiKey(keyId: string): Promise<void> {
  try {
    const { error } = await supabase
      .from("api_keys")
      .update({ is_active: false })
      .eq("id", keyId);

    if (error) throw error;
  } catch (error) {
    console.error("Error deactivating API key:", error);
    throw error;
  }
}

// Delete an API key
export async function deleteApiKey(keyId: string): Promise<void> {
  try {
    const { error } = await supabase.from("api_keys").delete().eq("id", keyId);

    if (error) throw error;
  } catch (error) {
    console.error("Error deleting API key:", error);
    throw error;
  }
}

// Update API key last used timestamp
export async function updateApiKeyUsage(keyId: string): Promise<void> {
  try {
    const { error } = await supabase
      .from("api_keys")
      .update({ last_used: new Date().toISOString() })
      .eq("id", keyId);

    if (error) throw error;
  } catch (error) {
    console.error("Error updating API key usage:", error);
    // Don't throw here as this is a non-critical operation
  }
}
