import Link from "next/link";
import ProductCard from "@/components/product-card";
import { getCategories, getProducts } from "@/lib/catalog";

export const revalidate = 300;

/*
  Three factual promises, each linking to the page that explains it. Not
  marketing copy — the shipping threshold and the returns window here are the
  same numbers the checkout and the returns policy use.
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
    body: "Real acetate, mulberry silk, gold-plated brass. Here is how to look after it.",
  },
];

export default async function HomePage() {
  const [featured, categories] = await Promise.all([
    getProducts({ sort: "featured" }),
    getCategories(),
  ]);

  return (
    <div className="mx-auto max-w-[1600px] px-5 md:px-10">
      {/*
        No hero banner. A Pinterest-feeling site earns attention with the
        grid, so the type block is deliberately short and the products start
        above the fold on most screens.
      */}
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
            Clips, bows, scrunchies and other objects that do one small job
            extremely well. Made in short runs and packed by hand in Sydney.
          </p>
          <div className="mt-6 flex gap-6">
            <Link
              href="/shop"
              className="label border-b border-ink pb-1 text-ink transition-colors hover:border-accent hover:text-accent"
            >
              Shop everything
            </Link>
            <Link
              href="/about"
              className="label border-b border-transparent pb-1 text-ink-muted transition-colors hover:border-ink hover:text-ink"
            >
              About us
            </Link>
          </div>
        </div>
      </section>

      <section>
        <div className="flex items-baseline justify-between border-b border-line pb-4">
          <h2 className="label text-ink-faint">In the drawer</h2>
          <Link href="/shop" className="label text-ink-muted hover:text-ink">
            All pieces
          </Link>
        </div>

        <div className="masonry mt-8">
          {featured.slice(0, 12).map((product) => (
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
                  style={{ fontVariationSettings: '"SOFT" 40, "WONK" 1' }}
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

      <section className="mt-24 border-t border-line pt-16">
        <h2 className="label text-ink-faint">By kind</h2>
        <ul className="mt-8 grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((cat) => (
            <li key={cat.id}>
              <Link href={`/shop?category=${cat.id}`} className="group block">
                <h3
                  className="font-display text-2xl text-ink transition-colors group-hover:text-accent"
                  style={{ fontVariationSettings: '"SOFT" 40, "WONK" 1' }}
                >
                  {cat.name}
                </h3>
                <p className="mt-1.5 text-caption text-ink-muted">{cat.blurb}</p>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
