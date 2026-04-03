import { NextRequest } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { requireAuth } from "@/lib/auth-helpers";
import { Doctor } from "@/models/Doctor";
import { Patient } from "@/models/Patient";

export async function GET(req: NextRequest) {
  const session = await requireAuth();
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectDB();

  const { searchParams } = req.nextUrl;
  const dateFrom = searchParams.get("dateFrom");
  const dateTo = searchParams.get("dateTo");

  // Build date filter for aggregation pipelines
  const dateMatch: Record<string, unknown> = { isDeleted: false };
  if (dateFrom || dateTo) {
    dateMatch.createdAt = {};
    if (dateFrom)
      (dateMatch.createdAt as Record<string, unknown>).$gte = new Date(
        dateFrom
      );
    if (dateTo)
      (dateMatch.createdAt as Record<string, unknown>).$lte = new Date(dateTo);
  }

  // Doctor date filter (separate since Doctor model has its own soft delete)
  const doctorDateFilter: Record<string, unknown> = {};
  if (dateFrom || dateTo) {
    doctorDateFilter.createdAt = {};
    if (dateFrom)
      (doctorDateFilter.createdAt as Record<string, unknown>).$gte = new Date(
        dateFrom
      );
    if (dateTo)
      (doctorDateFilter.createdAt as Record<string, unknown>).$lte = new Date(
        dateTo
      );
  }

  const [
    totalDoctors,
    totalPatients,
    topDoctorsByPatients,
    monthlyTrends,
    conditionDistribution,
  ] = await Promise.all([
    Doctor.countDocuments(doctorDateFilter),
    Patient.countDocuments(
      dateFrom || dateTo ? { ...dateMatch } : {}
    ),

    // Top 10 doctors by patient count
    Patient.aggregate([
      { $match: dateMatch },
      { $group: { _id: "$doctor", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: "doctors",
          localField: "_id",
          foreignField: "_id",
          as: "doctor",
        },
      },
      { $unwind: "$doctor" },
      {
        $project: {
          name: "$doctor.name",
          count: 1,
        },
      },
    ]),

    // Monthly registration trends
    Patient.aggregate([
      { $match: dateMatch },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
          },
          patients: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
      { $limit: 12 },
      {
        $project: {
          _id: 0,
          month: {
            $concat: [
              { $toString: "$_id.year" },
              "-",
              {
                $cond: [
                  { $lt: ["$_id.month", 10] },
                  { $concat: ["0", { $toString: "$_id.month" }] },
                  { $toString: "$_id.month" },
                ],
              },
            ],
          },
          patients: 1,
        },
      },
    ]),

    // Patient condition distribution
    Patient.aggregate([
      { $match: dateMatch },
      { $group: { _id: "$condition", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
      { $project: { _id: 0, condition: "$_id", count: 1 } },
    ]),
  ]);

  return Response.json({
    totalDoctors,
    totalPatients,
    avgPatientsPerDoctor:
      totalDoctors > 0 ? Math.round(totalPatients / totalDoctors) : 0,
    topDoctorsByPatients,
    monthlyTrends,
    conditionDistribution,
  });
}
