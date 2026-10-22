import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth/admin";
import { storage, UPLOAD_TYPES } from "@/lib/storage";

/** Admin file upload (photos, logos, banner videos). Returns the public URL to store. */
export async function POST(request: Request) {
  if (!(await getAdminSession())) return NextResponse.json({ error: "Нужно войти в админку" }, { status: 401 });

  const form = await request.formData().catch(() => null);
  const file = form?.get("file");
  if (!(file instanceof File)) return NextResponse.json({ error: "Файл не получен" }, { status: 400 });

  const type = UPLOAD_TYPES[file.type];
  if (!type) return NextResponse.json({ error: `Формат ${file.type || "файла"} не поддерживается` }, { status: 415 });
  if (file.size > type.maxBytes) {
    return NextResponse.json({ error: `Файл больше ${Math.round(type.maxBytes / 1024 / 1024)} МБ` }, { status: 413 });
  }

  const url = await storage.save(Buffer.from(await file.arrayBuffer()), type.ext);
  return NextResponse.json({ url });
}
