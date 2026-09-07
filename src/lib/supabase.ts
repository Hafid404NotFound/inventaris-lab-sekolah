import { createClient, SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  "https://cjepqirlzsdbypuqfsma.supabase.co";
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "sb_publishable_EP9d3m4YpNtgn38KZO1UdQ_r6Haikeh";

// Deklarasi variabel global agar instans tidak terbuat berulang saat hot reload
declare global {
  // eslint-disable-next-line no-var
  var __supabaseInstance: SupabaseClient | undefined;
}

export const supabase: SupabaseClient =
  globalThis.__supabaseInstance ||
  createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  });

// Simpan instans di globalThis hanya saat mode development / di browser
if (process.env.NODE_ENV !== "production") {
  globalThis.__supabaseInstance = supabase;
}
