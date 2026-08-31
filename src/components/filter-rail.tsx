"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo, useState } from "react";
import type { Category, Colour, SortKey } from "@/lib/catalog";

const SORTS: { value: SortKey; label: string }[] = [
  { value: "featured", label: "Featured" },
  { value: "newest", label: "Newest" },
  { value: "price-asc", label: "Price, low to high" },
  { value: "price-desc", label: "Price, high to low" },
];

/*
  Filters live in the URL, not in component state: every view is linkable,
  shareable and server-rendered. Colour is the primary axis — swatches read
  faster than a column of checkboxes, which is the one interaction Emi Jay
  gets unambiguously right.
*/
export default function FilterRail({
  categories,
  colours,
  resultCount,
}: {
  categories: Category[];
  colours: Colour[];
  resultCount: number;
}) {
  const router = useRouter();
  const params = useSearchParams();
  /*
    On desktop the rail is always open in the sidebar. On mobile it would
    otherwise push the entire grid below the fold, so it collapses behind a
    toggle and the products stay the first thing you see.
  */
  const [open, setOpen] = useState(false);

  const colourParam = params.get("colour");
  const selectedColours = useMemo(
    () => (colourParam?.split(",").filter(Boolean) ?? []) as string[],
    [colourParam],
  );
  const selectedCategory = params.get("category");
  const sort = (params.get("sort") as SortKey | null) ?? "featured";

  const push = useCallback(
    (next: URLSearchParams) => {
      const qs = next.toString();
      router.push(qs ? `/shop?${qs}` : "/shop", { scroll: false });
    },
    [router],
  );

  const setParam = useCallback(
    (key: string, value: string | null) => {
      const next = new URLSearchParams(params.toString());
      if (value) next.set(key, value);
      else next.delete(key);
      push(next);
    },
    [params, push],
  );

  const toggleColour = useCallback(
    (id: string) => {
      const next = selectedColours.includes(id)
        ? selectedColours.filter((c) => c !== id)
        : [...selectedColours, id];
      setParam("colour", next.length ? next.join(",") : null);
    },
    [selectedColours, setParam],
  );

  const hasFilters = selectedColours.length > 0 || !!selectedCategory;

  return (
    <div className="lg:sticky lg:top-40">
      <div className="flex items-center justify-between border-y border-line py-3 lg:hidden">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          className="label text-ink"
        >
          {open ? "Hide filters" : "Filter & sort"}
          {hasFilters && !open ? " ·" : ""}
          {hasFilters && !open ? (
            <span className="text-accent">
              {" "}
              {selectedColours.length + (selectedCategory ? 1 : 0)}
            </span>
          ) : null}
        </button>
        <p className="label text-ink-faint">{resultCount} pieces</p>
      </div>

      <div
        className={`space-y-9 pt-8 lg:block lg:pt-0 ${open ? "block" : "hidden"}`}
      >
        <div>
          <h2 className="label text-ink-faint">Category</h2>
          <ul className="mt-4 space-y-2">
            <li>
              <button
                type="button"
                onClick={() => setParam("category", null)}
                className={`text-caption transition-colors hover:text-ink ${
                  selectedCategory
                    ? "text-ink-muted"
                    : "text-ink underline underline-offset-4"
                }`}
              >
                Everything
              </button>
            </li>
            {categories.map((cat) => (
              <li key={cat.id}>
                <button
                  type="button"
                  onClick={() => setParam("category", cat.id)}
                  className={`text-caption transition-colors hover:text-ink ${
                    selectedCategory === cat.id
                      ? "text-ink underline underline-offset-4"
                      : "text-ink-muted"
                  }`}
                >
                  {cat.name}
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="label text-ink-faint">Colour</h2>
          <ul className="mt-4 flex flex-wrap gap-2.5">
            {colours.map((colour) => {
              const active = selectedColours.includes(colour.id);
              return (
                <li key={colour.id}>
                  <button
                    type="button"
                    onClick={() => toggleColour(colour.id)}
                    aria-pressed={active}
                    title={colour.name}
                    className={`block h-6 w-6 rounded-full transition-all ${
                      active
                        ? "ring-2 ring-ink ring-offset-2 ring-offset-canvas"
                        : "ring-1 ring-line-strong hover:ring-ink-faint"
                    }`}
                    style={{ backgroundColor: colour.hex }}
                  >
                    <span className="sr-only">{colour.name}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>

        <div>
          <h2 className="label text-ink-faint">Sort</h2>
          <select
            value={sort}
            onChange={(e) => setParam("sort", e.target.value)}
            className="mt-4 w-full border-b border-line bg-transparent py-2 text-caption text-ink focus:border-ink focus:outline-none"
          >
            {SORTS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-4 pt-2">
          <p className="label hidden text-ink-faint lg:block">
            {resultCount} {resultCount === 1 ? "piece" : "pieces"}
          </p>
          {hasFilters && (
            <button
              type="button"
              onClick={() => push(new URLSearchParams())}
              className="label text-accent hover:underline"
            >
              Clear all
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
