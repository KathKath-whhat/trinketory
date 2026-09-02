"use client";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/*
  Browser client for the admin panel.

  The admin panel talks to Postgres directly from the browser using the
  same publishable key as the storefront. That is deliberate: there is no
  service_role key anywhere in this application, so there is no secret to
  leak. Authority comes entirely from row-level security — every write
  policy calls private.is_admin(), which resolves against the signed-in
  user's JWT. A non-admin with a valid session can read the catalogue and
  change nothing.

  Unlike the storefront client this one persists the session, so a refresh
  does not log you out.
*/

let client: SupabaseClient | null = null;

export function getBrowserClient(): SupabaseClient {
  if (client) return client;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!url || !key) {
    throw new Error("Supabase environment variables are missing.");
  }

  client = createClient(url, key, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      /* Distinct key so this never collides with the storefront client. */
      storageKey: "trinketory-admin-auth",
    },
  });

  return client;
}
