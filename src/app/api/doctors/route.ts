import { NextRequest } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { requireAuth } from "@/lib/auth-helpers";
import { Doctor } from "@/models/Doctor";
import { Patient } from "@/models/Patient";
import { createDoctorSchema, doctorQuerySchema } from "@/lib/validations";

export async function GET(req: NextRequest) {
  const session = await requireAuth();
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectDB();

  const { searchParams } = req.nextUrl;
  const parsed = doctorQuerySchema.safeParse(
    Object.fromEntries(searchParams.entries())
  );

  if (!parsed.success) {
    return Response.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { page, limit, search, specialization, hospital, dateFrom, dateTo } =
    parsed.data;

  const filter: Record<string, unknown> = {};

  // Using $text search (not $regex) for scalability — $text uses MongoDB's
  // inverted text index which performs well at millions of records.
  // Trade-off: requires full word matches (e.g. "John" works, "Jo" doesn't).
  // For an admin portal this is acceptable — admins know what they're searching for.
  if (search) {
    filter.$text = { $search: search };
  }

  if (specialization) {
    filter.specialization = specialization;
  }

  if (hospital) {
    filter.hospital = hospital;
  }

  if (dateFrom || dateTo) {
    filter.createdAt = {};
    if (dateFrom) (filter.createdAt as Record<string, unknown>).$gte = new Date(dateFrom);
    if (dateTo) (filter.createdAt as Record<string, unknown>).$lte = new Date(dateTo);
  }

  const skip = (page - 1) * limit;

  const [doctors, total] = await Promise.all([
    Doctor.find(filter)
      .populate("specialization", "name")
      .populate("hospital", "name")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Doctor.countDocuments(filter),
  ]);

  // Attach patient count for each doctor
  const doctorIds = doctors.map((d) => d._id);
  const patientCounts = await Patient.aggregate([
    { $match: { doctor: { $in: doctorIds }, isDeleted: false } },
    { $group: { _id: "$doctor", count: { $sum: 1 } } },
  ]);

  const countMap = new Map(
    patientCounts.map((p) => [p._id.toString(), p.count])
  );

  const doctorsWithCount = doctors.map((d) => ({
    ...d,
    patientCount: countMap.get(d._id.toString()) || 0,
  }));

  return Response.json({
    doctors: doctorsWithCount,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  });
}

export async function POST(req: NextRequest) {
  const session = await requireAuth();
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectDB();

  const body = await req.json();
  const parsed = createDoctorSchema.safeParse(body);

  if (!parsed.success) {
    return Response.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const doctor = await Doctor.create(parsed.data);
  const populated = await Doctor.findById(doctor._id)
    .populate("specialization", "name")
    .populate("hospital", "name")
    .lean();

  return Response.json(populated, { status: 201 });
}
