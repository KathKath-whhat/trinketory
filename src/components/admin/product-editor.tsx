"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import ImageUploader from "@/components/admin/image-uploader";
import { getBrowserClient } from "@/lib/supabase-browser";
import { formatPrice, parsePriceToCents, slugify } from "@/lib/format";

type Colour = { id: string; name: string; hex: string };
type Category = { id: string; name: string };

export type VariantDraft = {
  id: string;
  colourId: string;
  /* Held as a string so a half-typed "12." doesn't fight the input. */
  price: string;
  stock: number;
  isNew?: boolean;
};

export type ProductDraft = {
  id: string;
  handle: string;
  title: string;
  categoryId: string;
  description: string;
  details: string;
  aspect: string;
  featured: boolean;
  badge: string;
  dropNumber: string;
  imagePaths: string[];
  variants: VariantDraft[];
};

export const EMPTY_DRAFT: ProductDraft = {
  id: "",
  handle: "",
  title: "",
  categoryId: "",
  description: "",
  details: "",
  aspect: "1.00",
  featured: false,
  badge: "",
  dropNumber: "",
  imagePaths: [],
  variants: [],
};

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="label block text-ink-faint">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-caption text-ink-faint">{hint}</span>}
    </label>
  );
}

const input =
  "mt-2 w-full border-b border-line bg-transparent py-2 text-caption text-ink focus:border-ink focus:outline-none";

export default function ProductEditor({
  initial,
  mode,
}: {
  initial: ProductDraft;
  mode: "new" | "edit";
}) {
  const router = useRouter();
  const [draft, setDraft] = useState<ProductDraft>(initial);
  const [colours, setColours] = useState<Colour[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const supabase = getBrowserClient();
    let active = true;

    Promise.all([
      supabase.from("colours").select("id, name, hex").order("position"),
      supabase.from("categories").select("id, name").order("position"),
    ]).then(([c, cat]) => {
      if (!active) return;
      setColours((c.data ?? []) as Colour[]);
      setCategories((cat.data ?? []) as Category[]);
      if (!draft.categoryId && cat.data?.length) {
        setCategories((cat.data ?? []) as Category[]);
      }
    });

    return () => {
      active = false;
    };
    /* Load reference data once. */
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function set<K extends keyof ProductDraft>(key: K, value: ProductDraft[K]) {
    setDraft((d) => ({ ...d, [key]: value }));
    setSaved(false);
  }

  function addVariant() {
    const used = new Set(draft.variants.map((v) => v.colourId));
    const next = colours.find((c) => !used.has(c.id));
    if (!next) return;

    const handle = draft.handle || slugify(draft.title);
    set("variants", [
      ...draft.variants,
      {
        id: `${handle}--${next.id}`,
        colourId: next.id,
        price: "",
        stock: 0,
        isNew: true,
      },
    ]);
  }

  function updateVariant(index: number, patch: Partial<VariantDraft>) {
    set(
      "variants",
      draft.variants.map((v, i) => (i === index ? { ...v, ...patch } : v)),
    );
  }

  function removeVariant(index: number) {
    set(
      "variants",
      draft.variants.filter((_, i) => i !== index),
    );
  }

  async function save() {
    setSaving(true);
    setError(null);

    const supabase = getBrowserClient();
    const handle = (draft.handle || slugify(draft.title)).trim();
    const id = mode === "new" ? handle : draft.id;

    if (!handle || !draft.title.trim()) {
      setError("A title and handle are both required.");
      setSaving(false);
      return;
    }
    if (!draft.categoryId) {
      setError("Pick a category.");
      setSaving(false);
      return;
    }
    if (draft.variants.length === 0) {
      setError("A product needs at least one colourway.");
      setSaving(false);
      return;
    }

    /* Validate every price before writing anything, so a typo in the last
       row cannot leave the product half-saved. */
    const priced: { v: VariantDraft; cents: number }[] = [];
    for (const v of draft.variants) {
      const cents = parsePriceToCents(v.price);
      if (cents === null) {
        setError(`"${v.price || "empty"}" is not a valid price.`);
        setSaving(false);
        return;
      }
      priced.push({ v, cents });
    }

    const aspect = Number(draft.aspect);
    if (!Number.isFinite(aspect) || aspect <= 0) {
      setError("Aspect must be a positive number.");
      setSaving(false);
      return;
    }

    const productRow = {
      id,
      handle,
      title: draft.title.trim(),
      category_id: draft.categoryId,
      description: draft.description.trim(),
      details: draft.details
        .split("\n")
        .map((d) => d.trim())
        .filter(Boolean),
      aspect,
      featured: draft.featured,
      badge: draft.badge || null,
      drop_number: draft.dropNumber ? Number(draft.dropNumber) : null,
      image_paths: draft.imagePaths,
    };

    const { error: pErr } = await supabase
      .from("products")
      .upsert(productRow, { onConflict: "id" });

    if (pErr) {
      setError(pErr.message);
      setSaving(false);
      return;
    }

    const { error: vErr } = await supabase.from("variants").upsert(
      priced.map(({ v, cents }, i) => ({
        id: v.id,
        product_id: id,
        colour_id: v.colourId,
        price_cents: cents,
        stock: v.stock,
        position: i + 1,
      })),
      { onConflict: "id" },
    );

    if (vErr) {
      setError(vErr.message);
      setSaving(false);
      return;
    }

    /* Remove colourways that were deleted in the editor. */
    const keep = priced.map(({ v }) => v.id);
    const { error: dErr } = await supabase
      .from("variants")
      .delete()
      .eq("product_id", id)
      .not("id", "in", `(${keep.map((k) => `"${k}"`).join(",")})`);

    if (dErr) {
      setError(`Saved, but old colourways could not be removed: ${dErr.message}`);
      setSaving(false);
      return;
    }

    setSaving(false);
    setSaved(true);

    if (mode === "new") router.push(`/admin/products/${id}`);
    else router.refresh();
  }

  const productIdForUpload = mode === "new" ? draft.handle || slugify(draft.title) || "draft" : draft.id;

  return (
    <div className="max-w-[900px]">
      <div className="grid gap-10 lg:grid-cols-[1fr_340px]">
        <div className="space-y-8">
          <Field label="Title">
            <input
              value={draft.title}
              onChange={(e) => {
                set("title", e.target.value);
                if (mode === "new") set("handle", slugify(e.target.value));
              }}
              className={input}
            />
          </Field>

          <Field label="Handle" hint={`/product/${draft.handle || "…"}`}>
            <input
              value={draft.handle}
              onChange={(e) => set("handle", slugify(e.target.value))}
              disabled={mode === "edit"}
              className={`${input} disabled:text-ink-faint`}
            />
          </Field>

          <Field label="Description">
            <textarea
              rows={4}
              value={draft.description}
              onChange={(e) => set("description", e.target.value)}
              className={`${input} resize-y`}
            />
          </Field>

          <Field label="Details" hint="One per line">
            <textarea
              rows={4}
              value={draft.details}
              onChange={(e) => set("details", e.target.value)}
              className={`${input} resize-y`}
            />
          </Field>

          <ImageUploader
            productId={productIdForUpload}
            paths={draft.imagePaths}
            onChange={(next) => set("imagePaths", next)}
          />

          <div>
            <div className="flex items-center justify-between border-b border-line pb-2">
              <h3 className="label text-ink">Colourways</h3>
              <button
                type="button"
                onClick={addVariant}
                disabled={draft.variants.length >= colours.length}
                className="label text-accent hover:underline disabled:text-ink-faint disabled:no-underline"
              >
                Add colourway
              </button>
            </div>

            {draft.variants.length === 0 ? (
              <p className="py-6 text-caption text-ink-muted">
                No colourways yet. A product needs at least one to be sold.
              </p>
            ) : (
              <ul className="divide-y divide-line">
                {draft.variants.map((v, i) => {
                  const colour = colours.find((c) => c.id === v.colourId);
                  return (
                    <li key={v.id} className="flex flex-wrap items-end gap-4 py-4">
                      <span
                        className="h-8 w-8 shrink-0 rounded-full ring-1 ring-line-strong"
                        style={{ backgroundColor: colour?.hex ?? "#ddd" }}
                      />

                      <label className="min-w-[130px] flex-1">
                        <span className="label block text-ink-faint">Colour</span>
                        <select
                          value={v.colourId}
                          onChange={(e) =>
                            updateVariant(i, { colourId: e.target.value })
                          }
                          className={input}
                        >
                          {colours.map((c) => (
                            <option key={c.id} value={c.id}>
                              {c.name}
                            </option>
                          ))}
                        </select>
                      </label>

                      <label className="w-28">
                        <span className="label block text-ink-faint">Price</span>
                        <input
                          inputMode="decimal"
                          placeholder="32.00"
                          value={v.price}
                          onChange={(e) => updateVariant(i, { price: e.target.value })}
                          className={input}
                        />
                      </label>

                      <label className="w-24">
                        <span className="label block text-ink-faint">Stock</span>
                        <input
                          type="number"
                          min={0}
                          value={v.stock}
                          onChange={(e) =>
                            updateVariant(i, {
                              stock: Math.max(0, Number(e.target.value) || 0),
                            })
                          }
                          className={input}
                        />
                      </label>

                      <button
                        type="button"
                        onClick={() => removeVariant(i)}
                        className="label pb-2 text-ink-faint hover:text-accent"
                      >
                        Remove
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
            <p className="mt-3 text-caption text-ink-faint">
              Stock at zero marks a colourway sold out automatically.
            </p>
          </div>
        </div>

        <aside className="space-y-8 lg:sticky lg:top-8 lg:self-start">
          <Field label="Category">
            <select
              value={draft.categoryId}
              onChange={(e) => set("categoryId", e.target.value)}
              className={input}
            >
              <option value="">Choose…</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Badge">
            <select
              value={draft.badge}
              onChange={(e) => set("badge", e.target.value)}
              className={input}
            >
              <option value="">None</option>
              <option value="new">New</option>
              <option value="best-seller">Best seller</option>
              <option value="last-one">Last one</option>
            </select>
          </Field>

          <Field
            label="Drop number"
            hint="Leave empty unless this is a one-of-one"
          >
            <input
              inputMode="numeric"
              value={draft.dropNumber}
              onChange={(e) =>
                set("dropNumber", e.target.value.replace(/\D/g, ""))
              }
              className={input}
            />
          </Field>

          <Field label="Aspect" hint="Image height ÷ width. Variety drives the masonry.">
            <input
              inputMode="decimal"
              value={draft.aspect}
              onChange={(e) => set("aspect", e.target.value)}
              className={input}
            />
          </Field>

          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={draft.featured}
              onChange={(e) => set("featured", e.target.checked)}
              className="h-4 w-4 accent-[#d64b3c]"
            />
            <span className="label text-ink">Featured on the homepage</span>
          </label>

          {error && (
            <p className="bg-accent-soft px-3 py-2 text-caption text-accent">
              {error}
            </p>
          )}

          <button
            type="button"
            onClick={save}
            disabled={saving}
            className="label w-full bg-ink py-3.5 text-canvas transition-colors hover:bg-accent disabled:bg-surface-deep disabled:text-ink-muted"
          >
            {saving ? "Saving…" : saved ? "Saved" : mode === "new" ? "Create product" : "Save changes"}
          </button>

          {draft.variants.length > 0 && (
            <p className="text-caption text-ink-faint">
              {draft.variants.length} colourway
              {draft.variants.length === 1 ? "" : "s"} ·{" "}
              {draft.variants.reduce((s, v) => s + v.stock, 0)} units
              {(() => {
                const cents = draft.variants
                  .map((v) => parsePriceToCents(v.price))
                  .filter((c): c is number => c !== null);
                return cents.length
                  ? ` · from ${formatPrice(Math.min(...cents))}`
                  : "";
              })()}
            </p>
          )}
        </aside>
      </div>
    </div>
  );
}
