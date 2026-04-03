import { NextRequest } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { requireAuth } from "@/lib/auth-helpers";
import { Doctor } from "@/models/Doctor";
import { updateDoctorSchema } from "@/lib/validations";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, ctx: RouteContext) {
  const session = await requireAuth();
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectDB();
  const { id } = await ctx.params;

  const doctor = await Doctor.findById(id)
    .populate("specialization", "name")
    .populate("hospital", "name")
    .lean();

  if (!doctor) {
    return Response.json({ error: "Doctor not found" }, { status: 404 });
  }

  return Response.json(doctor);
}

export async function PUT(req: NextRequest, ctx: RouteContext) {
  const session = await requireAuth();
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectDB();
  const { id } = await ctx.params;

  const body = await req.json();
  const parsed = updateDoctorSchema.safeParse(body);

  if (!parsed.success) {
    return Response.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const doctor = await Doctor.findByIdAndUpdate(id, parsed.data, { new: true })
    .populate("specialization", "name")
    .populate("hospital", "name")
    .lean();

  if (!doctor) {
    return Response.json({ error: "Doctor not found" }, { status: 404 });
  }

  return Response.json(doctor);
}

export async function DELETE(_req: NextRequest, ctx: RouteContext) {
  const session = await requireAuth();
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectDB();
  const { id } = await ctx.params;

  const doctor = await Doctor.findByIdAndUpdate(
    id,
    { isDeleted: true, deletedAt: new Date() },
    { new: true }
  );

  if (!doctor) {
    return Response.json({ error: "Doctor not found" }, { status: 404 });
  }

  return Response.json({ message: "Doctor deleted" });
}
