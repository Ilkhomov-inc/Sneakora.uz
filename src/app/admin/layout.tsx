import type { Metadata } from "next";
import { manrope, unbounded } from "../fonts";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: { default: "Админка — Sneakora", template: "%s — Админка Sneakora" },
  robots: { index: false, follow: false },
};

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru" className={`${manrope.variable} ${unbounded.variable}`}>
      <body className="min-h-svh bg-[#F6F5F2] text-ink">{children}</body>
    </html>
  );
}
