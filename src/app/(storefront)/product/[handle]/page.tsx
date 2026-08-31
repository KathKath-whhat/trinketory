import Link from "next/link";
import { notFound } from "next/navigation";
import ProductCard from "@/components/product-card";
import ProductImage from "@/components/product-image";
import VariantPicker from "@/components/variant-picker";
import {
  colours,
  getCategory,
  getProduct,
  getRelated,
  productImage,
} from "@/lib/catalog";

export const revalidate = 300;

type Params = Promise<{ handle: string }>;

export async function generateMetadata({ params }: { params: Params }) {
  const { handle } = await params;
  const product = await getProduct(handle);
  if (!product) return { title: "Not found" };
  return { title: product.title, description: product.description };
}

export default async function ProductPage({ params }: { params: Params }) {
  const { handle } = await params;
  const product = await getProduct(handle);

  if (!product) notFound();

  const [related, category] = await Promise.all([
    getRelated(product),
    getCategory(product.categoryId),
  ]);
  const palette = colours(product);

  return (
    <div className="mx-auto max-w-[1280px] px-5 py-10 md:px-10 md:py-14">
      <nav className="label text-ink-faint">
        <Link href="/shop" className="hover:text-ink">
          Shop
        </Link>
        <span className="mx-2">/</span>
        <Link
          href={`/shop?category=${product.categoryId}`}
          className="hover:text-ink"
        >
          {category?.name ?? product.categoryId}
        </Link>
      </nav>

      <div className="mt-8 grid gap-10 lg:grid-cols-2 lg:gap-16">
        {/*
          Gallery: one shot per colourway, stacked. Capped in width so the
          lead image never becomes a billboard on a wide monitor.
        */}
        <div className="w-full max-w-[560px] space-y-4 md:space-y-6">
          <div className="bg-surface">
            <ProductImage
              category={product.categoryId}
              hex={palette[0]?.hex ?? "#D6D0C7"}
              aspect={product.aspect}
              seed={product.id}
              src={productImage(product, 0)}
              alt={product.title}
            />
          </div>
          {product.imagePaths.length > 1 ? (
            <div className="grid grid-cols-2 gap-4 md:gap-6">
              {product.imagePaths.slice(1).map((path, i) => (
                <div key={path} className="bg-surface">
                  <ProductImage
                    category={product.categoryId}
                    hex={(palette[i + 1] ?? palette[0])?.hex ?? "#D6D0C7"}
                    aspect={1}
                    seed={`${product.id}-${i}`}
                    src={productImage(product, i + 1)}
                    alt={`${product.title}, view ${i + 2}`}
                  />
                </div>
              ))}
            </div>
          ) : (
            product.imagePaths.length === 0 && (
              <div className="grid grid-cols-2 gap-4 md:gap-6">
                <div className="bg-surface">
                  <ProductImage
                    category={product.categoryId}
                    hex={(palette[1] ?? palette[0])?.hex ?? "#D6D0C7"}
                    aspect={1}
                    seed={`${product.id}-b`}
                    variant="secondary"
                  />
                </div>
                <div className="bg-surface">
                  <ProductImage
                    category={product.categoryId}
                    hex={(palette[2] ?? palette[0])?.hex ?? "#D6D0C7"}
                    aspect={1}
                    seed={`${product.id}-c`}
                  />
                </div>
              </div>
            )
          )}
        </div>

        <div className="w-full max-w-[440px] lg:sticky lg:top-40 lg:self-start">
          {product.dropNumber !== undefined && (
            <p className="label text-accent">
              One of one · № {product.dropNumber}
            </p>
          )}

          <h1
            className="mt-3 font-display text-3xl leading-tight text-ink md:text-4xl"
            style={{ fontVariationSettings: '"SOFT" 40, "WONK" 1' }}
          >
            {product.title}
          </h1>

          <p className="mt-5 text-caption leading-relaxed text-ink-muted">
            {product.description}
          </p>

          <VariantPicker product={product} />

          <dl className="mt-10 border-t border-line pt-6">
            <dt className="label text-ink-faint">Details</dt>
            <dd>
              <ul className="mt-3 space-y-1.5">
                {product.details.map((detail) => (
                  <li key={detail} className="text-caption text-ink-muted">
                    {detail}
                  </li>
                ))}
              </ul>
            </dd>
          </dl>

          <p className="mt-8 text-caption text-ink-faint">
            Free shipping over $80 · 30-day returns on everything except
            one-of-ones.
          </p>
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-24 border-t border-line pt-12">
          <h2 className="label text-ink-faint">Goes with</h2>
          <div className="masonry mt-8">
            {related.map((item) => (
              <ProductCard key={item.id} product={item} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
