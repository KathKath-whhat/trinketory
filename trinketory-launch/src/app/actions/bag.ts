"use server";

import { resolveCartLines, type CartLine } from "@/lib/catalog";

export type BagSummary = {
  lines: CartLine[];
  subtotalCents: number;
  /* Lines whose variant sold out while sitting in the bag. */
  unavailable: CartLine[];
};

/*
  Resolves the bag for display.

  The client sends variant ids and quantities; this sends back the lines
  priced from Postgres. Sold-out lines come back flagged rather than
  removed, so the drawer can say what happened instead of silently
  shrinking somebody's bag.
*/
export async function getBagSummary(
  entries: { variantId: string; quantity: number }[],
): Promise<BagSummary> {
  const lines = await resolveCartLines(entries);
  const available = lines.filter((l) => l.inStock);

  return {
    lines,
    subtotalCents: available.reduce((sum, l) => sum + l.lineTotalCents, 0),
    unavailable: lines.filter((l) => !l.inStock),
  };
}
