import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";

export const runtime = "nodejs";

const MAX_IMAGE_BYTES = 5 * 1024 * 1024; // 5MB
const MAX_IMAGES = 5;
const ALLOWED_IMAGE_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};

// Handles complaint photo uploads via multipart FormData — kept as a plain
// Route Handler (not a Server Action) because Server Actions serialize
// their arguments through the RSC "Flight" protocol, which breaks down on
// multi-megabyte string payloads (base64-encoded images). A normal
// multipart POST streams binary file data directly with no such limit.
export async function POST(request: Request) {
  const session = await getSession();
  if (!session || session.role !== "citizen") {
    return NextResponse.json(
      { ok: false, error: "You must be logged in as a citizen to upload photos." },
      { status: 401 }
    );
  }

  const formData = await request.formData();
  const files = formData.getAll("images").filter((f): f is File => f instanceof File);

  if (files.length === 0) {
    return NextResponse.json(
      { ok: false, error: "At least one photo of the issue is required." },
      { status: 400 }
    );
  }
  if (files.length > MAX_IMAGES) {
    return NextResponse.json(
      { ok: false, error: `You can attach at most ${MAX_IMAGES} photos.` },
      { status: 400 }
    );
  }

  const fs = await import("fs");
  const path = await import("path");
  // UPLOADS_DIR lets deployment platforms (e.g. Railway) point this at a
  // persistent volume; defaults to public/uploads for local development,
  // where Next.js serves it directly as a static file at /uploads/<name>.
  const uploadsDir = process.env.UPLOADS_DIR || path.join(process.cwd(), "public", "uploads");
  fs.mkdirSync(uploadsDir, { recursive: true });

  const imagePaths: string[] = [];
  for (const file of files) {
    const extension = ALLOWED_IMAGE_TYPES[file.type];
    if (!extension) {
      return NextResponse.json(
        {
          ok: false,
          error: "Unsupported image type. Please upload JPG, PNG, WEBP, or GIF photos only.",
        },
        { status: 400 }
      );
    }
    if (file.size > MAX_IMAGE_BYTES) {
      return NextResponse.json(
        { ok: false, error: "Each photo must be under 5MB." },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${extension}`;
    fs.writeFileSync(path.join(uploadsDir, fileName), buffer);
    imagePaths.push(`/uploads/${fileName}`);
  }

  return NextResponse.json({ ok: true, imagePaths });
}
