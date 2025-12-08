import { connectDB } from "@/lib/mongodb";
import { GridFSBucket, ObjectId } from "mongodb";
import { NextResponse } from "next/server";

export async function GET(req, { params }) {
  try {
    // 1. Await the params object
    const { id } = await params;

    const conn = await connectDB();
    const bucket = new GridFSBucket(conn.connection.db, {
      bucketName: "uploads",
    });

    // 2. Validate the ID format before creating ObjectId
    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, message: "Invalid file ID format" }, { status: 400 });
    }

    const fileId = new ObjectId(id);
    const files = await bucket.find({ _id: fileId }).toArray();

    if (files.length === 0) {
      return NextResponse.json({ success: false, message: "File not found" }, { status: 404 });
    }

    const file = files[0];
    const stream = bucket.openDownloadStream(fileId);

    // Determine the correct Content-Disposition based on file type
    let contentDisposition = "inline"; // Default to inline for images and other types
    if (file.contentType === "application/pdf") {
      contentDisposition = `inline; filename="${file.filename}"`;
// Trigger download for PDFs
    }

    return new NextResponse(stream, {
      headers: {
        "Content-Type": file.contentType,
        "Content-Disposition": contentDisposition,
      },
    });
  } catch (error) {
    console.error("❌ API ERROR:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}