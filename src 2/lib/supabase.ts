import { createClient } from "@supabase/supabase-js";

/*
  Storefront Supabase client.

  This uses the publishable key, which is designed to be exposed — it ships
  in the browser bundle by definition. Access is enforced by row-level
  security instead: every catalogue table is select-only for `anon`, and
  there are no anon write policies. Writes go through the service role,
  which never reaches the client.
*/
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

if (!url || !key) {
  throw new Error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY. " +
      "Copy .env.example to .env.local and fill them in.",
  );
}

export const supabase = createClient(url, key, {
  auth: { persistSession: false },
});
