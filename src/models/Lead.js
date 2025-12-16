import mongoose from "mongoose";

const LeadSchema = new mongoose.Schema(
  {
    referenceId: {
      type: String,
      unique: true,
      required: true,
    },
    // Step fields remain...
    locationName: String,
    capacity: Number,
    waitTime: String,
    mapsUrl: String,
    latitude: String,
    longitude: String,
    timing: String,
    address: String,

    lobbies: Number,
    keyRooms: Number,
    distance: String,
    supervisorUser: String,
    validationUser: String,
    reportUser: String,

    ticketType: {
      type: [String], 
      default: []
    },
    feeType: {
      type: [String],
      default: []
    },
    ticketPricing: String,
    vatType: String,

    driverCount: Number,
    driverList: String,

    adminName: String,
    adminEmail: String,
    adminPhone: String,
    trainingRequired: String,
    status: {
      type: String,
      enum: ["pending", "completed"],
      default: "pending",
    },

   attachments: [
      {
        fieldname: String,
        filename: String,
        // Stores the Vercel Blob URL (e.g., https://xyz.public.blob.vercel-storage.com/file.png)
        path: String, 
      },
    ],

    documentSubmitMethod: String,
  },
  { timestamps: true }
);

export default mongoose.models.Lead || mongoose.model("Lead", LeadSchema);