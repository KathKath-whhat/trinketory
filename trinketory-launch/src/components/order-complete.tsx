"use client";

import { useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { clearBag } from "@/lib/bag-store";

/*
  Confirmation after Stripe redirects back.

  The bag is emptied here rather than at checkout-start, so abandoning the
  Stripe page leaves everything intact. Payment itself is confirmed by the
  webhook, not by this page — arriving here means Stripe took the payment,
  but the order row may land a second or two later.
*/
export default function OrderComplete() {
  const params = useSearchParams();
  const sessionId = params.get("session_id");

  /* clearBag writes to the external store, not React state, and is
     idempotent — so this needs no guard beyond the session it keys on. */
  useEffect(() => {
    if (!sessionId) return;
    clearBag();
  }, [sessionId]);

  if (!sessionId) {
    return (
      <>
        <h1
          className="font-display text-4xl text-ink md:text-5xl"
          style={{ fontVariationSettings: '"SOFT" 40, "WONK" 1' }}
        >
          Nothing to see here.
        </h1>
        <p className="mt-4 max-w-md text-caption text-ink-muted">
          This page is for after a purchase, and there is no order attached to
          it.
        </p>
      </>
    );
  }

  return (
    <>
      <p className="label text-accent">Order placed</p>
      <h1
        className="mt-4 font-display text-4xl leading-tight text-ink md:text-5xl"
        style={{ fontVariationSettings: '"SOFT" 40, "WONK" 1' }}
      >
        Thank you. Genuinely.
      </h1>
      <p className="mt-5 max-w-md text-caption leading-relaxed text-ink-muted">
        A receipt is on its way to your inbox. Everything is packed by hand,
        usually within two working days — you will get a note when it ships.
      </p>
      <p className="label mt-8 text-ink-faint">
        Reference {sessionId.slice(-12)}
      </p>
    </>
  );
}
