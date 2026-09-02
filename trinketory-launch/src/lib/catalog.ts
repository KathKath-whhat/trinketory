import { supabase } from "@/lib/supabase";

/*
  The catalogue data layer.

  Every query lives here and returns plain objects, so nothing upstream knows
  or cares that the data comes from Postgres.

  Filtering and sorting happen in memory after a single fetch. That is a
  deliberate choice for a catalogue this size: it keeps the sort rules
  (featured first, sold-out sinks) in one readable place, and one round trip
  beats four. Revisit it past a few hundred pieces.
*/

export type Colour = {
  id: string;
  name: string;
  hex: string;
};

export type Category = {
  id: string;
  name: string;
  blurb: string;
};

export type Badge = "new" | "best-seller" | "last-one";

export type Variant = {
  id: string;
  colour: Colour;
  /* Minor units, so no float arithmetic ever touches money. */
  priceCents: number;
  inStock: boolean;
};

export type Product = {
  id: string;
  handle: string;
  title: string;
  categoryId: string;
  badge?: Badge;
  /*
    Numbered one-of-ones. A small catalogue reads as an event rather than a
    shelf. Numbered pieces have exactly one variant.
  */
  dropNumber?: number;
  description: string;
  details: string[];
  /*
    Image aspect ratio, expressed as height/width. Variety here is what makes
    the masonry read as Pinterest rather than as a grid with gaps.
  */
  aspect: number;
  featured: boolean;
  createdAt: string;
  /* Ordered storage paths in the product-images bucket. */
  imagePaths: string[];
  variants: Variant[];
};

/* ── Row shapes as they come back from PostgREST ──────────────────────── */

type ColourRow = { id: string; name: string; hex: string };

type VariantRow = {
  id: string;
  price_cents: number;
  in_stock: boolean;
  position: number;
  colours: ColourRow | null;
};

type ProductRow = {
  id: string;
  handle: string;
  title: string;
  category_id: string;
  badge: Badge | null;
  drop_number: number | null;
  description: string;
  details: string[] | null;
  aspect: number | string;
  featured: boolean;
  created_at: string;
  image_paths: string[] | null;
  variants: VariantRow[] | null;
};

const PRODUCT_SELECT = `
  id, handle, title, category_id, badge, drop_number, description, details,
  aspect, featured, created_at, image_paths,
  variants ( id, price_cents, in_stock, position, colours ( id, name, hex ) )
` as const;

function toProduct(row: ProductRow): Product {
  const variants = (row.variants ?? [])
    .filter((v): v is VariantRow & { colours: ColourRow } => v.colours !== null)
    .sort((a, b) => a.position - b.position)
    .map((v) => ({
      id: v.id,
      colour: v.colours,
      priceCents: v.price_cents,
      inStock: v.in_stock,
    }));

  return {
    id: row.id,
    handle: row.handle,
    title: row.title,
    categoryId: row.category_id,
    badge: row.badge ?? undefined,
    dropNumber: row.drop_number ?? undefined,
    description: row.description,
    details: row.details ?? [],
    /* numeric(4,2) arrives as a string over the wire. */
    aspect: Number(row.aspect),
    featured: row.featured,
    createdAt: row.created_at,
    imagePaths: row.image_paths ?? [],
    variants,
  };
}

/* ── Derived helpers ──────────────────────────────────────────────────── */

export function priceRange(product: Product): [number, number] {
  const prices = product.variants.map((v) => v.priceCents);
  if (prices.length === 0) return [0, 0];
  return [Math.min(...prices), Math.max(...prices)];
}

export function isSoldOut(product: Product): boolean {
  return product.variants.every((v) => !v.inStock);
}

export function colours(product: Product): Colour[] {
  const seen = new Map<string, Colour>();
  for (const v of product.variants) {
    if (!seen.has(v.colour.id)) seen.set(v.colour.id, v.colour);
  }
  return [...seen.values()];
}

/* ── Queries ──────────────────────────────────────────────────────────── */

export type SortKey = "featured" | "newest" | "price-asc" | "price-desc";

export type ProductQuery = {
  category?: string;
  colours?: string[];
  sort?: SortKey;
  oneOfOneOnly?: boolean;
};

async function fetchProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from("products")
    .select(PRODUCT_SELECT)
    .returns<ProductRow[]>();

  if (error) throw new Error(`Failed to load products: ${error.message}`);
  return (data ?? []).map(toProduct);
}

export async function getProducts(query: ProductQuery = {}): Promise<Product[]> {
  const { category, colours: colourIds, sort = "featured", oneOfOneOnly } = query;

  let results = await fetchProducts();

  if (oneOfOneOnly) {
    results = results.filter((p) => p.dropNumber !== undefined);
  }

  if (category) {
    results = results.filter((p) => p.categoryId === category);
  }

  if (colourIds?.length) {
    results = results.filter((p) =>
      p.variants.some((v) => colourIds.includes(v.colour.id)),
    );
  }

  switch (sort) {
    case "newest":
      results.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
      break;
    case "price-asc":
      results.sort((a, b) => priceRange(a)[0] - priceRange(b)[0]);
      break;
    case "price-desc":
      results.sort((a, b) => priceRange(b)[1] - priceRange(a)[1]);
      break;
    default:
      /* Featured first, then newest. Sold-out items sink. */
      results.sort((a, b) => {
        const soldOut = Number(isSoldOut(a)) - Number(isSoldOut(b));
        if (soldOut !== 0) return soldOut;
        const featured = Number(b.featured) - Number(a.featured);
        if (featured !== 0) return featured;
        return b.createdAt.localeCompare(a.createdAt);
      });
  }

  return results;
}

export async function getProduct(handle: string): Promise<Product | null> {
  const { data, error } = await supabase
    .from("products")
    .select(PRODUCT_SELECT)
    .eq("handle", handle)
    .maybeSingle<ProductRow>();

  if (error) throw new Error(`Failed to load ${handle}: ${error.message}`);
  return data ? toProduct(data) : null;
}

export async function getRelated(
  product: Product,
  limit = 4,
): Promise<Product[]> {
  const all = await fetchProducts();
  const sameCategory = all.filter(
    (p) => p.id !== product.id && p.categoryId === product.categoryId,
  );
  const rest = all.filter(
    (p) => p.id !== product.id && p.categoryId !== product.categoryId,
  );
  return [...sameCategory, ...rest].slice(0, limit);
}

export async function getDrops(): Promise<Product[]> {
  const all = await fetchProducts();
  return all
    .filter((p) => p.dropNumber !== undefined)
    .sort((a, b) => (b.dropNumber ?? 0) - (a.dropNumber ?? 0));
}

export async function getCategories(): Promise<Category[]> {
  const { data, error } = await supabase
    .from("categories")
    .select("id, name, blurb")
    .order("position");

  if (error) throw new Error(`Failed to load categories: ${error.message}`);
  return data ?? [];
}

export async function getCategory(id: string): Promise<Category | null> {
  const { data, error } = await supabase
    .from("categories")
    .select("id, name, blurb")
    .eq("id", id)
    .maybeSingle<Category>();

  if (error) throw new Error(`Failed to load category ${id}: ${error.message}`);
  return data;
}

/* ── Bag lines ────────────────────────────────────────────────────────── */

export type CartLine = {
  variantId: string;
  quantity: number;
  handle: string;
  title: string;
  categoryId: string;
  aspect: number;
  colour: Colour;
  /* Authoritative price, read from Postgres at call time. */
  priceCents: number;
  lineTotalCents: number;
  inStock: boolean;
};

type CartVariantRow = {
  id: string;
  price_cents: number;
  in_stock: boolean;
  colours: ColourRow | null;
  products: {
    handle: string;
    title: string;
    category_id: string;
    aspect: number | string;
  } | null;
};

/*
  Turns bag entries into displayable lines.

  Quantities come from the client; everything with a dollar sign attached
  comes from the database. Unknown variant ids are dropped rather than
  erroring — a piece can be deleted while it sits in somebody's bag.
*/
export async function resolveCartLines(
  entries: { variantId: string; quantity: number }[],
): Promise<CartLine[]> {
  const ids = [...new Set(entries.map((e) => e.variantId))].filter(Boolean);
  if (ids.length === 0) return [];

  const { data, error } = await supabase
    .from("variants")
    .select(
      "id, price_cents, in_stock, colours ( id, name, hex ), products ( handle, title, category_id, aspect )",
    )
    .in("id", ids)
    .returns<CartVariantRow[]>();

  if (error) throw new Error(`Failed to resolve bag: ${error.message}`);

  const byId = new Map((data ?? []).map((row) => [row.id, row]));

  return entries.flatMap((entry): CartLine[] => {
    const row = byId.get(entry.variantId);
    if (!row?.colours || !row.products) return [];

    const quantity = Math.min(Math.max(Math.floor(entry.quantity), 1), 10);

    return [
      {
        variantId: row.id,
        quantity,
        handle: row.products.handle,
        title: row.products.title,
        categoryId: row.products.category_id,
        aspect: Number(row.products.aspect),
        colour: row.colours,
        priceCents: row.price_cents,
        lineTotalCents: row.price_cents * quantity,
        inStock: row.in_stock,
      },
    ];
  });
}

/* Colours that actually appear in the catalogue, in palette order. */
export async function getAvailableColours(): Promise<Colour[]> {
  const { data, error } = await supabase
    .from("colours")
    .select("id, name, hex, variants!inner(id)")
    .order("position")
    .returns<(Colour & { variants: unknown[] })[]>();

  if (error) throw new Error(`Failed to load colours: ${error.message}`);

  /* !inner returns one row per matching variant, so collapse duplicates. */
  const seen = new Map<string, Colour>();
  for (const row of data ?? []) {
    if (!seen.has(row.id)) {
      seen.set(row.id, { id: row.id, name: row.name, hex: row.hex });
    }
  }
  return [...seen.values()];
}

/* -- Image URLs --------------------------------------------------------- */

const STORAGE_BASE = `${process.env.NEXT_PUBLIC_SUPABASE_URL ?? ""}/storage/v1/object/public/product-images`;

/*
  Public URL for one of a product's images. Index 0 is the card shot, index 1
  the hover shot. Returns undefined when a product has no photography, which
  is the signal for ProductImage to fall back to its drawn silhouette.
*/
export function productImage(product: Product, index = 0): string | undefined {
  const path = product.imagePaths[index];
  if (!path) return undefined;
  return `${STORAGE_BASE}/${path.split("/").map(encodeURIComponent).join("/")}`;
}
