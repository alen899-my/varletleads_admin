import { connectDB } from "@/lib/mongodb";
import Lead from "@/models/Lead";
import { NextResponse } from "next/server";
import { put, del } from "@vercel/blob"; // 1. Added 'del' import

// ---------------------------------------------------------
// 1. GET Method - This POPULATES the form fields
// ---------------------------------------------------------
export async function GET(req, { params }) {
  try {
    const { id } = await params;

    await connectDB();

    const lead = await Lead.findById(id);

    if (!lead) {
      return NextResponse.json(
        { success: false, message: "Lead not found" },
        { status: 404 }
      );
    }

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
    
    await connectDB();

    const formData = await req.formData();
    
    const updateData = {};
    const attachments = []; 

    // 1. Process Fields & Files
    const fileProcessingPromises = [];

    for (const [key, value] of formData.entries()) {
      if (value instanceof File && value.size > 0) {
        
        const processFile = async () => {
            // Note: Added addRandomSuffix: true to prevent conflicts as discussed
            const safeName = value.name.replace(/[^a-zA-Z0-9.]/g, "_");
            const filename = `leads/${Date.now()}-${safeName}`; 

            const blob = await put(filename, value, {
                access: 'public',
                addRandomSuffix: true, 
            });

            attachments.push({
                fieldname: key,          
                filename: value.name,
                path: blob.url,          
            });
        };
        fileProcessingPromises.push(processFile());

      } else if (typeof value === 'string') {
        updateData[key] = value;
      }
    }

    await Promise.all(fileProcessingPromises);

    // 2. Find the existing lead
    const existingLead = await Lead.findById(id);
    if (!existingLead) {
        return NextResponse.json({ success: false, message: "Lead not found" }, { status: 404 });
    }

    // 3. Logic to Merge Attachments AND DELETE OLD FILES
    let finalAttachments = existingLead.attachments || [];

    if (attachments.length > 0) {
        const deletionPromises = [];

        attachments.forEach(newFile => {
            // A. Find the old file for this specific field (e.g., 'companyLogo')
            const oldFile = finalAttachments.find(f => f.fieldname === newFile.fieldname);

            // B. If an old file exists, delete it from Vercel Blob
            if (oldFile && oldFile.path) {
                console.log(`Deleting old file: ${oldFile.path}`);
                deletionPromises.push(del(oldFile.path));
            }

            // C. Remove old file metadata from the array
            finalAttachments = finalAttachments.filter(old => old.fieldname !== newFile.fieldname);
            
            // D. Add the new file metadata
            finalAttachments.push(newFile);
        });

        // Wait for deletions to ensure Vercel is clean
        await Promise.all(deletionPromises);
    }

    updateData.attachments = finalAttachments;

    // 4. Update the document in MongoDB
    const updatedLead = await Lead.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true } 
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