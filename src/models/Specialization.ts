import mongoose, { Schema, type Document } from "mongoose";

export interface ISpecialization extends Document {
  name: string;
  isDeleted: boolean;
  deletedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const SpecializationSchema = new Schema<ISpecialization>(
  {
    name: { type: String, required: true, unique: true },
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

SpecializationSchema.index({ isDeleted: 1 });

SpecializationSchema.pre("find", function () {
  this.where({ isDeleted: false });
});
SpecializationSchema.pre("findOne", function () {
  this.where({ isDeleted: false });
});
SpecializationSchema.pre("countDocuments", function () {
  this.where({ isDeleted: false });
});

export const Specialization =
  mongoose.models.Specialization ??
  mongoose.model<ISpecialization>("Specialization", SpecializationSchema);
