"use client";

import { useState } from "react";
import type { Product } from "@/lib/catalog";
import { formatPrice } from "@/lib/format";
import { addItem, setOpen } from "@/lib/bag-store";

/* Variant selection and the add-to-bag action. */
export default function VariantPicker({ product }: { product: Product }) {
  const firstAvailable =
    product.variants.find((v) => v.inStock) ?? product.variants[0];
  const [selectedId, setSelectedId] = useState(firstAvailable?.id ?? "");

  const selected =
    product.variants.find((v) => v.id === selectedId) ?? firstAvailable;

  if (!selected) return null;

  function addToBag() {
    if (!selected.inStock) return;
    addItem(selected.id);
    /* Opening the drawer is the confirmation — no toast needed. */
    setOpen(true);
  }

  return (
    <div>
      <p className="label mt-6 tabular-nums text-ink">
        {formatPrice(selected.priceCents)}
      </p>

      {product.variants.length > 1 && (
        <div className="mt-8">
          <h2 className="label text-ink-faint">
            Colour — {selected.colour.name}
          </h2>
          <ul className="mt-4 flex flex-wrap gap-3">
            {product.variants.map((variant) => {
              const active = variant.id === selected.id;
              return (
                <li key={variant.id}>
                  <button
                    type="button"
                    onClick={() => setSelectedId(variant.id)}
                    aria-pressed={active}
                    title={
                      variant.inStock
                        ? variant.colour.name
                        : `${variant.colour.name} — sold out`
                    }
                    className={`relative block h-8 w-8 rounded-full transition-all ${
                      active
                        ? "ring-2 ring-ink ring-offset-2 ring-offset-canvas"
                        : "ring-1 ring-line-strong hover:ring-ink-faint"
                    } ${variant.inStock ? "" : "opacity-45"}`}
                    style={{ backgroundColor: variant.colour.hex }}
                  >
                    <span className="sr-only">{variant.colour.name}</span>
                    {!variant.inStock && (
                      <span className="absolute inset-0 flex items-center justify-center">
                        <span className="h-px w-7 rotate-45 bg-ink/60" />
                      </span>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      <button
        type="button"
        onClick={addToBag}
        disabled={!selected.inStock}
        className="label mt-10 w-full bg-ink py-4 text-canvas transition-colors hover:bg-accent disabled:cursor-not-allowed disabled:bg-surface-deep disabled:text-ink-muted"
      >
        {selected.inStock ? "Add to bag" : "Sold out"}
      </button>

      {!selected.inStock && product.dropNumber !== undefined && (
        <p className="mt-4 text-caption text-ink-muted">
          This was a one-of-one. It is not coming back, but it stays listed —
          the archive is part of the point.
        </p>
      )}
    </div>
  );
}
