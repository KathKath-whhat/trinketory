import { Suspense } from "react";
import FilterRail from "@/components/filter-rail";
import ProductCard from "@/components/product-card";
import {
  getAvailableColours,
  getCategories,
  getCategory,
  getDepartment,
  getDepartments,
  getProducts,
  type SortKey,
} from "@/lib/catalog";

export const metadata = { title: "Shop" };

/* Catalogue changes show up within five minutes without a redeploy. */
export const revalidate = 300;

type SearchParams = Promise<{
  category?: string;
  department?: string;
  colour?: string;
  sort?: string;
}>;

export default async function ShopPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const sp = await searchParams;

  const category = sp.category;
  /* A category is more specific, so it wins if both are present. */
  const department = category ? undefined : sp.department;
  const colours = sp.colour?.split(",").filter(Boolean) ?? [];
  const sort = sp.sort as SortKey | undefined;

  const [
    products,
    availableColours,
    categories,
    departments,
    activeCategory,
    activeDepartment,
  ] = await Promise.all([
    getProducts({ category, department, colours, sort }),
    getAvailableColours(),
    getCategories(),
    getDepartments(),
    category ? getCategory(category) : Promise.resolve(null),
    department ? getDepartment(department) : Promise.resolve(null),
  ]);

  const active = activeCategory ?? activeDepartment;
  const heading = active?.name ?? "Everything";
  const blurb = active?.blurb ?? "The whole drawer.";

  return (
    <div className="mx-auto max-w-[1600px] px-5 py-12 md:px-10 md:py-16">
      <header className="max-w-xl">
        <h1
          className="font-display text-4xl leading-none text-ink md:text-5xl"
          style={{ fontVariationSettings: '"SOFT" 40, "WONK" 1' }}
        >
          {heading}
        </h1>
        <p className="mt-4 text-caption text-ink-muted">{blurb}</p>
      </header>

      <div className="mt-12 grid gap-10 lg:grid-cols-[200px_1fr] lg:gap-14">
        <aside>
          <Suspense fallback={<div className="label text-ink-faint">Loading filters…</div>}>
            <FilterRail
              categories={categories}
              departments={departments}
              colours={availableColours}
              resultCount={products.length}
            />
          </Suspense>
        </aside>

        <div>
          {products.length === 0 ? (
            <p className="py-20 text-center text-caption text-ink-muted">
              Nothing matches that combination. Try fewer colours.
            </p>
          ) : (
            <div className="masonry">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
