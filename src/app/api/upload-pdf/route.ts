import { put } from "@vercel/blob";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const form = await request.formData();
    const file = form.get("file") as File;
    const filename = form.get("filename") as string;

    if (!file || !filename) {
      return NextResponse.json(
        { error: "File and filename are required." },
        { status: 400 }
      );
    }

    // 1. Upload to Vercel Blob
    // 'access: "public"' ensures the resulting URL is shareable.
    // We add a timestamp to folder path to organize uploads.
    const dateFolder = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const blob = await put(`registrations/${dateFolder}/${filename}`, file, {
      access: "public",
      // Optional: Add metadata if needed so you know which lead this belongs to later
      // token: '...', // if you need specific auth tokens
    });

    // 2. Return the public URL
    return NextResponse.json({
      success: true,
      url: blob.url,
    });

  } catch (error) {
    console.error("Error uploading PDF to Blob:", error);
    return NextResponse.json(
      { error: "Failed to upload PDF file." },
      { status: 500 }
    );
  }
}