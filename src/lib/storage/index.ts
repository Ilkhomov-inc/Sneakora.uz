import "server-only";
import { randomBytes } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

// Where uploaded photos and videos go. Today: a folder on the server (a Docker volume in production).
// To move to S3 / a CDN later, add another StorageProvider and switch `storage` below.
export interface StorageProvider {
  /** Saves the file and returns the public URL to store in the database. */
  save(data: Buffer, ext: string): Promise<string>;
}

// The ignore comment keeps the build's file tracing from copying the whole project into the server bundle.
export const UPLOAD_ROOT = path.resolve(/* turbopackIgnore: true */ process.env.UPLOAD_DIR || "./uploads");

class LocalDiskStorage implements StorageProvider {
  async save(data: Buffer, ext: string): Promise<string> {
    const now = new Date();
    const folder = `${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, "0")}`;
    const name = `${randomBytes(12).toString("hex")}.${ext}`;
    await mkdir(path.join(/* turbopackIgnore: true */ UPLOAD_ROOT, folder), { recursive: true });
    await writeFile(path.join(/* turbopackIgnore: true */ UPLOAD_ROOT, folder, name), data);
    return `/uploads/${folder}/${name}`;
  }
}

export const storage: StorageProvider = new LocalDiskStorage();

export const UPLOAD_TYPES: Record<string, { ext: string; maxBytes: number }> = {
  "image/jpeg": { ext: "jpg", maxBytes: 15 * 1024 * 1024 },
  "image/png": { ext: "png", maxBytes: 15 * 1024 * 1024 },
  "image/webp": { ext: "webp", maxBytes: 15 * 1024 * 1024 },
  "image/avif": { ext: "avif", maxBytes: 15 * 1024 * 1024 },
  "image/gif": { ext: "gif", maxBytes: 15 * 1024 * 1024 },
  "image/svg+xml": { ext: "svg", maxBytes: 1024 * 1024 },
  "video/mp4": { ext: "mp4", maxBytes: 150 * 1024 * 1024 },
  "video/webm": { ext: "webm", maxBytes: 150 * 1024 * 1024 },
};

export const CONTENT_TYPES: Record<string, string> = Object.fromEntries(
  Object.entries(UPLOAD_TYPES).map(([type, { ext }]) => [ext, type]),
);
