import { NextRequest } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { requireAuth } from "@/lib/auth-helpers";
import { Hospital } from "@/models/Hospital";
import { createHospitalSchema } from "@/lib/validations";

export async function GET() {
  const session = await requireAuth();
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectDB();

  const hospitals = await Hospital.find().sort({ name: 1 }).lean();

  return Response.json(hospitals);
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
