import Stripe from "stripe";

/*
  Server-only Stripe client.

  Created on demand rather than at module load. A missing key should fail
  the one request that needs Stripe, not the entire build — /api/checkout
  imports this module, and a throw at import time takes the whole app down
  before anyone has tried to buy anything.

  STRIPE_SECRET_KEY has no NEXT_PUBLIC_ prefix, so Next refuses to include
  this module in a client bundle. Never import it from a "use client" file.
*/
let client: Stripe | null = null;

export function getStripe(): Stripe {
  if (client) return client;

  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new Error(
      "STRIPE_SECRET_KEY is not set. Add it in Vercel → Settings → " +
        "Environment Variables, or in .env.local for local development.",
    );
  }

  client = new Stripe(key);
  return client;
}

/* Where Stripe sends people back to. */
export function siteUrl(): string {
  return (
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ??
    "http://localhost:3000"
  );
}
