import { connectDB } from "@/lib/mongodb";
import Lead from "@/models/Lead";
import { NextResponse } from "next/server";

export async function GET(req) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);

    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || ""; // 👈 NEW

    const skip = (page - 1) * limit;

    // -------------------------------
    // 🔍 Build Dynamic Query
    // -------------------------------
    let query = {};

    if (search) {
      query.$or = [
        { adminName: { $regex: search, $options: "i" } },
        { adminEmail: { $regex: search, $options: "i" } },
        { adminPhone: { $regex: search, $options: "i" } },
        { locationName: { $regex: search, $options: "i" } },
      ];
    }

    // 🟡 Apply status filter only if not "All"
    if (status && status !== "all") {
      query.status = status;
    }

    // -------------------------------
    // 📦 Pagination + Fetching
    // -------------------------------
    const total = await Lead.countDocuments(query);
    const leads = await Lead.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    return NextResponse.json({
      success: true,
      leads,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("❌ API ERROR:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
