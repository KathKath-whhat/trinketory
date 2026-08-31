"use client";

import { useEffect, useState } from "react";
import { getBrowserClient } from "@/lib/supabase-browser";
import { formatDate, formatPrice } from "@/lib/format";

type Order = {
  id: string;
  status: string;
  email: string | null;
  total_cents: number;
  created_at: string;
  order_items: { quantity: number }[] | null;
};

export default function AdminOrders() {
  const [rows, setRows] = useState<Order[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    getBrowserClient()
      .from("orders")
      .select("id, status, email, total_cents, created_at, order_items(quantity)")
      .order("created_at", { ascending: false })
      .limit(100)
      .then(({ data, error }) => {
        if (!active) return;
        if (error) setError(error.message);
        else setRows((data ?? []) as unknown as Order[]);
      });
    return () => {
      active = false;
    };
  }, []);

  if (error) return <p className="text-caption text-accent">{error}</p>;
  if (!rows) return <p className="label text-ink-faint">Loading…</p>;

  return (
    <div>
      <h1
        className="font-display text-4xl text-ink"
        style={{ fontVariationSettings: '"SOFT" 40, "WONK" 1' }}
      >
        Orders
      </h1>

      {rows.length === 0 ? (
        <div className="mt-10 max-w-md border-l-2 border-line pl-5">
          <p className="text-caption leading-relaxed text-ink-muted">
            No orders yet. This reads the real orders table — it is empty
            because checkout is not connected to Stripe, so nothing has ever
            been purchased.
          </p>
          <p className="mt-4 text-caption leading-relaxed text-ink-faint">
            Once Stripe is wired, paid orders arrive here automatically via
            webhook. Nothing on this page is placeholder data.
          </p>
        </div>
      ) : (
        <ul className="mt-8 divide-y divide-line border-t border-line">
          {rows.map((o) => (
            <li key={o.id} className="flex flex-wrap items-center gap-4 py-4">
              <span className="label w-24 text-ink-faint">
                {formatDate(o.created_at)}
              </span>
              <span className="min-w-0 flex-1 text-caption text-ink">
                {o.email ?? "—"}
              </span>
              <span className="label w-24 text-ink-muted">
                {(o.order_items ?? []).reduce((s, i) => s + i.quantity, 0)} items
              </span>
              <span className="label w-24 tabular-nums text-ink">
                {formatPrice(o.total_cents)}
              </span>
              <span
                className={`label w-24 ${
                  o.status === "paid"
                    ? "text-accent"
                    : o.status === "fulfilled"
                      ? "text-ink"
                      : "text-ink-faint"
                }`}
              >
                {o.status}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
