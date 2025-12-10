import { connectDB } from "@/lib/mongodb";
import Lead from "@/models/Lead";
import { GridFSBucket } from "mongodb";
import { NextResponse } from "next/server";

function generateReference() {
  const random = Math.floor(100000 + Math.random() * 900000);
  return `VAL-${random}`;
}

export async function POST(req) {
  try {
    const conn = await connectDB();
    const db = conn.connection.getClient().db();

    const formData = await req.formData();

    const bucket = new GridFSBucket(db, { bucketName: "uploads" });

    const attachments = [];

    const allowedImages = ["image/png", "image/jpeg"];
    const allowedPdfs = ["application/pdf"];

    const fileFields = ["companyLogo", "clientLogo", "vatCertificate", "tradeLicense"];

    // Upload all files concurrently → much faster
    await Promise.all(
      fileFields.map(async (field) => {
        const file = formData.get(field);

        if (!file || typeof file === "string") return;

        // Validate file type
        if (field.includes("Logo") && !allowedImages.includes(file.type)) {
          throw new Error(`${field} must be PNG/JPEG`);
        }

        if (["vatCertificate", "tradeLicense"].includes(field) && !allowedPdfs.includes(file.type)) {
          throw new Error(`${field} must be PDF`);
        }

        // Convert file to buffer
        const buffer = Buffer.from(await file.arrayBuffer());

        // Upload to GridFS
        const uploadStream = bucket.openUploadStream(file.name);

        await new Promise((resolve, reject) => {
          uploadStream.on("finish", resolve);
          uploadStream.on("error", reject);
          uploadStream.end(buffer);
        });

        attachments.push({
          fieldname: field,
          filename: file.name,
          fileId: uploadStream.id.toString(),
        });
      })
    );

    // Prepare other form fields
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

    return NextResponse.json(
      {
        success: true,
        lead: newLead,
        referenceId,
        editUrl: `/location-registration/[id]/${newLead._id}`,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("❌ API ERROR:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
