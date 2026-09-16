import { put } from "@vercel/blob";
import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "File gambar wajib diisi." }, { status: 400 });
    }

    if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
      return NextResponse.json(
        { error: "Format file tidak didukung." },
        { status: 400 },
      );
    }

    if (file.size > MAX_IMAGE_SIZE) {
      return NextResponse.json(
        { error: "Ukuran file terlalu besar. Maksimum 5MB." },
        { status: 400 },
      );
    }

    const extension = file.type.split("/")[1] || "bin";
    const blob = await put(`items/${randomUUID()}.${extension}`, file, {
      access: "private",
      addRandomSuffix: false,
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });

    const bytes = Buffer.from(await file.arrayBuffer());
    const base64 = `data:${file.type};base64,${bytes.toString("base64")}`;

    return NextResponse.json({ base64, blobUrl: blob.url });
  } catch (error) {
    console.error("Gagal mengunggah gambar ke Blob:", error);
    return NextResponse.json(
      { error: "Gagal mengunggah gambar." },
      { status: 500 },
    );
  }
}
