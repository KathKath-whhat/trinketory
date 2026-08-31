"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import ProductEditor, {
  type ProductDraft,
} from "@/components/admin/product-editor";
import { getBrowserClient } from "@/lib/supabase-browser";

export default function EditProduct() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const id = params.id;

  const [draft, setDraft] = useState<ProductDraft | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [confirming, setConfirming] = useState(false);

  useEffect(() => {
    let active = true;

    getBrowserClient()
      .from("products")
      .select(
        "id, handle, title, category_id, description, details, aspect, featured, badge, drop_number, image_paths, variants(id, colour_id, price_cents, stock, position)",
      )
      .eq("id", id)
      .maybeSingle()
      .then(({ data, error }) => {
        if (!active) return;
        if (error) return setError(error.message);
        if (!data) return setError("No product with that id.");

        type V = {
          id: string;
          colour_id: string;
          price_cents: number;
          stock: number;
          position: number;
        };
        const row = data as unknown as {
          id: string;
          handle: string;
          title: string;
          category_id: string;
          description: string;
          details: string[] | null;
          aspect: number | string;
          featured: boolean;
          badge: string | null;
          drop_number: number | null;
          image_paths: string[] | null;
          variants: V[] | null;
        };

        setDraft({
          id: row.id,
          handle: row.handle,
          title: row.title,
          categoryId: row.category_id,
          description: row.description ?? "",
          details: (row.details ?? []).join("\n"),
          aspect: String(row.aspect),
          featured: row.featured,
          badge: row.badge ?? "",
          dropNumber: row.drop_number !== null ? String(row.drop_number) : "",
          imagePaths: row.image_paths ?? [],
          variants: (row.variants ?? [])
            .sort((a, b) => a.position - b.position)
            .map((v) => ({
              id: v.id,
              colourId: v.colour_id,
              /* Cents back to a plain decimal string for the input. */
              price: (v.price_cents / 100).toFixed(
                v.price_cents % 100 === 0 ? 0 : 2,
              ),
              stock: v.stock,
            })),
        });
      });

    return () => {
      active = false;
    };
  }, [id]);

  async function destroy() {
    setDeleting(true);
    /* Variants cascade via the foreign key; order history does not, by design. */
    const { error } = await getBrowserClient()
      .from("products")
      .delete()
      .eq("id", id);

    if (error) {
      setError(error.message);
      setDeleting(false);
      return;
    }
    router.push("/admin/products");
  }

  if (error) return <p className="text-caption text-accent">{error}</p>;
  if (!draft) return <p className="label text-ink-faint">Loading…</p>;

  return (
    <div>
      <Link href="/admin/products" className="label text-ink-faint hover:text-ink">
        ← Products
      </Link>

      <div className="mt-4 flex flex-wrap items-baseline justify-between gap-4">
        <h1
          className="font-display text-4xl text-ink"
          style={{ fontVariationSettings: '"SOFT" 40, "WONK" 1' }}
        >
          {draft.title}
        </h1>
        <Link
          href={`/product/${draft.handle}`}
          className="label text-ink-muted hover:text-ink"
        >
          View on shop
        </Link>
      </div>

      <div className="mt-10">
        <ProductEditor initial={draft} mode="edit" />
      </div>

      <div className="mt-16 max-w-[900px] border-t border-line pt-6">
        {confirming ? (
          <div className="flex flex-wrap items-center gap-4">
            <p className="text-caption text-ink">
              Delete {draft.title} and all its colourways? Past orders keep
              their own record and are not affected.
            </p>
            <button
              type="button"
              onClick={destroy}
              disabled={deleting}
              className="label bg-accent px-4 py-2 text-canvas disabled:opacity-60"
            >
              {deleting ? "Deleting…" : "Yes, delete"}
            </button>
            <button
              type="button"
              onClick={() => setConfirming(false)}
              className="label text-ink-muted hover:text-ink"
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setConfirming(true)}
            className="label text-ink-faint hover:text-accent"
          >
            Delete this product
          </button>
        )}
      </div>
    </div>
  );
}
