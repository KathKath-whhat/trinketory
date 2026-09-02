import Link from "next/link";
import ProductImage from "@/components/product-image";
import {
  colours,
  isSoldOut,
  priceRange,
  productImage,
  type Badge,
  type Product,
} from "@/lib/catalog";
import { formatPrice } from "@/lib/format";

const BADGE_LABEL: Record<Badge, string> = {
  new: "New",
  "best-seller": "Best seller",
  "last-one": "Last one",
};

/*
  No border, no shadow, no card. Image, then a short caption underneath —
  whitespace does the separating. The only motion is the hover cross-fade
  between the two shots, lifted from Emi Jay.
*/
export default function ProductCard({ product }: { product: Product }) {
  const [min, max] = priceRange(product);
  const soldOut = isSoldOut(product);
  const palette = colours(product);
  const lead = palette[0];
  const hover = palette[1] ?? lead;
  const badge = soldOut
    ? "Sold out"
    : product.badge
      ? BADGE_LABEL[product.badge]
      : null;

  return (
    <article className="group">
      <Link href={`/product/${product.handle}`} className="block">
        <div className="relative overflow-hidden bg-surface">
          {/*
            Hover shot sits underneath. Both children are positioned, so DOM
            order decides paint order — the primary shot is later and wins
            until its opacity drops.
          */}
          <div className="absolute inset-0">
            <ProductImage
              category={product.categoryId}
              hex={hover?.hex ?? "#D6D0C7"}
              aspect={product.aspect}
              seed={product.id}
              variant="secondary"
              src={productImage(product, 1) ?? productImage(product, 0)}
              className="h-full w-full"
            />
          </div>

          <ProductImage
            category={product.categoryId}
            hex={lead?.hex ?? "#D6D0C7"}
            aspect={product.aspect}
            seed={product.id}
            src={productImage(product, 0)}
            alt={product.title}
            className="relative transition-opacity duration-500 ease-out group-hover:opacity-0"
          />

          {badge && (
            <span
              className={`label absolute left-3 top-3 px-2 py-1 ${
                soldOut
                  ? "bg-canvas/85 text-ink-muted"
                  : "bg-accent-soft text-accent"
              }`}
            >
              {badge}
            </span>
          )}

          {product.dropNumber !== undefined && (
            <span className="label absolute right-3 top-3 bg-canvas/85 px-2 py-1 text-ink-muted">
              № {product.dropNumber}
            </span>
          )}
        </div>

        <div className="mt-3 flex items-start justify-between gap-3">
          <h3 className="text-caption leading-snug text-ink">{product.title}</h3>
          <p className="label shrink-0 pt-0.5 tabular-nums text-ink-muted">
            {min === max ? formatPrice(min) : `From ${formatPrice(min)}`}
          </p>
        </div>
      </Link>

      {palette.length > 1 && (
        <ul className="mt-2 flex items-center gap-1.5">
          {palette.slice(0, 5).map((colour) => (
            <li
              key={colour.id}
              title={colour.name}
              className="h-2.5 w-2.5 rounded-full ring-1 ring-line-strong/60"
              style={{ backgroundColor: colour.hex }}
            />
          ))}
          {palette.length > 5 && (
            <li className="label text-ink-faint">+{palette.length - 5}</li>
          )}
        </ul>
      )}
    </article>
  );
}
