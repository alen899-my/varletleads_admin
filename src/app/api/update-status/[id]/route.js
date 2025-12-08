import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Lead from "@/models/Lead";

export async function PUT(req, context) {
  await connectDB();

  const params = await context.params; // ← FIX HERE

  try {
    const { status } = await req.json();

    if (!["pending", "completed"].includes(status)) {
      return NextResponse.json({
        success: false,
        message: "Invalid status",
      });
    }

    await Lead.findByIdAndUpdate(params.id, { status });

    return NextResponse.json({
      success: true,
      message: "Status updated successfully",
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({
      success: false,
      message: "Server error",
    });
  }
}
