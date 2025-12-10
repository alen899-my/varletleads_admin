import { connectDB } from "@/lib/mongodb";
import Lead from "@/models/Lead";
import { NextResponse } from "next/server";
import path from "path";
import { writeFile, mkdir } from "fs/promises";

function generateReference() {
  const random = Math.floor(100000 + Math.random() * 900000);
  return `VAL-${random}`;
}

export async function POST(req) {
  try {
    const conn = await connectDB();
    // GridFS/DB Client logic removed as we are saving to disk
    
    const formData = await req.formData();
    
    // Create attachments array
    const attachments = [];

    const allowedImages = ["image/png", "image/jpeg"];
    const allowedPdfs = ["application/pdf"];

    const fileFields = ["companyLogo", "clientLogo", "vatCertificate", "tradeLicense"];

    // Process files concurrently
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

        // --- NEW LOCAL SAVE LOGIC ---
        
        // 1. Define safe filename (timestamp + sanitized original name)
        const timestamp = Date.now();
        const safeName = file.name.replace(/[^a-zA-Z0-9.]/g, "_");
        const filename = `${timestamp}-${safeName}`;

        // 2. Define path (public/uploads)
        // ensure you create a folder named 'uploads' inside your 'public' folder
        const uploadDir = path.join(process.cwd(), "public", "uploads");
        
        // 3. Ensure directory exists
        await mkdir(uploadDir, { recursive: true });

        // 4. Write file to disk
        const filePath = path.join(uploadDir, filename);
        await writeFile(filePath, buffer);

        // 5. Push metadata (saving the public URL path)
        attachments.push({
          fieldname: field,
          filename: file.name,
          path: `/uploads/${filename}`, // This acts as the ID/URL
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