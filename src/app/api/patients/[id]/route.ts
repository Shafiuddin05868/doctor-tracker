import { NextRequest } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { requireAuth } from "@/lib/auth-helpers";
import { Patient } from "@/models/Patient";
import { updatePatientSchema } from "@/lib/validations";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, ctx: RouteContext) {
  const session = await requireAuth();
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectDB();
  const { id } = await ctx.params;

  const patient = await Patient.findById(id)
    .populate("doctor", "name")
    .lean();

  if (!patient) {
    return Response.json({ error: "Patient not found" }, { status: 404 });
  }

  return Response.json(patient);
}

export async function PUT(req: NextRequest, ctx: RouteContext) {
  const session = await requireAuth();
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectDB();
  const { id } = await ctx.params;

  const body = await req.json();
  const parsed = updatePatientSchema.safeParse(body);

  if (!parsed.success) {
    return Response.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const patient = await Patient.findByIdAndUpdate(id, parsed.data, {
    new: true,
  })
    .populate("doctor", "name")
    .lean();

  if (!patient) {
    return Response.json({ error: "Patient not found" }, { status: 404 });
  }

  return Response.json(patient);
}

export async function DELETE(_req: NextRequest, ctx: RouteContext) {
  const session = await requireAuth();
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectDB();
  const { id } = await ctx.params;

  const patient = await Patient.findByIdAndUpdate(
    id,
    { isDeleted: true, deletedAt: new Date() },
    { new: true }
  );

  if (!patient) {
    return Response.json({ error: "Patient not found" }, { status: 404 });
  }

  return Response.json({ message: "Patient deleted" });
}
