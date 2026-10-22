// Store identity. When the final logo arrives: put the file into /public/logo/ and set `logoSrc`
// (e.g. "/logo/sneakora.svg"); until then the text wordmark is shown.
export const SITE = {
  name: "Sneakora",
  wordmark: "SNEAKORA",
  domain: "sneakora.uz",
  logoSrc: null as string | null,
};

export function siteUrl(): string {
  return (process.env.SITE_URL || "http://localhost:3000").replace(/\/$/, "");
}
