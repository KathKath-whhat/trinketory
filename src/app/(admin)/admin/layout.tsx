"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { getBrowserClient } from "@/lib/supabase-browser";
import { useAdmin } from "@/lib/use-admin";
import AdminLogin from "@/components/admin/admin-login";

const NAV = [
  { href: "/admin", label: "Overview", exact: true },
  { href: "/admin/products", label: "Products" },
  { href: "/admin/colours", label: "Colours" },
  { href: "/admin/orders", label: "Orders" },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const state = useAdmin();
  const pathname = usePathname();

  /*
    The password reset page has to render for someone who cannot sign in —
    that is the entire point of it — so it sits outside the gate and outside
    the admin chrome.
  */
  if (pathname === "/admin/reset") return <>{children}</>;

  if (state.status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="label text-ink-faint">Checking access…</p>
      </div>
    );
  }

  if (state.status === "signed-out") return <AdminLogin />;

  if (state.status === "forbidden") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
        <h1
          className="font-display text-3xl text-ink"
          style={{ fontVariationSettings: '"SOFT" 40, "WONK" 1' }}
        >
          Not an admin.
        </h1>
        <p className="mt-3 max-w-sm text-caption text-ink-muted">
          You are signed in as {state.email}, but that account is not on the
          admin list. Someone with database access needs to add it.
        </p>
        <button
          type="button"
          onClick={() => getBrowserClient().auth.signOut()}
          className="label mt-8 border-b border-ink pb-1 text-ink hover:border-accent hover:text-accent"
        >
          Sign out
        </button>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-line">
        <div className="mx-auto flex h-16 max-w-[1400px] items-center gap-8 px-5 md:px-8">
          <Link
            href="/admin"
            className="font-display text-lg text-ink"
            style={{ fontVariationSettings: '"SOFT" 40, "WONK" 1' }}
          >
            Trinketory
            <span className="label ml-2 text-ink-faint">Admin</span>
          </Link>

          <nav className="flex items-center gap-6 overflow-x-auto">
            {NAV.map((item) => {
              const active = item.exact
                ? pathname === item.href
                : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`label whitespace-nowrap transition-colors hover:text-ink ${
                    active ? "text-ink" : "text-ink-muted"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="ml-auto flex items-center gap-5">
            <Link
              href="/"
              className="label hidden text-ink-muted hover:text-ink sm:block"
            >
              View shop
            </Link>
            <button
              type="button"
              onClick={() => getBrowserClient().auth.signOut()}
              className="label text-ink-muted hover:text-ink"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-[1400px] flex-1 px-5 py-10 md:px-8">
        {children}
      </main>
    </div>
  );
}
