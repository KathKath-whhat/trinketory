"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { getBrowserClient } from "@/lib/supabase-browser";
import { formatPrice } from "@/lib/format";

type Row = {
  id: string;
  handle: string;
  title: string;
  category_id: string;
  drop_number: number | null;
  featured: boolean;
  image_paths: string[];
  variants: { price_cents: number; stock: number; in_stock: boolean }[] | null;
};

export default function AdminProducts() {
  const [rows, setRows] = useState<Row[] | null>(null);
  const [query, setQuery] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    getBrowserClient()
      .from("products")
      .select(
        "id, handle, title, category_id, drop_number, featured, image_paths, variants(price_cents, stock, in_stock)",
      )
      .order("created_at", { ascending: false })
      .then(({ data, error }) => {
        if (!active) return;
        if (error) setError(error.message);
        else setRows((data ?? []) as unknown as Row[]);
      });
    return () => {
      active = false;
    };
  }, []);

  const filtered = useMemo(() => {
    if (!rows) return [];
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter(
      (r) =>
        r.title.toLowerCase().includes(q) ||
        r.handle.includes(q) ||
        r.category_id.includes(q),
    );
  }, [rows, query]);

  if (error) return <p className="text-caption text-accent">{error}</p>;
  if (!rows) return <p className="label text-ink-faint">Loading…</p>;

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h1
          className="font-display text-4xl text-ink"
          style={{ fontVariationSettings: '"SOFT" 40, "WONK" 1' }}
        >
          Products
        </h1>
        <Link
          href="/admin/products/new"
          className="label bg-ink px-5 py-3 text-canvas transition-colors hover:bg-accent"
        >
          New product
        </Link>
      </div>

      <input
        placeholder="Search title, handle or category…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="mt-8 w-full max-w-sm border-b border-line bg-transparent py-2 text-caption text-ink focus:border-ink focus:outline-none"
      />

      <p className="label mt-4 text-ink-faint">
        {filtered.length} of {rows.length}
      </p>

      <ul className="mt-4 divide-y divide-line border-t border-line">
        {filtered.map((r) => {
          const vs = r.variants ?? [];
          const prices = vs.map((v) => v.price_cents);
          const units = vs.reduce((s, v) => s + v.stock, 0);
          const soldOut = vs.length > 0 && vs.every((v) => !v.in_stock);

          return (
            <li key={r.id} className="flex flex-wrap items-center gap-4 py-4">
              <div className="min-w-0 flex-1">
                <Link
                  href={`/admin/products/${r.id}`}
                  className="text-caption text-ink hover:text-accent"
                >
                  {r.title}
                </Link>
                <p className="label mt-1 text-ink-faint">
                  {r.category_id}
                  {r.drop_number !== null && ` · № ${r.drop_number}`}
                  {r.featured && " · featured"}
                  {r.image_paths.length === 0 && " · no photo"}
                </p>
              </div>

              <span className="label w-24 tabular-nums text-ink-muted">
                {prices.length ? formatPrice(Math.min(...prices)) : "—"}
              </span>

              <span
                className={`label w-24 tabular-nums ${
                  soldOut ? "text-accent" : units <= 3 ? "text-accent" : "text-ink-muted"
                }`}
              >
                {soldOut ? "Sold out" : `${units} units`}
              </span>

              <Link
                href={`/product/${r.handle}`}
                className="label text-ink-faint hover:text-ink"
              >
                View
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
