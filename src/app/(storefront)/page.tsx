import Link from "next/link";
import ProductCard from "@/components/product-card";
import ProductImage from "@/components/product-image";
import {
  colours,
  getDepartments,
  getProducts,
  isComingSoon,
  productImage,
  type Department,
  type Product,
} from "@/lib/catalog";

export const revalidate = 300;

/*
  Three factual promises, each linking to the page that explains it. The
  shipping threshold and the returns window are the same numbers the checkout
  and the returns policy use.
*/
const PROMISES = [
  {
    href: "/shipping",
    heading: "Free over $80",
    body: "Flat $9.50 otherwise, anywhere we ship. Packed by hand within two business days.",
  },
  {
    href: "/returns",
    heading: "30 days to change your mind",
    body: "Unworn, no form, no reason required. Faulty pieces are on us both ways.",
  },
  {
    href: "/care",
    heading: "Made to be kept",
    body: "Care notes for everything we make, so the small things last.",
  },
];

const DISPLAY = { fontVariationSettings: '"SOFT" 40, "WONK" 1' } as const;

/*
  Deals products out one department at a time, so a shop with forty hair
  pieces and three crochet flowers still shows the flowers near the top
  instead of on page four.
*/
function interleave(groups: Product[][]): Product[] {
  const out: Product[] = [];
  const longest = Math.max(0, ...groups.map((g) => g.length));
  for (let i = 0; i < longest; i++) {
    for (const g of groups) if (g[i]) out.push(g[i]);
  }
  return out;
}

function DepartmentTile({
  department,
  products,
}: {
  department: Department;
  products: Product[];
}) {
  const href = `/shop?department=${department.id}`;
  const lead = products.find((p) => p.imagePaths.length > 0) ?? products[0];
  const thumbs = products.filter((p) => p.id !== lead?.id).slice(0, 3);
  const allComingSoon = products.length > 0 && products.every(isComingSoon);

  return (
    <article className="group flex flex-col">
      <Link href={href} className="relative block overflow-hidden bg-surface">
        {lead && (
          <ProductImage
            category={lead.categoryId}
            hex={colours(lead)[0]?.hex ?? "#D6D0C7"}
            aspect={0.8}
            seed={`dept-${department.id}`}
            src={productImage(lead, 0)}
            alt={department.name}
            className="transition-transform duration-700 ease-out group-hover:scale-[1.03]"
          />
        )}
        {allComingSoon && (
          <span className="label absolute left-3 top-3 bg-accent-soft px-2 py-1 text-accent">
            Coming soon
          </span>
        )}
      </Link>

      {thumbs.length > 0 && (
        <div className="mt-2 grid grid-cols-3 gap-2">
          {thumbs.map((p) => (
            <Link
              key={p.id}
              href={`/product/${p.handle}`}
              className="block bg-surface"
              aria-label={p.title}
            >
              <ProductImage
                category={p.categoryId}
                hex={colours(p)[0]?.hex ?? "#D6D0C7"}
                aspect={1}
                seed={`thumb-${p.id}`}
                src={productImage(p, 0)}
                alt=""
              />
            </Link>
          ))}
        </div>
      )}

      <div className="mt-5 flex items-baseline justify-between gap-4">
        <Link href={href}>
          <h3
            className="font-display text-3xl text-ink transition-colors group-hover:text-accent md:text-4xl"
            style={DISPLAY}
          >
            {department.name}
          </h3>
        </Link>
        <span className="label shrink-0 text-ink-faint">
          {products.length} {products.length === 1 ? "piece" : "pieces"}
        </span>
      </div>
      <p className="mt-2 max-w-sm text-caption text-ink-muted">
        {department.blurb}
      </p>

      {department.categories.length > 1 && (
        <ul className="mt-4 flex flex-wrap gap-2">
          {department.categories.map((cat) => (
            <li key={cat.id}>
              <Link
                href={`/shop?category=${cat.id}`}
                className="label block border border-line px-3 py-1.5 text-ink-muted transition-colors hover:border-ink hover:text-ink"
              >
                {cat.name}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </article>
  );
}

export default async function HomePage() {
  const [products, departments] = await Promise.all([
    getProducts({ sort: "featured" }),
    getDepartments(),
  ]);

  const byDepartment = departments.map((d) => {
    const ids = new Set(d.categories.map((c) => c.id));
    return products.filter((p) => ids.has(p.categoryId));
  });

  const mixed = interleave(byDepartment).slice(0, 12);
  const names = departments.map((d) => d.name.toLowerCase());
  const range =
    names.length > 1
      ? `${names.slice(0, -1).join(", ")} and ${names[names.length - 1]}`
      : (names[0] ?? "small");

  return (
    <div className="mx-auto max-w-[1600px] px-5 md:px-10">
      <section className="grid gap-10 py-16 md:grid-cols-[1.2fr_1fr] md:items-end md:py-24">
        <h1
          className="max-w-2xl font-display text-5xl leading-[0.95] text-ink md:text-7xl"
          style={{ fontVariationSettings: '"SOFT" 60, "WONK" 1' }}
        >
          Small things,
          <br />
          taken seriously.
        </h1>
        <div className="max-w-sm md:pb-3">
          <p className="text-caption text-ink-muted">
            A drawer of {range} pieces, and whatever small, good thing we
            fall for next. Made in short runs and packed by hand in Sydney.
          </p>
          <ul className="mt-6 flex flex-wrap gap-x-6 gap-y-3">
            {departments.map((d) => (
              <li key={d.id}>
                <Link
                  href={`/shop?department=${d.id}`}
                  className="label border-b border-ink pb-1 text-ink transition-colors hover:border-accent hover:text-accent"
                >
                  {d.name}
                </Link>
              </li>
            ))}
            <li>
              <Link
                href="/shop"
                className="label border-b border-transparent pb-1 text-ink-muted transition-colors hover:border-ink hover:text-ink"
              >
                Everything
              </Link>
            </li>
          </ul>
        </div>
      </section>

      {/*
        Departments lead. Each is a doorway with its own picture, so the shop
        reads as several small worlds rather than one product type. A new
        department in Supabase appears here with no code change.
      */}
      <section>
        <div className="flex items-baseline justify-between border-b border-line pb-4">
          <h2 className="label text-ink-faint">Shop by world</h2>
          <span className="label text-ink-faint">
            {departments.length} {departments.length === 1 ? "world" : "worlds"}
          </span>
        </div>
        <div
          className={`mt-8 grid gap-x-8 gap-y-14 sm:grid-cols-2 ${
            departments.length >= 3 ? "lg:grid-cols-3" : ""
          }`}
        >
          {departments.map((d, i) => (
            <DepartmentTile key={d.id} department={d} products={byDepartment[i]} />
          ))}
        </div>
      </section>

      <section className="mt-24">
        <div className="flex items-baseline justify-between border-b border-line pb-4">
          <h2 className="label text-ink-faint">A bit of everything</h2>
          <Link href="/shop" className="label text-ink-muted hover:text-ink">
            All pieces
          </Link>
        </div>

        <div className="masonry mt-8">
          {mixed.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      <section className="mt-24 border-t border-line pt-16">
        <ul className="grid gap-10 md:grid-cols-3 md:gap-16">
          {PROMISES.map((promise) => (
            <li key={promise.href}>
              <Link href={promise.href} className="group block">
                <h2
                  className="font-display text-2xl text-ink transition-colors group-hover:text-accent"
                  style={DISPLAY}
                >
                  {promise.heading}
                </h2>
                <p className="mt-2 max-w-xs text-caption leading-relaxed text-ink-muted">
                  {promise.body}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
