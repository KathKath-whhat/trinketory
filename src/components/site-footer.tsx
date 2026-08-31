import Link from "next/link";
import type { Category } from "@/lib/catalog";

const INFO = [
  { href: "/shipping", label: "Shipping" },
  { href: "/returns", label: "Returns" },
  { href: "/faq", label: "FAQ" },
  { href: "/care", label: "Care" },
];

const SUPPORT = [
  { href: "/contact", label: "Contact" },
  { href: "/stockists", label: "Stockists" },
  { href: "/privacy", label: "Privacy" },
  { href: "/terms", label: "Terms" },
];

const SOCIAL = [
  { href: "https://instagram.com", label: "Instagram" },
  { href: "https://tiktok.com", label: "TikTok" },
  { href: "https://pinterest.com", label: "Pinterest" },
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
              New pieces most Fridays. One-of-ones go up whenever they are
              finished, which is rarely on a schedule.
            </p>
          </div>

          <Column
            heading="Shop"
            links={categories.map((c) => ({
              href: `/shop?category=${c.id}`,
              label: c.name,
            }))}
          />
          <Column heading="Info" links={INFO} />
          <Column heading="Elsewhere" links={[...SUPPORT, ...SOCIAL]} />
        </div>

        <div className="mt-16 flex flex-col gap-3 border-t border-line pt-6 text-ink-faint md:flex-row md:items-center md:justify-between">
          <p className="label">© {new Date().getFullYear()} Trinketory</p>
          <p className="label">Ships worldwide · Prices in AUD</p>
        </div>
      </div>
    </footer>
  );
}
