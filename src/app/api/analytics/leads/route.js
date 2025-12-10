import { connectDB } from "@/lib/mongodb";
import Lead from "@/models/Lead";

export async function GET() {
  await connectDB();

  // Run all heavy DB queries in parallel → MUCH FASTER
  const [data, total, recentLeads] = await Promise.all([
    // Monthly Aggregation
    Lead.aggregate([
      {
        $group: {
          _id: { $month: "$createdAt" },
          count: { $sum: 1 },
          completed: {
            $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] }
          },
          pending: {
            $sum: { $cond: [{ $eq: ["$status", "pending"] }, 1, 0] }
          }
        }
      },
      { $sort: { _id: 1 } }
    ]),

    // Count all documents
    Lead.countDocuments(),

    // Recent 5 leads
    Lead.find({})
      .sort({ createdAt: -1 })
      .limit(5)
      .select("adminName adminEmail locationName status createdAt")
  ]);

  return Response.json({
    success: true,
    data,
    total,
    recentLeads
  });
}
