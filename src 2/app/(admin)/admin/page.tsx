"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Section, Stat } from "@/components/admin/stat";
import { getBrowserClient } from "@/lib/supabase-browser";
import { formatDate, formatPrice } from "@/lib/format";

const LOW_STOCK_AT = 3;

type Overview = {
  products: number;
  variants: number;
  categories: number;
  colours: number;
  totalUnits: number;
  soldOutVariants: number;
  lowStock: { id: string; stock: number; title: string; colour: string }[];
  dropsMade: number;
  dropsAvailable: number;
  nextDropNumber: number;
  priceMin: number;
  priceMax: number;
  priceAvg: number;
  orders: number;
  revenueCents: number;
  recent: { id: string; title: string; handle: string; created_at: string }[];
};

export default function AdminOverview() {
  const [data, setData] = useState<Overview | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const supabase = getBrowserClient();
    let active = true;

    async function load() {
      const [
        products,
        variants,
        categories,
        colours,
        orders,
        recent,
      ] = await Promise.all([
        supabase
          .from("products")
          .select("id, title, handle, drop_number, created_at, variants(in_stock)"),
        supabase
          .from("variants")
          .select(
            "id, stock, price_cents, in_stock, products(title), colours(name)",
          ),
        supabase.from("categories").select("id"),
        supabase.from("colours").select("id"),
        supabase.from("orders").select("id, total_cents, status"),
        supabase
          .from("products")
          .select("id, title, handle, created_at")
          .order("created_at", { ascending: false })
          .limit(6),
      ]);

      if (!active) return;

      const firstError =
        products.error ?? variants.error ?? categories.error ?? colours.error;
      if (firstError) {
        setError(firstError.message);
        return;
      }

      type VRow = {
        id: string;
        stock: number;
        price_cents: number;
        in_stock: boolean;
        products: { title: string } | null;
        colours: { name: string } | null;
      };

      type PRow = {
        id: string;
        title: string;
        handle: string;
        drop_number: number | null;
        created_at: string;
        variants: { in_stock: boolean }[] | null;
      };

      const vs = (variants.data ?? []) as unknown as VRow[];
      const ps = (products.data ?? []) as unknown as PRow[];
      const prices = vs.map((v) => v.price_cents);

      const drops = ps.filter((p) => p.drop_number !== null);

      /*
        Orders may legitimately fail or be empty — Stripe is not wired yet.
        Treat that as zero rather than an error, but never invent a number.
      */
      const os = (orders.data ?? []) as { total_cents: number; status: string }[];
      const paid = os.filter((o) => o.status !== "cancelled");

      const dropNumbers = ps
        .map((p) => p.drop_number)
        .filter((n): n is number => typeof n === "number");

      setData({
        products: ps.length,
        variants: vs.length,
        categories: (categories.data ?? []).length,
        colours: (colours.data ?? []).length,
        totalUnits: vs.reduce((sum, v) => sum + v.stock, 0),
        soldOutVariants: vs.filter((v) => !v.in_stock).length,
        lowStock: vs
          .filter((v) => v.stock > 0 && v.stock <= LOW_STOCK_AT)
          .map((v) => ({
            id: v.id,
            stock: v.stock,
            title: v.products?.title ?? v.id,
            colour: v.colours?.name ?? "—",
          }))
          .sort((a, b) => a.stock - b.stock),
        dropsMade: drops.length,
        dropsAvailable: drops.filter((p) =>
          (p.variants ?? []).some((v) => v.in_stock),
        ).length,
        nextDropNumber: dropNumbers.length ? Math.max(...dropNumbers) + 1 : 1,
        priceMin: prices.length ? Math.min(...prices) : 0,
        priceMax: prices.length ? Math.max(...prices) : 0,
        priceAvg: prices.length
          ? Math.round(prices.reduce((a, b) => a + b, 0) / prices.length)
          : 0,
        orders: os.length,
        revenueCents: paid.reduce((sum, o) => sum + o.total_cents, 0),
        recent: recent.data ?? [],
      });
    }

    load();
    return () => {
      active = false;
    };
  }, []);

  if (error) {
    return <p className="text-caption text-accent">Could not load: {error}</p>;
  }

  if (!data) {
    return <p className="label text-ink-faint">Loading…</p>;
  }

  return (
    <div>
      <h1
        className="font-display text-4xl text-ink"
        style={{ fontVariationSettings: '"SOFT" 40, "WONK" 1' }}
      >
        Overview
      </h1>

      <Section title="Catalogue">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <Stat label="Products" value={data.products} />
          <Stat
            label="Variants"
            value={data.variants}
            note={`${data.categories} categories · ${data.colours} colours`}
          />
          <Stat
            label="Units on hand"
            value={data.totalUnits}
            note="Across every variant"
          />
          <Stat
            label="Sold out"
            value={data.soldOutVariants}
            tone={data.soldOutVariants > 0 ? "warn" : "normal"}
            note="Variants at zero"
          />
        </div>
      </Section>

      <Section title="Pricing">
        <div className="grid gap-8 sm:grid-cols-3">
          <Stat label="Lowest" value={formatPrice(data.priceMin)} />
          <Stat label="Average" value={formatPrice(data.priceAvg)} />
          <Stat label="Highest" value={formatPrice(data.priceMax)} />
        </div>
      </Section>

      <Section title="One of one">
        <div className="grid gap-8 sm:grid-cols-3">
          <Stat label="Made to date" value={data.dropsMade} />
          <Stat label="Still available" value={data.dropsAvailable} />
          <Stat
            label="Next number"
            value={`№ ${data.nextDropNumber}`}
            note="Suggested for the next piece"
          />
        </div>
      </Section>

      <Section
        title="Low stock"
        action={
          <Link href="/admin/products" className="label text-ink-muted hover:text-ink">
            Manage
          </Link>
        }
      >
        {data.lowStock.length === 0 ? (
          <p className="py-6 text-caption text-ink-muted">
            Nothing running low. Everything in stock has more than{" "}
            {LOW_STOCK_AT} units.
          </p>
        ) : (
          <ul className="divide-y divide-line">
            {data.lowStock.map((v) => (
              <li
                key={v.id}
                className="flex items-center justify-between py-3 text-caption"
              >
                <span className="text-ink">
                  {v.title}{" "}
                  <span className="text-ink-faint">· {v.colour}</span>
                </span>
                <span className="label tabular-nums text-accent">
                  {v.stock} left
                </span>
              </li>
            ))}
          </ul>
        )}
      </Section>

      {/*
        Sales and finance read from the orders table. Stripe is connected and
        the webhook writes here on payment, so a zero on this page means zero
        sales — never a missing integration.
      */}
      <Section title="Sales">
        <div className="grid gap-8 sm:grid-cols-2">
          <Stat
            label="Orders"
            value={data.orders}
            tone={data.orders === 0 ? "quiet" : "normal"}
          />
          <Stat
            label="Revenue"
            value={formatPrice(data.revenueCents)}
            tone={data.orders === 0 ? "quiet" : "normal"}
          />
        </div>
        {data.orders === 0 && (
          <p className="mt-6 border-l-2 border-line pl-4 text-caption text-ink-muted">
            No orders yet. Checkout is live on Stripe, so these figures are read
            straight from the orders table and will fill in on their own with
            the first sale. Nothing here is sample data.
          </p>
        )}
      </Section>

      <Section
        title="Recently added"
        action={
          <Link href="/admin/products/new" className="label text-accent hover:underline">
            New product
          </Link>
        }
      >
        <ul className="divide-y divide-line">
          {data.recent.map((p) => (
            <li key={p.id} className="flex items-center justify-between py-3">
              <Link
                href={`/admin/products/${p.id}`}
                className="text-caption text-ink hover:text-accent"
              >
                {p.title}
              </Link>
              <span className="label text-ink-faint">
                {formatDate(p.created_at)}
              </span>
            </li>
          ))}
        </ul>
      </Section>
    </div>
  );
}
