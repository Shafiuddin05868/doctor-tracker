import mongoose, { Schema, type Document, type Types } from "mongoose";

export interface IDoctor extends Document {
  name: string;
  specialization: Types.ObjectId;
  hospital: Types.ObjectId;
  phone: string;
  email: string;
  isDeleted: boolean;
  deletedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const DoctorSchema = new Schema<IDoctor>(
  {
    name: { type: String, required: true },
    specialization: {
      type: Schema.Types.ObjectId,
      ref: "Specialization",
      required: true,
    },
    hospital: {
      type: Schema.Types.ObjectId,
      ref: "Hospital",
      required: true,
    },
    phone: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

// Indexes for optimized search, filter, and pagination
DoctorSchema.index({ name: "text" });
DoctorSchema.index({ specialization: 1 });
DoctorSchema.index({ hospital: 1 });
DoctorSchema.index({ createdAt: -1 });
DoctorSchema.index({ isDeleted: 1 });

// Auto-exclude soft-deleted doctors from all find queries
DoctorSchema.pre("find", function () {
  this.where({ isDeleted: false });
});
DoctorSchema.pre("findOne", function () {
  this.where({ isDeleted: false });
});
DoctorSchema.pre("countDocuments", function () {
  this.where({ isDeleted: false });
});

export const Doctor =
  mongoose.models.Doctor ?? mongoose.model<IDoctor>("Doctor", DoctorSchema);
