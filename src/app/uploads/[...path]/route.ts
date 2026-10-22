import { readFile } from "node:fs/promises";
import path from "node:path";
import { CONTENT_TYPES, UPLOAD_ROOT } from "@/lib/storage";

// Serves files uploaded through the admin panel. In production Caddy serves /uploads directly
// from the same volume; this route keeps local development and plain `next start` working.
export async function GET(_request: Request, { params }: RouteContext<"/uploads/[...path]">) {
  const segments = (await params).path;
  const file = path.resolve(/* turbopackIgnore: true */ UPLOAD_ROOT, ...segments);
  if (!file.startsWith(UPLOAD_ROOT + path.sep)) return new Response("Not found", { status: 404 });

  const type = CONTENT_TYPES[path.extname(file).slice(1).toLowerCase()];
  if (!type) return new Response("Not found", { status: 404 });

  try {
    const data = await readFile(/* turbopackIgnore: true */ file);
    return new Response(new Uint8Array(data), {
      headers: {
        "Content-Type": type,
        "Cache-Control": "public, max-age=31536000, immutable",
        "X-Content-Type-Options": "nosniff",
        // SVGs are opened as documents when visited directly: forbid scripts in them.
        ...(type === "image/svg+xml" ? { "Content-Security-Policy": "default-src 'none'; style-src 'unsafe-inline'; sandbox" } : {}),
      },
    });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}
