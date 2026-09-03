import type { MetadataRoute } from "next";

const BASE = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.trinketory.com"
).replace(/\/$/, "");

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        /*
          The admin panel is already gated by Supabase auth; keeping it out of
          the index is belt and braces. /search and /order are crawler noise,
          and /drops is unlinked until there is something on it.
        */
        disallow: ["/admin", "/api/", "/search", "/order/", "/drops"],
      },
    ],
    sitemap: `${BASE}/sitemap.xml`,
  };
}
