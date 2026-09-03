import type { MetadataRoute } from "next";
import { getCategories, getProducts } from "@/lib/catalog";

const BASE = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.trinketory.com"
).replace(/\/$/, "");

/* Rebuilt hourly; the catalogue itself revalidates every five minutes. */
export const revalidate = 3600;

/*
  /search, /order/complete and /drops are deliberately absent: the first two
  are useless to a crawler and the third has nothing on it until a numbered
  piece exists.
*/
const STATIC_PATHS = [
  "",
  "/shop",
  "/about",
  "/shipping",
  "/returns",
  "/faq",
  "/care",
  "/contact",
  "/privacy",
  "/terms",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [products, categories] = await Promise.all([
    getProducts(),
    getCategories(),
  ]);

  const now = new Date();

  return [
    ...STATIC_PATHS.map((path) => ({
      url: `${BASE}${path}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: path === "" ? 1 : 0.5,
    })),
    ...categories.map((category) => ({
      url: `${BASE}/shop?category=${category.id}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
    ...products.map((product) => ({
      url: `${BASE}/product/${product.handle}`,
      lastModified: new Date(product.createdAt),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
  ];
}
