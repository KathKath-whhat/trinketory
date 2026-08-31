import SiteHeader from "@/components/site-header";
import SiteFooter from "@/components/site-footer";
import BagDrawer from "@/components/bag-drawer";
import { getCategories } from "@/lib/catalog";

export default async function StorefrontLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  /* Nav is catalogue-driven: adding a category in Supabase adds it here. */
  const categories = await getCategories();

  return (
    <>
      <SiteHeader categories={categories} />
      <main className="flex-1">{children}</main>
      <SiteFooter categories={categories} />
      <BagDrawer />
    </>
  );
}
