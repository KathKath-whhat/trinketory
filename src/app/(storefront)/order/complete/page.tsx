import { Suspense } from "react";
import Link from "next/link";
import OrderComplete from "@/components/order-complete";

export const metadata = { title: "Thank you" };

export default function OrderCompletePage() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-[1600px] flex-col items-center justify-center px-5 py-24 text-center md:px-10">
      <Suspense
        fallback={<p className="label text-ink-faint">Finishing up…</p>}
      >
        <OrderComplete />
      </Suspense>

      <Link
        href="/shop"
        className="label mt-10 border-b border-ink pb-1 text-ink transition-colors hover:border-accent hover:text-accent"
      >
        Keep looking
      </Link>
    </div>
  );
}
