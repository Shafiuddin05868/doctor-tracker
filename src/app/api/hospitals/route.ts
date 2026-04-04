import { NextRequest } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { requireAuth } from "@/lib/auth-helpers";
import { Hospital } from "@/models/Hospital";
import { createHospitalSchema, paginationSchema } from "@/lib/validations";

export async function GET(req: NextRequest) {
  const session = await requireAuth();
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectDB();

  const { searchParams } = req.nextUrl;
  const parsed = paginationSchema.safeParse(
    Object.fromEntries(searchParams.entries())
  );

  if (!parsed.success) {
    return Response.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { page, limit, search } = parsed.data;

  const filter: Record<string, unknown> = {};
  if (search) {
    filter.name = { $regex: search, $options: "i" };
  }

  const skip = (page - 1) * limit;

  const [items, total] = await Promise.all([
    Hospital.find(filter).sort({ name: 1 }).skip(skip).limit(limit).lean(),
    Hospital.countDocuments(filter),
  ]);

  return Response.json({
    items,
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
  const parsed = createHospitalSchema.safeParse(body);

  if (!parsed.success) {
    return Response.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const hospital = await Hospital.create(parsed.data);

  return Response.json(hospital, { status: 201 });
}
