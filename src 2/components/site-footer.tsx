import Link from "next/link";
import type { Category } from "@/lib/catalog";

const INFO = [
  { href: "/shipping", label: "Shipping" },
  { href: "/returns", label: "Returns" },
  { href: "/faq", label: "FAQ" },
  { href: "/care", label: "Care" },
];

const SUPPORT = [
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
  { href: "/privacy", label: "Privacy" },
  { href: "/terms", label: "Terms" },
];

function Column({
  heading,
  links,
}: {
  heading: string;
  links: { href: string; label: string }[];
}) {
  return (
    <div>
      <h2 className="label text-ink-faint">{heading}</h2>
      <ul className="mt-4 space-y-2.5">
        {links.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className="text-caption text-ink-muted transition-colors hover:text-ink"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function SiteFooter({
  categories,
}: {
  categories: Category[];
}) {
  return (
    <footer className="mt-24 border-t border-line">
      <div className="mx-auto max-w-[1600px] px-5 py-16 md:px-10 md:py-20">
        <div className="grid gap-12 md:grid-cols-[1.5fr_1fr_1fr_1fr]">
          <div className="max-w-xs">
            <p
              className="font-display text-2xl leading-tight text-ink"
              style={{ fontVariationSettings: '"SOFT" 40, "WONK" 1' }}
            >
              Small things, taken seriously.
            </p>
            <p className="mt-4 text-caption text-ink-muted">
              New pieces most Fridays, in short runs. Packed by hand in Sydney,
              shipped worldwide.
            </p>
            <a
              href="mailto:hello@trinketory.com"
              className="label mt-5 inline-block border-b border-line pb-0.5 text-ink-muted transition-colors hover:border-ink hover:text-ink"
            >
              hello@trinketory.com
            </a>
          </div>

          <Column
            heading="Shop"
            links={categories.map((c) => ({
              href: `/shop?category=${c.id}`,
              label: c.name,
            }))}
          />
          <Column heading="Info" links={INFO} />
          <Column heading="Help" links={SUPPORT} />
        </div>

        <div className="mt-16 flex flex-col gap-3 border-t border-line pt-6 text-ink-faint md:flex-row md:items-center md:justify-between">
          <p className="label">© {new Date().getFullYear()} Trinketory</p>
          <p className="label">Ships worldwide · Prices in AUD</p>
        </div>
      </div>
    </footer>
  );
}
