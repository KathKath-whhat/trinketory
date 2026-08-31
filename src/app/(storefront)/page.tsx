import Link from "next/link";
import ProductCard from "@/components/product-card";
import ProductImage from "@/components/product-image";
import {
  colours,
  getCategories,
  getDrops,
  getProducts,
  priceRange,
  productImage,
} from "@/lib/catalog";
import { formatPrice } from "@/lib/format";

export const revalidate = 300;

export default async function HomePage() {
  const [featured, drops, categories] = await Promise.all([
    getProducts({ sort: "featured" }),
    getDrops(),
    getCategories(),
  ]);

  const latestDrop = drops[0];

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
            Clips, bows, charms and other objects that do one small job
            extremely well. Made in short runs — and occasionally, only once.
          </p>
          <div className="mt-6 flex gap-6">
            <Link
              href="/shop"
              className="label border-b border-ink pb-1 text-ink transition-colors hover:border-accent hover:text-accent"
            >
              Shop everything
            </Link>
            <Link
              href="/drops"
              className="label border-b border-transparent pb-1 text-ink-muted transition-colors hover:border-ink hover:text-ink"
            >
              One of one
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

      {latestDrop && (
        <section className="mt-24 border-t border-line pt-16">
          <div className="grid gap-10 md:grid-cols-2 md:gap-16">
            <Link href={`/product/${latestDrop.handle}`} className="group block">
              <div className="overflow-hidden bg-surface">
                <ProductImage
                  category={latestDrop.categoryId}
                  hex={colours(latestDrop)[0]?.hex ?? "#D6D0C7"}
                  aspect={0.8}
                  seed={latestDrop.id}
                  src={productImage(latestDrop, 0)}
                  alt={latestDrop.title}
                  className="transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                />
              </div>
            </Link>

            <div className="flex flex-col justify-center">
              <p className="label text-accent">
                One of one · № {latestDrop.dropNumber}
              </p>
              <h2
                className="mt-4 font-display text-3xl leading-tight text-ink md:text-4xl"
                style={{ fontVariationSettings: '"SOFT" 40, "WONK" 1' }}
              >
                {latestDrop.title}
              </h2>
              <p className="mt-5 max-w-md text-caption leading-relaxed text-ink-muted">
                {latestDrop.description}
              </p>
              <p className="label mt-6 text-ink">
                {formatPrice(priceRange(latestDrop)[0])}
              </p>
              <div className="mt-8">
                <Link
                  href={`/product/${latestDrop.handle}`}
                  className="label border-b border-ink pb-1 text-ink transition-colors hover:border-accent hover:text-accent"
                >
                  See the piece
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}

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
