import { connectDB } from "@/lib/mongodb";
import Lead from "@/models/Lead";
import { GridFSBucket } from "mongodb";
import { NextResponse } from "next/server";
// --- Generate Unique Reference ID ---
function generateReference() {
  const random = Math.floor(100000 + Math.random() * 900000); // 6-digit
  return `VAL-${random}`;
}
export async function POST(req) {
  try {
    const conn = await connectDB();
    const formData = await req.formData();

    const bucket = new GridFSBucket(conn.connection.db, {
      bucketName: "uploads",
    });

    const attachments = [];

    const allowedImageTypes = ["image/png", "image/jpeg"];
    const allowedPdfTypes = ["application/pdf"];

    const fileFields = ["companyLogo", "clientLogo", "vatCertificate", "tradeLicense"];

    for (const field of fileFields) {
      const file = formData.get(field);

      if (file && typeof file !== "string") {
        if (
          (field.includes("Logo") && !allowedImageTypes.includes(file.type)) ||
          (["vatCertificate", "tradeLicense"].includes(field) && !allowedPdfTypes.includes(file.type))
        ) {
          return NextResponse.json(
            { success: false, message: `${field} format not allowed.` },
            { status: 400 }
          );
        }

        const buffer = Buffer.from(await file.arrayBuffer());
        const uploadStream = bucket.openUploadStream(file.name);
        uploadStream.end(buffer);

        attachments.push({
          fieldname: field,
          filename: file.name,
          fileId: uploadStream.id,
        });
      }
    }

    const leadData = {};

    formData.forEach((value, key) => {
      if (!fileFields.includes(key)) leadData[key] = value;
    });
     const referenceId = generateReference();

    const newLead = await Lead.create({
      ...leadData,
      referenceId, 
      attachments,
    });
    const editUrl = `/location-registration/[id]/${newLead._id}`;

    return NextResponse.json({
  success: true,
  lead: newLead,
  referenceId,     // <-- return the value
  editUrl
}, { status: 201 });

  } catch (error) {
    console.error("❌ API ERROR:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
