import { connectDB } from "@/lib/mongodb";
import Lead from "@/models/Lead";
import { NextResponse } from "next/server";
import { put } from "@vercel/blob"; // Import Vercel Blob

function generateReference() {
  const random = Math.floor(100000 + Math.random() * 900000);
  return `VAL-${random}`;
}

export async function POST(req) {
  try {
    await connectDB();
    
    const formData = await req.formData();
    
    // Create attachments array
    const attachments = [];

    const allowedImages = ["image/png", "image/jpeg"];
    const allowedPdfs = ["application/pdf"];

    const fileFields = ["companyLogo", "clientLogo", "vatCertificate", "tradeLicense"];

    // Process files concurrently and upload to Vercel Blob
    await Promise.all(
      fileFields.map(async (field) => {
        const file = formData.get(field);

        // Check if file exists and is actually a File object (not a string)
        if (!file || typeof file === "string" || file.size === 0) return;

        // Validate file type
        if (field.includes("Logo") && !allowedImages.includes(file.type)) {
          throw new Error(`${field} must be PNG/JPEG`);
        }

        if (["vatCertificate", "tradeLicense"].includes(field) && !allowedPdfs.includes(file.type)) {
          throw new Error(`${field} must be PDF`);
        }

        // --- VERCEL BLOB UPLOAD LOGIC ---
        
        // 1. Define filename (Vercel Blob handles uniqueness automatically, but adding prefix helps organization)
        // We do not need a timestamp here necessarily as Vercel adds a hash, but it keeps names clean.
        const safeName = file.name.replace(/[^a-zA-Z0-9.]/g, "_");
        const filename = `leads/${safeName}`; // Puts it in a 'leads' folder in your blob store

        // 2. Upload to Vercel Blob
        const blob = await put(filename, file, {
          access: 'public', // Files are publicly accessible via URL
        });

        // 3. Push metadata (saving the Blob URL)
        attachments.push({
          fieldname: field,
          filename: file.name,
          path: blob.url, // This is the public URL (e.g. https://store.vercel.../file.png)
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