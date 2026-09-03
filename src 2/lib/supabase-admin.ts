import { createClient } from "@supabase/supabase-js";

/*
  Service-role client. Bypasses row-level security entirely.

  Used in exactly one place: the Stripe webhook, which has to write orders
  that no browser is allowed to write. The key has no NEXT_PUBLIC_ prefix,
  so Next refuses to bundle this module for the client — but treat that as
  a backstop, not permission. Never import this from a "use client" file,
  and never from a route that trusts anything a browser said.
*/
export function getServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY is not set. The Stripe webhook cannot record " +
        "orders without it. Find it in Supabase → Project Settings → API.",
    );
  }

  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
