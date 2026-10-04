"use client";

import { useState } from "react";
import type { Colour, Product, Variant } from "@/lib/catalog";
import { formatPrice } from "@/lib/format";
import { addItem, setOpen } from "@/lib/bag-store";

/*
  Variant selection and the add-to-bag action.

  A variant is a colour, optionally paired with a size. Products without
  sizes behave exactly as before: one row of colour swatches.
*/
export default function VariantPicker({ product }: { product: Product }) {
  const comingSoon = product.badge === "coming-soon";
  const variants = product.variants;

  const firstAvailable = variants.find((v) => v.inStock) ?? variants[0];
  const [colourId, setColourId] = useState(firstAvailable?.colour.id ?? "");
  const [size, setSize] = useState(firstAvailable?.size ?? "");

  const palette: Colour[] = [];
  for (const v of variants) {
    if (!palette.some((c) => c.id === v.colour.id)) palette.push(v.colour);
  }
  const sizeList = [...new Set(variants.map((v) => v.size).filter(Boolean))];

  /* Exact match first; otherwise the best option in the chosen colour. */
  const inColour = variants.filter((v) => v.colour.id === colourId);
  const selected: Variant | undefined =
    inColour.find((v) => v.size === size) ??
    inColour.find((v) => v.inStock) ??
    inColour[0] ??
    firstAvailable;

  if (!selected) return null;

  const sellable = selected.inStock && !comingSoon;

  function pickColour(id: string) {
    setColourId(id);
    /* Keep the chosen size if this colour has it, else fall to one it does. */
    const options = variants.filter((v) => v.colour.id === id);
    if (!options.some((v) => v.size === size)) {
      setSize((options.find((v) => v.inStock) ?? options[0])?.size ?? "");
    }
  }

  function addToBag() {
    if (!sellable || !selected) return;
    addItem(selected.id);
    /* Opening the drawer is the confirmation — no toast needed. */
    setOpen(true);
  }

  const swatchClass = (active: boolean, available: boolean) =>
    `relative block h-8 w-8 rounded-full transition-all ${
      active
        ? "ring-2 ring-ink ring-offset-2 ring-offset-canvas"
        : "ring-1 ring-line-strong hover:ring-ink-faint"
    } ${available ? "" : "opacity-45"}`;

  return (
    <div>
      <p className="label mt-6 tabular-nums text-ink">
        {formatPrice(selected.priceCents)}
      </p>

      {palette.length > 1 && (
        <div className="mt-8">
          <h2 className="label text-ink-faint">
            Colour — {selected.colour.name}
          </h2>
          <ul className="mt-4 flex flex-wrap gap-3">
            {palette.map((colour) => {
              const active = colour.id === selected.colour.id;
              const available = variants.some(
                (v) => v.colour.id === colour.id && v.inStock,
              );
              return (
                <li key={colour.id}>
                  <button
                    type="button"
                    onClick={() => pickColour(colour.id)}
                    aria-pressed={active}
                    title={available ? colour.name : `${colour.name} — sold out`}
                    className={swatchClass(active, available || comingSoon)}
                    style={{ backgroundColor: colour.hex }}
                  >
                    <span className="sr-only">{colour.name}</span>
                    {!available && !comingSoon && (
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

      {sizeList.length > 0 && (
        <div className="mt-8">
          <h2 className="label text-ink-faint">Size — {selected.size}</h2>
          <ul className="mt-4 flex flex-wrap gap-2">
            {sizeList.map((s) => {
              const match = inColour.find((v) => v.size === s);
              const active = s === selected.size;
              const available = !!match && (match.inStock || comingSoon);
              return (
                <li key={s}>
                  <button
                    type="button"
                    onClick={() => setSize(s)}
                    disabled={!match}
                    aria-pressed={active}
                    title={
                      !match
                        ? `${s} — not made in ${selected.colour.name}`
                        : available
                          ? s
                          : `${s} — sold out`
                    }
                    className={`label min-w-14 border px-4 py-2 transition-colors ${
                      active
                        ? "border-ink bg-ink text-canvas"
                        : "border-line-strong text-ink hover:border-ink"
                    } ${available ? "" : "line-through opacity-45"} disabled:cursor-not-allowed`}
                  >
                    {s}
                    {match && match.priceCents !== selected.priceCents && !active && (
                      <span className="ml-2 text-ink-faint">
                        {formatPrice(match.priceCents)}
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
        disabled={!sellable}
        className="label mt-10 w-full bg-ink py-4 text-canvas transition-colors hover:bg-accent disabled:cursor-not-allowed disabled:bg-surface-deep disabled:text-ink-muted"
      >
        {comingSoon ? "Coming soon" : selected.inStock ? "Add to bag" : "Sold out"}
      </button>

      {comingSoon && (
        <p className="mt-4 text-caption text-ink-muted">
          Still on the hook. This piece is being made now and will be available
          to order soon.
        </p>
      )}

      {!selected.inStock && !comingSoon && product.dropNumber !== undefined && (
        <p className="mt-4 text-caption text-ink-muted">
          This was a one-of-one. It is not coming back, but it stays listed —
          the archive is part of the point.
        </p>
      )}
    </div>
  );
}
