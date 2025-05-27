import { createClient } from "@supabase/supabase-js";
import type { Database } from "../types/database.types";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Log the Supabase URL and key (without revealing full key)
const maskedKey = supabaseAnonKey
  ? `${supabaseAnonKey.substring(0, 5)}...`
  : "not set";
console.log(`Supabase URL: ${supabaseUrl || "not set"}, Key: ${maskedKey}`);

// Ensure URL has https:// prefix and is properly formatted
let formattedUrl = supabaseUrl || "";

// Check if URL already has a protocol
if (!formattedUrl.startsWith("http")) {
  formattedUrl = `https://${formattedUrl}`;
}

// Make sure the URL doesn't have any path segments that would interfere with the API
if (formattedUrl.includes("/auth/v1")) {
  formattedUrl = formattedUrl.split("/auth/v1")[0];
}

// Fix for Vercel deployment - ensure we're using the correct domain format
if (
  formattedUrl.includes(".supabase.co") &&
  !formattedUrl.endsWith(".supabase.co")
) {
  // Extract the project reference
  const projectRef = formattedUrl.split(".")[0].split("//")[1];
  formattedUrl = `https://${projectRef}.supabase.co`;
}

// Validate that we have both URL and key before creating client
if (!formattedUrl || !supabaseAnonKey) {
  console.error(
    "Missing Supabase URL or Anonymous Key. Authentication will fail.",
  );
}

console.log(`Using formatted Supabase URL: ${formattedUrl}`);

export const supabase = createClient<Database>(
  formattedUrl,
  supabaseAnonKey || "",
);
