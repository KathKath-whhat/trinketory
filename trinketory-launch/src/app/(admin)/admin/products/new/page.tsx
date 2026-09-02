"use client";

import Link from "next/link";
import ProductEditor, { EMPTY_DRAFT } from "@/components/admin/product-editor";

export default function NewProduct() {
  return (
    <div>
      <Link href="/admin/products" className="label text-ink-faint hover:text-ink">
        ← Products
      </Link>
      <h1
        className="mt-4 font-display text-4xl text-ink"
        style={{ fontVariationSettings: '"SOFT" 40, "WONK" 1' }}
      >
        New product
      </h1>
      <div className="mt-10">
        <ProductEditor initial={EMPTY_DRAFT} mode="new" />
      </div>
    </div>
  );
}
