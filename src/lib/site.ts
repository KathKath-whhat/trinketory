/*
  The shop's canonical address.

  This is used for canonical metadata, the sitemap, robots.txt and the URLs
  Stripe sends people back to after checkout — so it has to be the address
  customers actually see, not whichever deployment happens to be serving.

  NEXT_PUBLIC_SITE_URL still wins for local development, but a *.vercel.app
  value is ignored: that is a deployment hostname, and sending someone to it
  straight after they have paid looks like the payment went somewhere else.
*/
const CANONICAL = "https://www.trinketory.com";

function fromEnv(): string | null {
  const raw = process.env.NEXT_PUBLIC_SITE_URL?.trim().replace(/\/$/, "");
  if (!raw) return null;

  try {
    const { hostname } = new URL(raw);
    if (hostname.endsWith(".vercel.app")) return null;
    return raw;
  } catch {
    /* Not a usable URL. Fall back rather than break the build. */
    return null;
  }
}

export const SITE_URL = fromEnv() ?? CANONICAL;
