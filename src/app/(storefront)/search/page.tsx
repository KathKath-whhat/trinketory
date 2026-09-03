import Link from "next/link";
import ProductCard from "@/components/product-card";
import { colours, getCategories, getProducts } from "@/lib/catalog";

export const metadata = {
  title: "Search",
  description: "Search the Trinketory catalogue.",
};

export const revalidate = 300;

type SearchParams = Promise<{ q?: string }>;

/*
  Search over the whole catalogue.

  It runs in memory over the same single fetch the shop page uses, because at
  this size a Postgres full-text index would be more machinery than the
  problem deserves. A term matches on title, description, details, category
  name or colourway name, and every term has to match something — so
  "blue claw" narrows rather than widens.
*/
function score(haystack: string, terms: string[]): boolean {
  return terms.every((term) => haystack.includes(term));
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { q } = await searchParams;
  const query = (q ?? "").trim();
  const terms = query.toLowerCase().split(/\s+/).filter(Boolean);

  const [products, categories] = await Promise.all([
    getProducts({ sort: "featured" }),
    getCategories(),
  ]);

  const categoryName = new Map(categories.map((c) => [c.id, c.name]));

  const results = terms.length
    ? products.filter((p) =>
        score(
          [
            p.title,
            p.description,
            p.details.join(" "),
            categoryName.get(p.categoryId) ?? p.categoryId,
            colours(p)
              .map((c) => c.name)
              .join(" "),
          ]
            .join(" ")
            .toLowerCase(),
          terms,
        ),
      )
    : [];

  return (
    <div className="mx-auto max-w-[1600px] px-5 py-12 md:px-10 md:py-16">
      <header className="max-w-xl">
        <h1
          className="font-display text-4xl leading-none text-ink md:text-5xl"
          style={{ fontVariationSettings: '"SOFT" 40, "WONK" 1' }}
        >
          Search
        </h1>

        {/*
          A plain GET form. No client component, no debounce, no spinner —
          the whole catalogue is server-rendered in one round trip anyway.
        */}
        <form action="/search" className="mt-8 flex items-center gap-4">
          <input
            type="search"
            name="q"
            defaultValue={query}
            autoFocus
            placeholder="Claw, silk, blue, scrunchie…"
            aria-label="Search the catalogue"
            className="w-full border-b border-line bg-transparent py-2 text-caption text-ink focus:border-ink focus:outline-none"
          />
          <button type="submit" className="label shrink-0 text-ink hover:text-accent">
            Search
          </button>
        </form>
      </header>

      {terms.length === 0 ? (
        <div className="mt-16 max-w-xl">
          <p className="text-caption text-ink-muted">
            Try a material, a colour or a kind of thing — silk, tortoise, claw,
            headband.
          </p>
          <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/shop?category=${cat.id}`}
                className="label text-ink-muted hover:text-ink"
              >
                {cat.name}
              </Link>
            ))}
          </div>
        </div>
      ) : results.length === 0 ? (
        <div className="mt-16 max-w-xl">
          <p className="text-caption text-ink-muted">
            Nothing matches &ldquo;{query}&rdquo;.
          </p>
          <Link
            href="/shop"
            className="label mt-6 inline-block border-b border-ink pb-1 text-ink transition-colors hover:border-accent hover:text-accent"
          >
            Look at everything instead
          </Link>
        </div>
      ) : (
        <>
          <p className="label mt-10 text-ink-faint">
            {results.length} {results.length === 1 ? "piece" : "pieces"} for
            &ldquo;{query}&rdquo;
          </p>
          <div className="masonry mt-8">
            {results.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
