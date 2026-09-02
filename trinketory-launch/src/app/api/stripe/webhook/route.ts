import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { getServiceClient } from "@/lib/supabase-admin";
import { getStripe } from "@/lib/stripe";

export const runtime = "nodejs";

type Item = { variant_id: string; quantity: number; unit_price_cents: number };

/* Rebuilds the chunked item list written at session creation. */
function unpackItems(metadata: Stripe.Metadata | null): Item[] {
  if (!metadata) return [];

  const packed = Object.keys(metadata)
    .filter((k) => k.startsWith("items_"))
    .sort(
      (a, b) => Number(a.replace("items_", "")) - Number(b.replace("items_", "")),
    )
    .map((k) => metadata[k])
    .join("");

  return packed
    .split(",")
    .filter(Boolean)
    .flatMap((entry): Item[] => {
      const [variant_id, qty, price] = entry.split(":");
      const quantity = Number(qty);
      const unit_price_cents = Number(price);
      if (!variant_id || !Number.isFinite(quantity) || !Number.isFinite(unit_price_cents)) {
        return [];
      }
      return [{ variant_id, quantity, unit_price_cents }];
    });
}

/*
  Stripe webhook.

  The signature check is the only thing standing between this endpoint and
  anyone on the internet posting a fake "payment succeeded". It runs against
  the raw body — parsing the JSON first would change the bytes and break
  verification — and nothing else happens until it passes.
*/
export async function POST(request: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    console.error("STRIPE_WEBHOOK_SECRET is not set; refusing the event.");
    return NextResponse.json({ error: "Not configured." }, { status: 500 });
  }

  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Unsigned." }, { status: 400 });
  }

  const raw = await request.text();

  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(raw, signature, secret);
  } catch (err) {
    const message = err instanceof Error ? err.message : "unknown";
    console.error("Rejected a webhook with a bad signature:", message);
    return NextResponse.json({ error: "Bad signature." }, { status: 400 });
  }

  if (event.type !== "checkout.session.completed") {
    /* Acknowledge everything else so Stripe stops retrying it. */
    return NextResponse.json({ received: true });
  }

  const session = event.data.object as Stripe.Checkout.Session;

  if (session.payment_status !== "paid") {
    return NextResponse.json({ received: true, skipped: "not paid" });
  }

  const items = unpackItems(session.metadata);
  if (items.length === 0) {
    console.error(`Session ${session.id} arrived with no item metadata.`);
    return NextResponse.json({ error: "No items on session." }, { status: 400 });
  }

  const address = session.collected_information?.shipping_details?.address ?? null;
  const name = session.collected_information?.shipping_details?.name ?? null;

  /*
    The database function does the order, the line items and the stock
    decrement in one transaction, and is idempotent on the session id — a
    Stripe retry returns the same order rather than selling the stock twice.
  */
  const { data, error } = await getServiceClient().rpc(
    /* A public wrapper: PostgREST only exposes `public`, so the private
       function is unreachable over the API. Execution is still limited to
       service_role. */
    "record_paid_order",
    {
      p_session_id: session.id,
      p_payment_intent:
        typeof session.payment_intent === "string"
          ? session.payment_intent
          : (session.payment_intent?.id ?? null),
      p_email: session.customer_details?.email ?? null,
      p_currency: session.currency ?? "aud",
      p_subtotal_cents: session.amount_subtotal ?? 0,
      p_shipping_cents: session.total_details?.amount_shipping ?? 0,
      p_total_cents: session.amount_total ?? 0,
      p_shipping_name: name,
      p_shipping_address: address,
      p_items: items,
    },
  );

  if (error) {
    /* 500 so Stripe retries — losing a paid order is not acceptable. */
    console.error(`Failed to record order for ${session.id}:`, error.message);
    return NextResponse.json({ error: "Could not record." }, { status: 500 });
  }

  return NextResponse.json({ received: true, orderId: data });
}
