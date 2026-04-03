import { NextRequest } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { requireAuth } from "@/lib/auth-helpers";
import { Patient } from "@/models/Patient";
import { createPatientSchema, patientQuerySchema } from "@/lib/validations";

export async function GET(req: NextRequest) {
  const session = await requireAuth();
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectDB();

  const { searchParams } = req.nextUrl;
  const parsed = patientQuerySchema.safeParse(
    Object.fromEntries(searchParams.entries())
  );

  if (!parsed.success) {
    return Response.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { page, limit, search, condition, doctor, dateFrom, dateTo } =
    parsed.data;

  const filter: Record<string, unknown> = {};

  if (search) {
    filter.$text = { $search: search };
  }

  if (condition) {
    filter.condition = condition;
  }

  if (doctor) {
    filter.doctor = doctor;
  }

  if (dateFrom || dateTo) {
    filter.createdAt = {};
    if (dateFrom)
      (filter.createdAt as Record<string, unknown>).$gte = new Date(dateFrom);
    if (dateTo)
      (filter.createdAt as Record<string, unknown>).$lte = new Date(dateTo);
  }

  const skip = (page - 1) * limit;

  const [patients, total] = await Promise.all([
    Patient.find(filter)
      .populate("doctor", "name")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Patient.countDocuments(filter),
  ]);

  return Response.json({
    patients,
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
  const parsed = createPatientSchema.safeParse(body);

  if (!parsed.success) {
    return Response.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const patient = await Patient.create(parsed.data);
  const populated = await Patient.findById(patient._id)
    .populate("doctor", "name")
    .lean();

  return Response.json(populated, { status: 201 });
}
