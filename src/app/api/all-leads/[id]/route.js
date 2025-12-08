import { connectDB } from "@/lib/mongodb";
import Lead from "@/models/Lead";
import { NextResponse } from "next/server";
import { GridFSBucket } from "mongodb";

// ---------------------------------------------------------
// 1. GET Method - This POPULATES the form fields
// ---------------------------------------------------------
export async function GET(req, { params }) {
  try {
    // Await params (Required in Next.js 15+)
    const { id } = await params;

    await connectDB();

    // Find the specific lead by the ID provided in the URL
    const lead = await Lead.findById(id);

    if (!lead) {
      return NextResponse.json(
        { success: false, message: "Lead not found" },
        { status: 404 }
      );
    }

    // Return the lead data so the frontend can fill the state
    return NextResponse.json({
      success: true,
      lead,
    });
  } catch (error) {
    console.error("❌ GET ONE LEAD ERROR:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// ---------------------------------------------------------
// 2. PUT Method - This UPDATES the data when "Update" is clicked
// ---------------------------------------------------------
export async function PUT(req, { params }) {
  try {
    const { id } = await params;
    
    // Connect to DB and GridFS
    const { connection } = await connectDB();
    const bucket = new GridFSBucket(connection.db, { bucketName: "uploads" });

    const formData = await req.formData();
    
    // Prepare the update object
    const updateData = {};
    const attachments = []; // To store new file metadata

    // 1. Process Fields & Files
    for (const [key, value] of formData.entries()) {
      // If it's a File (and not empty)
      if (value instanceof File && value.size > 0) {
        const buffer = Buffer.from(await value.arrayBuffer());
        
        // Upload new file to GridFS
        const uploadStream = bucket.openUploadStream(value.name, {
          contentType: value.type,
        });
        uploadStream.end(buffer);

        // Add to attachments array for the DB
        attachments.push({
          filename: value.name,
          fileId: uploadStream.id, // GridFS Object ID
          fieldname: key,          // e.g., "companyLogo"
          contentType: value.type,
          uploadDate: new Date(),
        });

      } else if (typeof value === 'string') {
        // It's a normal text field
        updateData[key] = value;
      }
    }

    // 2. Find the existing lead to merge attachments
    const existingLead = await Lead.findById(id);
    if (!existingLead) {
        return NextResponse.json({ success: false, message: "Lead not found" }, { status: 404 });
    }

    // 3. Logic to Merge Attachments:
    // We start with the existing attachments.
    // If a NEW file was uploaded for a specific fieldname (e.g. 'companyLogo'),
    // we assume it replaces the old one.
    
    let finalAttachments = existingLead.attachments || [];

    if (attachments.length > 0) {
        attachments.forEach(newFile => {
            // Remove old file entry for this specific fieldname if it exists
            finalAttachments = finalAttachments.filter(oldFile => oldFile.fieldname !== newFile.fieldname);
            // Add the new file
            finalAttachments.push(newFile);
        });
    }

    updateData.attachments = finalAttachments;

    // 4. Update the document in MongoDB
    const updatedLead = await Lead.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true } // Return the updated doc
    );

    return NextResponse.json({
      success: true,
      message: "Lead updated successfully",
      lead: updatedLead,
    });

  } catch (error) {
    console.error("❌ UPDATE LEAD ERROR:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}