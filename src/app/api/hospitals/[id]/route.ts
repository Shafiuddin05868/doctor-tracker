import { NextRequest } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { requireAuth } from "@/lib/auth-helpers";
import { Hospital } from "@/models/Hospital";
import { updateHospitalSchema } from "@/lib/validations";

type RouteContext = { params: Promise<{ id: string }> };

export async function PUT(req: NextRequest, ctx: RouteContext) {
  const session = await requireAuth();
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectDB();
  const { id } = await ctx.params;

  const body = await req.json();
  const parsed = updateHospitalSchema.safeParse(body);

  if (!parsed.success) {
    return Response.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const hospital = await Hospital.findByIdAndUpdate(id, parsed.data, {
    new: true,
  }).lean();

  if (!hospital) {
    return Response.json({ error: "Hospital not found" }, { status: 404 });
  }

  return Response.json(hospital);
}

export async function DELETE(_req: NextRequest, ctx: RouteContext) {
  const session = await requireAuth();
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectDB();
  const { id } = await ctx.params;

  const hospital = await Hospital.findByIdAndUpdate(
    id,
    { isDeleted: true, deletedAt: new Date() },
    { new: true }
  );

  if (!hospital) {
    return Response.json({ error: "Hospital not found" }, { status: 404 });
  }

  return Response.json({ message: "Hospital deleted" });
}
