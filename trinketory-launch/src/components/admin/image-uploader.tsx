"use client";

import { useState } from "react";
import { getBrowserClient } from "@/lib/supabase-browser";

const BUCKET = "product-images";

export function publicUrl(path: string): string {
  return getBrowserClient().storage.from(BUCKET).getPublicUrl(path).data
    .publicUrl;
}

/*
  Upload and ordering for product photography.

  Order is meaningful: the first image is the card image, the second is the
  hover shot. Paths are namespaced per product and suffixed with a random
  token so replacing an image never collides with a cached CDN URL.
*/
export default function ImageUploader({
  productId,
  paths,
  onChange,
}: {
  productId: string;
  paths: string[];
  onChange: (next: string[]) => void;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function upload(files: FileList | null) {
    if (!files?.length) return;
    setBusy(true);
    setError(null);

    const supabase = getBrowserClient();
    const uploaded: string[] = [];

    for (const file of Array.from(files)) {
      const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
      const token = Math.random().toString(36).slice(2, 10);
      const path = `${productId}/${Date.now()}-${token}.${ext}`;

      const { error } = await supabase.storage
        .from(BUCKET)
        .upload(path, file, { cacheControl: "31536000", upsert: false });

      if (error) {
        setError(error.message);
        break;
      }
      uploaded.push(path);
    }

    if (uploaded.length) onChange([...paths, ...uploaded]);
    setBusy(false);
  }

  async function remove(path: string) {
    /* Drop the reference first — an orphaned file is a smaller problem than
       a product pointing at an image that no longer exists. */
    onChange(paths.filter((p) => p !== path));
    await getBrowserClient().storage.from(BUCKET).remove([path]);
  }

  function move(from: number, to: number) {
    if (to < 0 || to >= paths.length) return;
    const next = [...paths];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    onChange(next);
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h3 className="label text-ink-faint">Images</h3>
        <label className="label cursor-pointer text-accent hover:underline">
          {busy ? "Uploading…" : "Add images"}
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp,image/avif"
            multiple
            disabled={busy}
            onChange={(e) => {
              upload(e.target.files);
              e.target.value = "";
            }}
            className="sr-only"
          />
        </label>
      </div>

      {error && <p className="mt-3 text-caption text-accent">{error}</p>}

      {paths.length === 0 ? (
        <p className="mt-4 border border-dashed border-line px-4 py-8 text-center text-caption text-ink-muted">
          No photography yet. Until an image is added, the storefront draws a
          placeholder silhouette.
        </p>
      ) : (
        <ul className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-4">
          {paths.map((path, i) => (
            <li key={path} className="group relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={publicUrl(path)}
                alt=""
                className="aspect-square w-full bg-surface object-cover"
              />
              {i === 0 && (
                <span className="label absolute left-1 top-1 bg-canvas/90 px-1.5 py-0.5 text-ink-muted">
                  Card
                </span>
              )}
              {i === 1 && (
                <span className="label absolute left-1 top-1 bg-canvas/90 px-1.5 py-0.5 text-ink-muted">
                  Hover
                </span>
              )}
              <div className="mt-1 flex items-center justify-between">
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => move(i, i - 1)}
                    disabled={i === 0}
                    aria-label="Move earlier"
                    className="label px-1 text-ink-faint hover:text-ink disabled:opacity-30"
                  >
                    ←
                  </button>
                  <button
                    type="button"
                    onClick={() => move(i, i + 1)}
                    disabled={i === paths.length - 1}
                    aria-label="Move later"
                    className="label px-1 text-ink-faint hover:text-ink disabled:opacity-30"
                  >
                    →
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => remove(path)}
                  className="label text-ink-faint hover:text-accent"
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
