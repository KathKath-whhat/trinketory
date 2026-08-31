import { NextResponse } from "next/server";
import { resolveCartLines } from "@/lib/catalog";
import { getStripe, siteUrl } from "@/lib/stripe";

export const runtime = "nodejs";

/* Stripe metadata caps each value at 500 characters. */
const CHUNK = 450;

type Body = { items?: { variantId?: unknown; quantity?: unknown }[] };

/*
  Creates a Stripe Checkout session.

  The browser sends variant ids and quantities. It does not send prices,
  and if it did they would be ignored — every amount here is read from
  Postgres inside this request. That is the whole point: a customer can
  edit anything that leaves their machine.
*/
export async function POST(request: Request) {
  let body: Body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Malformed request." }, { status: 400 });
  }

  const entries = (body.items ?? [])
    .map((i) => ({
      variantId: typeof i.variantId === "string" ? i.variantId : "",
      quantity:
        typeof i.quantity === "number" && Number.isFinite(i.quantity)
          ? Math.min(Math.max(Math.floor(i.quantity), 1), 10)
          : 0,
    }))
    .filter((i) => i.variantId && i.quantity > 0);

  if (entries.length === 0) {
    return NextResponse.json({ error: "Your bag is empty." }, { status: 400 });
  }

  const lines = await resolveCartLines(entries);
  const sellable = lines.filter((l) => l.inStock);

  if (sellable.length === 0) {
    return NextResponse.json(
      { error: "Nothing in your bag is still available." },
      { status: 409 },
    );
  }

  if (sellable.length !== lines.length) {
    /*
      Refuse rather than quietly dropping the sold-out line. Charging
      someone for less than they thought they were buying is worse than
      making them look at their bag again.
    */
    return NextResponse.json(
      { error: "Something in your bag sold out. Review it and try again." },
      { status: 409 },
    );
  }

  /*
    Items travel in metadata so the webhook can record exactly what was
    bought. Chunked because a long bag would otherwise blow the 500
    character ceiling on a single metadata value.
  */
  const packed = sellable
    .map((l) => `${l.variantId}:${l.quantity}:${l.priceCents}`)
    .join(",");

  const metadata: Record<string, string> = {};
  for (let i = 0; i * CHUNK < packed.length; i++) {
    metadata[`items_${i}`] = packed.slice(i * CHUNK, (i + 1) * CHUNK);
  }

  const session = await getStripe().checkout.sessions.create({
    mode: "payment",
    line_items: sellable.map((l) => ({
      quantity: l.quantity,
      price_data: {
        currency: "aud",
        unit_amount: l.priceCents,
        product_data: {
          name: l.title,
          description: l.colour.name,
        },
      },
    })),
    /* Free over $80, matching what the bag and product page promise. */
    shipping_options: [
      {
        shipping_rate_data: {
          type: "fixed_amount",
          display_name:
            sellable.reduce((s, l) => s + l.lineTotalCents, 0) >= 8000
              ? "Free shipping"
              : "Standard shipping",
          fixed_amount: {
            currency: "aud",
            amount:
              sellable.reduce((s, l) => s + l.lineTotalCents, 0) >= 8000
                ? 0
                : 950,
          },
        },
      },
    ],
    shipping_address_collection: {
      allowed_countries: ["AU", "NZ", "GB", "US", "CA", "IE", "SG"],
    },
    metadata,
    success_url: `${siteUrl()}/order/complete?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${siteUrl()}/shop`,
  });

  if (!session.url) {
    return NextResponse.json(
      { error: "Stripe did not return a checkout URL." },
      { status: 502 },
    );
  }

  return NextResponse.json({ url: session.url });
}
