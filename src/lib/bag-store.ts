/*
  The bag.

  Stores variant ids and quantities and nothing else. Titles, colours and
  especially prices are resolved server-side from Supabase every time the
  drawer opens — a price in localStorage is a price a customer can edit, and
  a price from three weeks ago is a price that has probably changed.

  Implemented as a plain external store rather than React context so any
  component can read it without a provider, and so `useSyncExternalStore`
  can give the server an empty snapshot and avoid a hydration mismatch.
*/

export type BagItem = {
  variantId: string;
  quantity: number;
};

const KEY = "trinketory-bag";
const MAX_PER_LINE = 10;

/* Matches the promise made on the product page. */
export const FREE_SHIPPING_CENTS = 8000;

/* Stable empty reference — useSyncExternalStore compares by identity. */
const EMPTY: BagItem[] = [];

let items: BagItem[] = EMPTY;
let open = false;
let loaded = false;

const listeners = new Set<() => void>();

function emit() {
  for (const listener of listeners) listener();
}

function persist() {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(items));
  } catch {
    /* Private mode, quota, or no storage at all. The bag still works in
       memory for this session, which is better than throwing. */
  }
}

function load() {
  loaded = true;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return;

    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return;

    /* Anything in localStorage is untrusted input — validate rather than cast. */
    const clean = parsed.flatMap((entry): BagItem[] => {
      if (typeof entry !== "object" || entry === null) return [];
      const { variantId, quantity } = entry as Record<string, unknown>;
      if (typeof variantId !== "string" || !variantId) return [];
      if (typeof quantity !== "number" || !Number.isFinite(quantity)) return [];
      const q = Math.min(Math.max(Math.floor(quantity), 1), MAX_PER_LINE);
      return [{ variantId, quantity: q }];
    });

    if (clean.length) items = clean;
  } catch {
    /* Corrupt payload. Start empty rather than break the site. */
  }
}

export function subscribe(listener: () => void): () => void {
  if (!loaded) load();
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function getSnapshot(): BagItem[] {
  return items;
}

export function getServerSnapshot(): BagItem[] {
  return EMPTY;
}

export function subscribeOpen(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function getOpenSnapshot(): boolean {
  return open;
}

export function getOpenServerSnapshot(): boolean {
  return false;
}

/* ── Mutations ────────────────────────────────────────────────────────── */

export function addItem(variantId: string, quantity = 1) {
  const existing = items.find((i) => i.variantId === variantId);

  items = existing
    ? items.map((i) =>
        i.variantId === variantId
          ? { ...i, quantity: Math.min(i.quantity + quantity, MAX_PER_LINE) }
          : i,
      )
    : [...items, { variantId, quantity: Math.min(quantity, MAX_PER_LINE) }];

  persist();
  emit();
}

export function setQuantity(variantId: string, quantity: number) {
  if (quantity <= 0) {
    removeItem(variantId);
    return;
  }

  items = items.map((i) =>
    i.variantId === variantId
      ? { ...i, quantity: Math.min(quantity, MAX_PER_LINE) }
      : i,
  );

  persist();
  emit();
}

export function removeItem(variantId: string) {
  items = items.filter((i) => i.variantId !== variantId);
  if (items.length === 0) items = EMPTY;
  persist();
  emit();
}

/*
  Drops entries whose variant no longer exists in the catalogue.

  Without this the header badge counts pieces the drawer will never show —
  a deleted product stays in localStorage forever, inflating the count
  against a bag that cannot contain it. Only ever called with the result of
  a successful resolve, so a network failure can't empty somebody's bag.
*/
export function pruneMissing(validIds: string[]) {
  const valid = new Set(validIds);
  /* No-op when nothing is stale, or the emit would re-trigger the caller. */
  if (items.every((i) => valid.has(i.variantId))) return;

  items = items.filter((i) => valid.has(i.variantId));
  if (items.length === 0) items = EMPTY;
  persist();
  emit();
}

export function clearBag() {
  items = EMPTY;
  persist();
  emit();
}

export function setOpen(next: boolean) {
  open = next;
  emit();
}

export function itemCount(bag: BagItem[]): number {
  return bag.reduce((total, item) => total + item.quantity, 0);
}

export { MAX_PER_LINE };
