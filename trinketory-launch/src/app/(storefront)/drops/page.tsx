import Link from "next/link";
import ProductCard from "@/components/product-card";
import { getDrops } from "@/lib/catalog";

export const metadata = {
  title: "One of One",
  description:
    "Numbered singles. Made once, listed once, and kept in the archive afterwards.",
  /*
    Unlinked from the nav until a numbered piece actually exists, so keep it
    out of the index too — an empty page is not what we want people landing
    on from a search result.
  */
  robots: { index: false, follow: false },
};

export const revalidate = 300;

export default async function DropsPage() {
  const drops = await getDrops();
  const available = drops.filter((d) => d.variants.some((v) => v.inStock));

  return (
    <div className="mx-auto max-w-[1600px] px-5 py-12 md:px-10 md:py-16">
      <header className="max-w-xl">
        <h1
          className="font-display text-4xl leading-none text-ink md:text-5xl"
          style={{ fontVariationSettings: '"SOFT" 40, "WONK" 1' }}
        >
          One of one
        </h1>
        <p className="mt-5 text-caption leading-relaxed text-ink-muted">
          Numbered singles. Each is made once — usually because the material
          only existed once — and then it is gone. Sold pieces stay on this
          page. The archive is part of the point.
        </p>
        {drops.length > 0 && (
          <p className="label mt-6 text-ink-faint">
            {available.length} available · {drops.length} made to date
          </p>
        )}
      </header>

      {drops.length === 0 ? (
        <div className="mt-14 max-w-xl border-t border-line pt-10">
          <p className="text-caption leading-relaxed text-ink-muted">
            Nothing here at the moment. The next numbered piece goes up when it
            is finished, which is rarely on a schedule.
          </p>
          <Link
            href="/shop"
            className="label mt-6 inline-block border-b border-ink pb-1 text-ink transition-colors hover:border-accent hover:text-accent"
          >
            Shop everything
          </Link>
        </div>
      ) : (
        <div className="masonry mt-14">
          {drops.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
