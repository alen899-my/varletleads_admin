import { connectDB } from "@/lib/mongodb";
import Lead from "@/models/Lead";
import { NextResponse } from "next/server";

// Force dynamic ensures Vercel doesn't cache the API response statically
export const dynamic = "force-dynamic";

export async function GET(req) {
  try {
    await connectDB();

    const url = new URL(req.url);
    const page = parseInt(url.searchParams.get("page") || "1");
    const limit = parseInt(url.searchParams.get("limit") || "50");
    const search = url.searchParams.get("search") || "";
    const status = url.searchParams.get("status") || "";

    const skip = (page - 1) * limit;

    // -------------------------------
    // 🔍 Dynamic Query
    // -------------------------------
    let query = {};

    if (search) {
      const regex = { $regex: search, $options: "i" }; // reused → faster

      query.$or = [
        { adminName: regex },
        { adminEmail: regex },
        { adminPhone: regex },
        { locationName: regex },
        { referenceId: regex },
        { driverList: regex }, // Added ability to search drivers
      ];
    }

    if (status && status !== "all") {
      query.status = status;
    }

    // -------------------------------
    // 🚀 Run Queries in Parallel (50–70% faster)
    // -------------------------------
    const [total, leads] = await Promise.all([
      Lead.countDocuments(query),
      Lead.find(query)
        .lean() // Converts Mongoose docs to plain JS objects (Faster)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
    ]);

    return NextResponse.json({
      success: true,
      leads,           // <-- all fields included
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