import { connectDB } from "@/lib/mongodb";
import { requireAuth } from "@/lib/auth-helpers";
import { Doctor } from "@/models/Doctor";
import { Patient } from "@/models/Patient";

export async function GET() {
  const session = await requireAuth();
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectDB();

  const [
    totalDoctors,
    totalPatients,
    topDoctorsByPatients,
    monthlyTrends,
    conditionDistribution,
  ] = await Promise.all([
    Doctor.countDocuments(),
    Patient.countDocuments(),

    // Top 10 doctors by patient count
    Patient.aggregate([
      { $match: { isDeleted: false } },
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

    // Monthly registration trends (last 12 months)
    Patient.aggregate([
      { $match: { isDeleted: false } },
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
      { $match: { isDeleted: false } },
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
