export const metadata = { title: "About" };

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-[1600px] px-5 py-16 md:px-10 md:py-24">
      <div className="max-w-2xl">
        <h1
          className="font-display text-4xl leading-[1.05] text-ink md:text-6xl"
          style={{ fontVariationSettings: '"SOFT" 60, "WONK" 1' }}
        >
          We make small things and think about them for far too long.
        </h1>

        <div className="mt-12 space-y-6 text-caption leading-relaxed text-ink-muted">
          <p>
            Trinketory started because the good version of a hair clip is
            surprisingly hard to buy. Either it looks right and breaks in a
            week, or it holds beautifully and looks like dental equipment.
          </p>
          <p>
            So everything here does one job properly. Clips that actually hold.
            Bows with hidden hardware. Scrunchies wide enough not to leave a
            crease. Short runs, because we would rather make four hundred good
            ones than forty thousand acceptable ones.
          </p>
          <p>
            Everything is packed by hand in Sydney and shipped worldwide. If a
            piece is not right, send it back within thirty days — we would
            rather have it returned than have you keep something you do not
            reach for.
          </p>
        </div>
      </div>
    </div>
  );
}
