import { connectDB } from "@/lib/mongodb";
import Lead from "@/models/Lead";
import { NextResponse } from "next/server";
import { put } from "@vercel/blob"; 

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
        const safeName = file.name.replace(/[^a-zA-Z0-9.]/g, "_");
        const filename = `leads/${safeName}`; 

        const blob = await put(filename, file, {
          access: 'public',
          addRandomSuffix: true,
        });

        attachments.push({
          fieldname: field,
          filename: file.name,
          path: blob.url, 
        });
      })
    );

    // Prepare other form fields
    const leadData = {};

    formData.forEach((value, key) => {
      // Skip file fields
      if (fileFields.includes(key)) return;

      // ✅ CHANGE IS HERE: Convert comma-separated strings back to Arrays for MongoDB
      if (key === "ticketType" || key === "feeType") {
         // If value exists, split by ", ". If empty, save empty array [].
         leadData[key] = value ? value.toString().split(", ") : [];
      } else {
         leadData[key] = value;
      }
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