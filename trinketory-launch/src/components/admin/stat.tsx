export function Stat({
  label,
  value,
  note,
  tone = "normal",
}: {
  label: string;
  value: string | number;
  note?: string;
  tone?: "normal" | "warn" | "quiet";
}) {
  return (
    <div className="border-t border-line pt-4">
      <p className="label text-ink-faint">{label}</p>
      <p
        className={`mt-2 font-display text-3xl tabular-nums ${
          tone === "warn"
            ? "text-accent"
            : tone === "quiet"
              ? "text-ink-faint"
              : "text-ink"
        }`}
        style={{ fontVariationSettings: '"SOFT" 40, "WONK" 1' }}
      >
        {value}
      </p>
      {note && <p className="mt-1 text-caption text-ink-muted">{note}</p>}
    </div>
  );
}

export function Section({
  title,
  action,
  children,
}: {
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-14">
      <div className="flex items-baseline justify-between border-b border-line pb-3">
        <h2 className="label text-ink">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}
