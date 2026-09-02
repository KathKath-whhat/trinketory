"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import ProductImage from "@/components/product-image";
import { getBagSummary, type BagSummary } from "@/app/actions/bag";
import { formatPrice } from "@/lib/format";
import {
  FREE_SHIPPING_CENTS,
  MAX_PER_LINE,
  getOpenServerSnapshot,
  getOpenSnapshot,
  getServerSnapshot,
  getSnapshot,
  pruneMissing,
  removeItem,
  setOpen,
  setQuantity,
  subscribe,
  subscribeOpen,
} from "@/lib/bag-store";

const EMPTY_SUMMARY: BagSummary = {
  lines: [],
  subtotalCents: 0,
  unavailable: [],
};

export default function BagDrawer() {
  const items = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const open = useSyncExternalStore(
    subscribeOpen,
    getOpenSnapshot,
    getOpenServerSnapshot,
  );

  /*
    A fingerprint of the bag. Results are stored against the fingerprint they
    were fetched for, which makes "is this stale?" a derived question rather
    than another piece of state to keep in sync.
  */
  const fingerprint = items
    .map((i) => `${i.variantId}:${i.quantity}`)
    .join(",");

  const [result, setResult] = useState<{ key: string; summary: BagSummary }>({
    key: "",
    summary: EMPTY_SUMMARY,
  });

  const closeRef = useRef<HTMLButtonElement>(null);
  const close = useCallback(() => setOpen(false), []);

  const [checkingOut, setCheckingOut] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  async function checkout() {
    setCheckingOut(true);
    setCheckoutError(null);

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items }),
      });

      const payload = await res.json();

      if (!res.ok || !payload.url) {
        setCheckoutError(payload.error ?? "Checkout could not start.");
        setCheckingOut(false);
        return;
      }

      /* Hand off to Stripe. The bag is cleared on the way back, not here —
         abandoning their hosted page must leave the bag intact. */
      window.location.href = payload.url;
    } catch {
      setCheckoutError("Could not reach checkout. Check your connection.");
      setCheckingOut(false);
    }
  }

  const summary = items.length === 0 ? EMPTY_SUMMARY : result.summary;
  const pending = items.length > 0 && result.key !== fingerprint;

  /*
    Re-price whenever the bag changes while the drawer is open. The `current`
    flag means a slow response for an older bag can never overwrite a newer
    one.
  */
  useEffect(() => {
    if (!open || items.length === 0) return;

    let current = true;

    getBagSummary(items)
      .then((next) => {
        if (!current) return;
        setResult({ key: fingerprint, summary: next });
        /* Forget anything the catalogue no longer has, so the header badge
           and the drawer agree. */
        pruneMissing(next.lines.map((l) => l.variantId));
      })
      .catch(() => {
        /* Record the attempt so the drawer settles instead of spinning. */
        if (current) setResult({ key: fingerprint, summary: EMPTY_SUMMARY });
      });

    return () => {
      current = false;
    };
  }, [items, fingerprint, open]);

  /* Escape closes; body scroll locks while the panel is over the page. */
  useEffect(() => {
    if (!open) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };

    document.addEventListener("keydown", onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();

    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [open, close]);

  if (!open) return null;

  const { lines, subtotalCents, unavailable } = summary;
  const remaining = FREE_SHIPPING_CENTS - subtotalCents;
  const empty = items.length === 0;

  return (
    <div
      className="fixed inset-0 z-50"
      role="dialog"
      aria-modal="true"
      aria-label="Your bag"
    >
      <button
        type="button"
        onClick={close}
        aria-label="Close bag"
        className="absolute inset-0 h-full w-full cursor-default bg-ink/20"
      />

      <aside className="absolute right-0 top-0 flex h-full w-full max-w-[420px] flex-col border-l border-line bg-canvas">
        <header className="flex items-center justify-between border-b border-line px-6 py-5">
          <h2 className="label text-ink">
            Your bag{lines.length > 0 ? ` (${lines.length})` : ""}
          </h2>
          <button
            ref={closeRef}
            type="button"
            onClick={close}
            className="label text-ink-muted hover:text-ink"
          >
            Close
          </button>
        </header>

        {empty ? (
          <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
            <p
              className="font-display text-2xl text-ink"
              style={{ fontVariationSettings: '"SOFT" 40, "WONK" 1' }}
            >
              Nothing in here yet.
            </p>
            <p className="mt-3 text-caption text-ink-muted">
              A bag with nothing in it is just a bag.
            </p>
            <Link
              href="/shop"
              onClick={close}
              className="label mt-8 border-b border-ink pb-1 text-ink transition-colors hover:border-accent hover:text-accent"
            >
              Go and look
            </Link>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto px-6">
              {pending && lines.length === 0 ? (
                <p className="label py-10 text-ink-faint">Checking prices…</p>
              ) : (
                <ul className="divide-y divide-line">
                  {lines.map((line) => (
                    <li key={line.variantId} className="flex gap-4 py-5">
                      <Link
                        href={`/product/${line.handle}`}
                        onClick={close}
                        className="w-20 shrink-0 bg-surface"
                      >
                        <ProductImage
                          category={line.categoryId}
                          hex={line.colour.hex}
                          aspect={1}
                          seed={line.variantId}
                        />
                      </Link>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-3">
                          <Link
                            href={`/product/${line.handle}`}
                            onClick={close}
                            className="text-caption leading-snug text-ink hover:text-accent"
                          >
                            {line.title}
                          </Link>
                          <p className="label shrink-0 tabular-nums text-ink-muted">
                            {formatPrice(line.lineTotalCents)}
                          </p>
                        </div>

                        <p className="label mt-1 text-ink-faint">
                          {line.colour.name}
                          {line.quantity > 1
                            ? ` · ${formatPrice(line.priceCents)} each`
                            : ""}
                        </p>

                        {line.inStock ? (
                          <div className="mt-3 flex items-center gap-4">
                            <div className="flex items-center border border-line">
                              <button
                                type="button"
                                onClick={() =>
                                  setQuantity(line.variantId, line.quantity - 1)
                                }
                                aria-label={`Reduce ${line.title}`}
                                className="px-2.5 py-1 text-caption text-ink-muted hover:text-ink"
                              >
                                −
                              </button>
                              <span className="label min-w-6 text-center tabular-nums text-ink">
                                {line.quantity}
                              </span>
                              <button
                                type="button"
                                onClick={() =>
                                  setQuantity(line.variantId, line.quantity + 1)
                                }
                                disabled={line.quantity >= MAX_PER_LINE}
                                aria-label={`Add another ${line.title}`}
                                className="px-2.5 py-1 text-caption text-ink-muted hover:text-ink disabled:opacity-40"
                              >
                                +
                              </button>
                            </div>

                            <button
                              type="button"
                              onClick={() => removeItem(line.variantId)}
                              className="label text-ink-faint hover:text-accent"
                            >
                              Remove
                            </button>
                          </div>
                        ) : (
                          <div className="mt-3 flex items-center gap-4">
                            <p className="label text-accent">Sold out</p>
                            <button
                              type="button"
                              onClick={() => removeItem(line.variantId)}
                              className="label text-ink-faint hover:text-accent"
                            >
                              Remove
                            </button>
                          </div>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <footer className="border-t border-line px-6 py-6">
              {unavailable.length > 0 && (
                <p className="mb-4 bg-accent-soft px-3 py-2 text-caption text-accent">
                  {unavailable.length === 1
                    ? "One piece sold out while it was in your bag."
                    : `${unavailable.length} pieces sold out while they were in your bag.`}{" "}
                  Remove to continue.
                </p>
              )}

              <div className="flex items-baseline justify-between">
                <p className="label text-ink-muted">Subtotal</p>
                <p className="label tabular-nums text-ink">
                  {formatPrice(subtotalCents)}
                </p>
              </div>

              <p className="mt-2 text-caption text-ink-faint">
                {remaining > 0
                  ? `${formatPrice(remaining)} away from free shipping.`
                  : "Free shipping unlocked."}
              </p>

              {checkoutError && (
                <p className="mt-4 bg-accent-soft px-3 py-2 text-caption text-accent">
                  {checkoutError}
                </p>
              )}

              <button
                type="button"
                onClick={checkout}
                disabled={
                  checkingOut ||
                  pending ||
                  unavailable.length > 0 ||
                  subtotalCents === 0
                }
                className="label mt-5 w-full bg-ink py-4 text-canvas transition-colors hover:bg-accent disabled:cursor-not-allowed disabled:bg-surface-deep disabled:text-ink-muted"
              >
                {checkingOut ? "Taking you to checkout…" : "Checkout"}
              </button>

              <p className="mt-3 text-center text-caption text-ink-faint">
                Shipping and taxes calculated at checkout.
              </p>
            </footer>
          </>
        )}
      </aside>
    </div>
  );
}
