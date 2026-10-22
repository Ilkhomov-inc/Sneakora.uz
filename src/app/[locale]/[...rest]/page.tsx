import { notFound } from "next/navigation";

// Unknown URLs inside the store render the localized not-found page with header and footer.
export default function CatchAll() {
  notFound();
}
