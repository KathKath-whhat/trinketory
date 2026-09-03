import type { ReactNode } from "react";

/*
  Shared shell for the text pages — policies, FAQ, care, contact.

  One component so eight pages cannot drift into eight different layouts,
  and so the measure stays readable: a single column at roughly 70
  characters rather than the full 1600px the catalogue pages use.
*/
export default function ProsePage({
  title,
  intro,
  updated,
  children,
}: {
  title: string;
  intro?: string;
  updated?: string;
  children: ReactNode;
}) {
  return (
    <div className="mx-auto max-w-[1600px] px-5 py-16 md:px-10 md:py-24">
      <div className="max-w-[640px]">
        <h1
          className="font-display text-4xl leading-[1.05] text-ink md:text-5xl"
          style={{ fontVariationSettings: '"SOFT" 60, "WONK" 1' }}
        >
          {title}
        </h1>

        {intro && (
          <p className="mt-6 text-caption leading-relaxed text-ink-muted">
            {intro}
          </p>
        )}

        <div className="mt-12 space-y-10">{children}</div>

        {updated && (
          <p className="label mt-16 border-t border-line pt-6 text-ink-faint">
            Last updated {updated}
          </p>
        )}
      </div>
    </div>
  );
}

export function Block({
  heading,
  children,
}: {
  heading: string;
  children: ReactNode;
}) {
  return (
    <section>
      <h2 className="label text-ink">{heading}</h2>
      <div className="mt-3 space-y-3 text-caption leading-relaxed text-ink-muted">
        {children}
      </div>
    </section>
  );
}

/* Plain bulleted list at the same measure and colour as Block prose. */
export function Points({ items }: { items: string[] }) {
  return (
    <ul className="space-y-2">
      {items.map((item) => (
        <li key={item} className="border-l border-line pl-4">
          {item}
        </li>
      ))}
    </ul>
  );
}
