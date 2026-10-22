import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { getProduct, getRelatedProducts } from "@/lib/catalog";
import { getSettings, telegramChatUrl } from "@/lib/settings";
import { compareSizes } from "@/lib/sizes";
import { tr } from "@/lib/format";
import { siteUrl } from "@/lib/site";
import type { Locale } from "@/lib/types";
import { ProductView, type ProductViewData } from "@/components/shop/product/ProductView";
import { ProductRail } from "@/components/shop/ProductRail";

export async function generateMetadata({ params }: PageProps<"/[locale]/t/[slug]">): Promise<Metadata> {
  const { slug, locale } = await params;
  const product = await getProduct(slug);
  if (!product) return {};
  const image = product.variants[0]?.images[0];
  const title = `${product.brand.name} ${product.name}`;
  return {
    title,
    description: tr(locale as Locale, product.descriptionRu, product.descriptionUz).slice(0, 160),
    openGraph: { title, images: image ? [image] : undefined },
  };
}

export default async function ProductPage({ params, searchParams }: PageProps<"/[locale]/t/[slug]">) {
  const { slug, locale: raw } = await params;
  const locale = raw as Locale;
  setRequestLocale(locale);

  const product = await getProduct(slug);
  if (!product) notFound();

  const [t, settings, related, query] = await Promise.all([
    getTranslations("product"),
    getSettings(),
    getRelatedProducts(product),
    searchParams,
  ]);

  const data: ProductViewData = {
    id: product.id,
    slug: product.slug,
    name: product.name,
    brandName: product.brand.name,
    brandSlug: product.brand.slug,
    gender: product.gender,
    price: product.price,
    salePrice: product.salePrice,
    isNew: product.isNew,
    description: tr(locale, product.descriptionRu, product.descriptionUz),
    variants: product.variants.map((v) => ({
      id: v.id,
      sku: v.sku,
      colorNameRu: v.colorNameRu,
      colorNameUz: v.colorNameUz,
      colorHex: v.colorHex,
      images: v.images,
      sizes: v.sizes.map((s) => ({ size: s.size, stock: s.stock })).sort((a, b) => compareSizes(a.size, b.size)),
    })),
  };
  const initialSku = typeof query.color === "string" ? query.color : undefined;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: `${product.brand.name} ${product.name}`,
    brand: { "@type": "Brand", name: product.brand.name },
    sku: product.variants[0]?.sku,
    image: product.variants.flatMap((v) => v.images.slice(0, 1)),
    description: data.description,
    offers: {
      "@type": "Offer",
      priceCurrency: "UZS",
      price: product.salePrice ?? product.price,
      availability: product.variants.some((v) => v.sizes.some((s) => s.stock > 0))
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      url: `${siteUrl()}${locale === "uz" ? "/uz" : ""}/t/${product.slug}`,
    },
  };

  return (
    <div className="space-y-20 pt-6 md:pt-10">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <ProductView
        product={data}
        initialSku={initialSku}
        deliveryText={tr(locale, settings.deliveryRu, settings.deliveryUz)}
        telegramUrl={telegramChatUrl(settings.telegramUsername)}
      />
      <div className="shell">
        <ProductRail title={t("related")} products={related} />
      </div>
    </div>
  );
}
