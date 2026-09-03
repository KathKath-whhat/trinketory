"use client";

import { useEffect, useState } from "react";
import { getBrowserClient } from "@/lib/supabase-browser";
import { slugify } from "@/lib/format";

type Colour = {
  id: string;
  name: string;
  hex: string;
  position: number;
  variants: { id: string }[] | null;
};

const HEX = /^#[0-9A-Fa-f]{6}$/;

export default function AdminColours() {
  const [rows, setRows] = useState<Colour[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [hex, setHex] = useState("#C8483C");
  const [busy, setBusy] = useState(false);

  /* Mutations bump this; the effect below is the only thing that fetches. */
  const [version, setVersion] = useState(0);
  const reload = () => setVersion((v) => v + 1);

  useEffect(() => {
    let active = true;

    getBrowserClient()
      .from("colours")
      .select("id, name, hex, position, variants(id)")
      .order("position")
      .then(({ data, error }) => {
        if (!active) return;
        if (error) setError(error.message);
        else setRows((data ?? []) as unknown as Colour[]);
      });

    return () => {
      active = false;
    };
  }, [version]);

  async function add() {
    const id = slugify(name);
    if (!id) return setError("Give the colour a name.");
    if (!HEX.test(hex)) return setError("Hex must look like #C8483C.");

    setBusy(true);
    setError(null);

    const position = (rows?.length ?? 0) + 1;
    const { error } = await getBrowserClient()
      .from("colours")
      .insert({ id, name: name.trim(), hex: hex.toUpperCase(), position });

    if (error) setError(error.message);
    else {
      setName("");
      reload();
    }
    setBusy(false);
  }

  async function update(id: string, patch: Partial<Colour>) {
    setError(null);
    const { error } = await getBrowserClient()
      .from("colours")
      .update(patch)
      .eq("id", id);
    if (error) setError(error.message);
    else reload();
  }

  async function remove(id: string) {
    setError(null);
    const { error } = await getBrowserClient()
      .from("colours")
      .delete()
      .eq("id", id);
    /* The foreign key from variants will refuse if the colour is in use,
       which is the behaviour we want — surface it rather than cascading. */
    if (error) setError(`Cannot delete: ${error.message}`);
    else reload();
  }

  if (!rows && !error) return <p className="label text-ink-faint">Loading…</p>;

  return (
    <div className="max-w-[760px]">
      <h1
        className="font-display text-4xl text-ink"
        style={{ fontVariationSettings: '"SOFT" 40, "WONK" 1' }}
      >
        Colours
      </h1>
      <p className="mt-3 max-w-md text-caption text-ink-muted">
        The palette every colourway draws from. These also drive the swatch
        filters on the shop page.
      </p>

      {error && (
        <p className="mt-6 bg-accent-soft px-3 py-2 text-caption text-accent">
          {error}
        </p>
      )}

      <div className="mt-10 flex flex-wrap items-end gap-4 border-b border-line pb-6">
        <label className="flex-1">
          <span className="label block text-ink-faint">New colour</span>
          <input
            value={name}
            placeholder="Sea Glass"
            onChange={(e) => setName(e.target.value)}
            className="mt-2 w-full border-b border-line bg-transparent py-2 text-caption text-ink focus:border-ink focus:outline-none"
          />
        </label>
        <label>
          <span className="label block text-ink-faint">Hex</span>
          <div className="mt-2 flex items-center gap-2">
            <input
              type="color"
              value={HEX.test(hex) ? hex : "#CCCCCC"}
              onChange={(e) => setHex(e.target.value.toUpperCase())}
              className="h-8 w-10 cursor-pointer border border-line bg-transparent"
            />
            <input
              value={hex}
              onChange={(e) => setHex(e.target.value)}
              className="w-24 border-b border-line bg-transparent py-2 text-caption tabular-nums text-ink focus:border-ink focus:outline-none"
            />
          </div>
        </label>
        <button
          type="button"
          onClick={add}
          disabled={busy}
          className="label bg-ink px-5 py-3 text-canvas transition-colors hover:bg-accent disabled:bg-surface-deep"
        >
          Add
        </button>
      </div>

      <ul className="divide-y divide-line">
        {(rows ?? []).map((c) => (
          <li key={c.id} className="flex flex-wrap items-center gap-4 py-4">
            <span
              className="h-8 w-8 shrink-0 rounded-full ring-1 ring-line-strong"
              style={{ backgroundColor: c.hex }}
            />
            <input
              defaultValue={c.name}
              onBlur={(e) =>
                e.target.value !== c.name && update(c.id, { name: e.target.value })
              }
              className="min-w-[120px] flex-1 border-b border-transparent bg-transparent py-1 text-caption text-ink hover:border-line focus:border-ink focus:outline-none"
            />
            <input
              type="color"
              value={c.hex}
              onChange={(e) => update(c.id, { hex: e.target.value.toUpperCase() })}
              className="h-7 w-9 cursor-pointer border border-line bg-transparent"
            />
            <span className="label w-20 tabular-nums text-ink-faint">
              {(c.variants ?? []).length} used
            </span>
            <button
              type="button"
              onClick={() => remove(c.id)}
              disabled={(c.variants ?? []).length > 0}
              title={
                (c.variants ?? []).length > 0
                  ? "In use by a colourway"
                  : "Delete"
              }
              className="label text-ink-faint hover:text-accent disabled:opacity-30 disabled:hover:text-ink-faint"
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
