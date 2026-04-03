import { NextRequest } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { requireAuth } from "@/lib/auth-helpers";
import { Specialization } from "@/models/Specialization";
import { createSpecializationSchema } from "@/lib/validations";

type RouteContext = { params: Promise<{ id: string }> };

export async function PUT(req: NextRequest, ctx: RouteContext) {
  const session = await requireAuth();
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectDB();
  const { id } = await ctx.params;

  const body = await req.json();
  const parsed = createSpecializationSchema.safeParse(body);

  if (!parsed.success) {
    return Response.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const specialization = await Specialization.findByIdAndUpdate(
    id,
    parsed.data,
    { new: true }
  ).lean();

  if (!specialization) {
    return Response.json(
      { error: "Specialization not found" },
      { status: 404 }
    );
  }

  return Response.json(specialization);
}

export async function DELETE(_req: NextRequest, ctx: RouteContext) {
  const session = await requireAuth();
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectDB();
  const { id } = await ctx.params;

  const specialization = await Specialization.findByIdAndUpdate(
    id,
    { isDeleted: true, deletedAt: new Date() },
    { new: true }
  );

  if (!specialization) {
    return Response.json(
      { error: "Specialization not found" },
      { status: 404 }
    );
  }

  return Response.json({ message: "Specialization deleted" });
}
