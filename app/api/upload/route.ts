/**
 * API ROUTE — POST /api/upload
 *
 * Accepts a multipart/form-data file, uploads it to Cloudinary, returns the URL.
 * No business logic here — delegate to uploadController.
 */

import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/middleware";
import { uploadImage } from "@/controllers/uploadController";

export const POST = withAuth(async (req: NextRequest) => {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });

    const url = await uploadImage(file);
    return NextResponse.json({ url });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Upload failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
});
