import { NextRequest } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { requireAuth } from "@/lib/auth-helpers";
import { Patient } from "@/models/Patient";

export async function GET(req: NextRequest) {
  const session = await requireAuth();
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectDB();

  const { searchParams } = req.nextUrl;
  const search = searchParams.get("search") || "";
  const page = Math.max(1, Number(searchParams.get("page") || 1));
  const limit = Math.min(100, Math.max(1, Number(searchParams.get("limit") || 30)));
  const skip = (page - 1) * limit;

  const matchStage: Record<string, unknown> = { isDeleted: false };
  if (search) {
    matchStage.condition = { $regex: search, $options: "i" };
  }

  const [conditions, countResult] = await Promise.all([
    Patient.aggregate([
      { $match: matchStage },
      { $group: { _id: "$condition" } },
      { $sort: { _id: 1 } },
      { $skip: skip },
      { $limit: limit },
      { $project: { _id: 0, name: "$_id" } },
    ]),
    Patient.aggregate([
      { $match: matchStage },
      { $group: { _id: "$condition" } },
      { $count: "total" },
    ]),
  ]);

  const total = countResult[0]?.total ?? 0;

  return Response.json({
    items: conditions.map((c, i) => ({ _id: c.name, name: c.name, _index: i })),
    total,
    page,
    totalPages: Math.ceil(total / limit),
  });
}
