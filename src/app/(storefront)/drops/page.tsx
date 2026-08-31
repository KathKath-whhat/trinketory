import ProductCard from "@/components/product-card";
import { getDrops } from "@/lib/catalog";

export const metadata = {
  title: "One of One",
  description:
    "Numbered singles. Made once, listed once, and kept in the archive afterwards.",
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
        <p className="label mt-6 text-ink-faint">
          {available.length} available · {drops.length} made to date
        </p>
      </header>

      <div className="masonry mt-14">
        {drops.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
