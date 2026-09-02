import type { Metadata } from "next";
import { DM_Sans, Fraunces } from "next/font/google";
import "./globals.css";

/*
  Root layout carries the fonts and the document shell only.

  Chrome lives in the route groups: (storefront) gets the header, footer and
  bag drawer; (admin) gets its own, because an admin panel with a "Free
  shipping over $80" footer would be absurd.
*/
const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  axes: ["SOFT", "WONK", "opsz"],
  display: "swap",
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.trinketory.com",
  ),
  title: {
    default: "Trinketory — small things, taken seriously",
    template: "%s · Trinketory",
  },
  description:
    "Claw clips, bows, scrunchies, hair pins and combs. Made in short runs and packed by hand in Sydney.",
  openGraph: {
    type: "website",
    siteName: "Trinketory",
    title: "Trinketory — small things, taken seriously",
    description:
      "Claw clips, bows, scrunchies, hair pins and combs. Made in short runs and packed by hand in Sydney.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${fraunces.variable} ${dmSans.variable} h-full`}>
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
