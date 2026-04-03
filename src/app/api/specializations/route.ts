import { NextRequest } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { requireAuth } from "@/lib/auth-helpers";
import { Specialization } from "@/models/Specialization";
import { createSpecializationSchema } from "@/lib/validations";

export async function GET() {
  const session = await requireAuth();
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectDB();

  const specializations = await Specialization.find()
    .sort({ name: 1 })
    .lean();

  return Response.json(specializations);
}

export async function POST(req: NextRequest) {
  const session = await requireAuth();
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectDB();

  const body = await req.json();
  const parsed = createSpecializationSchema.safeParse(body);

  if (!parsed.success) {
    return Response.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const specialization = await Specialization.create(parsed.data);

  return Response.json(specialization, { status: 201 });
}
