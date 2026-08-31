"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useSyncExternalStore } from "react";
import type { Category } from "@/lib/catalog";
import {
  getServerSnapshot,
  getSnapshot,
  itemCount,
  setOpen as setBagOpen,
  subscribe,
} from "@/lib/bag-store";

const PRIMARY = [
  { href: "/shop", label: "Shop" },
  { href: "/drops", label: "One of One" },
  { href: "/about", label: "About" },
];

export default function SiteHeader({
  categories,
}: {
  categories: Category[];
}) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const bag = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const count = itemCount(bag);

  /*
    The mobile sheet closes on tap rather than on a pathname effect — tapping
    a link is the only way to navigate out of it, so there is nothing for an
    effect to catch that this misses.
  */
  const close = () => setOpen(false);

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-canvas/90 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-[1600px] items-center gap-6 px-5 md:h-20 md:px-10">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls="mobile-nav"
          className="label -ml-1 p-1 text-ink-muted md:hidden"
        >
          {open ? "Close" : "Menu"}
        </button>

        <Link
          href="/"
          className="font-display text-xl tracking-tight text-ink md:text-2xl"
          style={{ fontVariationSettings: '"SOFT" 40, "WONK" 1' }}
        >
          Trinketory
        </Link>

        <nav className="ml-6 hidden items-center gap-7 md:flex">
          {PRIMARY.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`label transition-colors hover:text-ink ${
                pathname.startsWith(item.href) ? "text-ink" : "text-ink-muted"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-5">
          <Link href="/search" className="label text-ink-muted hover:text-ink">
            Search
          </Link>
          <button
            type="button"
            onClick={() => setBagOpen(true)}
            className="label text-ink-muted hover:text-ink"
          >
            Bag {count > 0 ? <span className="text-ink">({count})</span> : "(0)"}
          </button>
        </div>
      </div>

      {/*
        Second row: category nav. Kept as a quiet strip rather than a mega
        menu — the catalogue is small enough that everything fits on one line.
      */}
      <div className="hidden border-t border-line md:block">
        <nav className="mx-auto flex max-w-[1600px] items-center gap-7 px-10 py-3">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/shop?category=${cat.id}`}
              className="text-caption text-ink-muted transition-colors hover:text-ink"
            >
              {cat.name}
            </Link>
          ))}
        </nav>
      </div>

      {open && (
        <div id="mobile-nav" className="border-t border-line bg-canvas md:hidden">
          <nav className="flex flex-col px-5 py-4">
            {PRIMARY.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={close}
                className="border-b border-line py-3 font-display text-lg text-ink"
              >
                {item.label}
              </Link>
            ))}
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/shop?category=${cat.id}`}
                onClick={close}
                className="border-b border-line py-3 text-caption text-ink-muted last:border-0"
              >
                {cat.name}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
