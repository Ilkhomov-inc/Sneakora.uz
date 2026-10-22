import Link from "next/link";
import { manrope, unbounded } from "./fonts";

// Fallback for URLs outside the store and the admin panel.
export default function NotFound() {
  return (
    <html lang="ru" className={`${manrope.variable} ${unbounded.variable}`}>
      <body className="flex min-h-svh flex-col items-center justify-center gap-4 p-6 text-center">
        <p className="font-display text-6xl font-bold">404</p>
        <p className="text-stone">Страница не найдена · Sahifa topilmadi</p>
        <Link href="/" className="rounded-2xl bg-ink px-5 py-3 text-sm font-semibold text-white">
          На главную
        </Link>
      </body>
    </html>
  );
}
