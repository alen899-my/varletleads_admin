import { connectDB } from "@/lib/mongodb";
import { GridFSBucket, ObjectId } from "mongodb";

export async function GET(req, context) {
  try {
    // 🆕 Must await params
    const { id } = await context.params;

    if (!ObjectId.isValid(id)) {
      return new Response(JSON.stringify({ message: "Invalid file ID" }), { status: 400 });
    }

    const conn = await connectDB();
    const bucket = new GridFSBucket(conn.connection.db, { bucketName: "uploads" });

    const file = await bucket.find({ _id: new ObjectId(id) }).toArray();

    if (!file.length) {
      return new Response(JSON.stringify({ message: "File not found" }), { status: 404 });
    }

    const stream = bucket.openDownloadStream(new ObjectId(id));

    return new Response(stream, {
      headers: {
        "Content-Type": file[0].contentType,
        "Content-Disposition": `inline; filename="${file[0].filename}"`,
      },
    });

  } catch (error) {
    console.error("❌ API ERROR:", error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}
