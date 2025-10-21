// supabaseClient.js
import { createClient } from "https://cdn.skypack.dev/@supabase/supabase-js@2";

const url = window.PUBLIC_SUPABASE_URL;
const key = window.PUBLIC_SUPABASE_ANON_KEY;

if (!url || !key) {
  console.error("Supabase config missing. Set window.PUBLIC_SUPABASE_URL and window.PUBLIC_SUPABASE_ANON_KEY in HTML.");
}

export const supa = createClient(url, key);

// helpers
export async function signInEmailPassword(email, password) {
  const { data, error } = await supa.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

export async function getSession() {
  const { data } = await supa.auth.getSession();
  return data?.session || null;
}
