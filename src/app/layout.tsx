import "./globals.css";

// The <html> element is rendered by the two root layouts: app/[locale]/layout.tsx (store)
// and app/admin/layout.tsx (admin panel). This file only has to exist for app/not-found.tsx.
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return children;
}
