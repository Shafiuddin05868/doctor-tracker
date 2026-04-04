import mongoose, { Schema, type Document, type Types } from "mongoose";

export interface IPatient extends Document {
  name: string;
  age: number;
  gender: "male" | "female" | "other";
  condition: string;
  phone: string;
  email: string;
  doctor: Types.ObjectId;
  isDeleted: boolean;
  deletedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const PatientSchema = new Schema<IPatient>(
  {
    name: { type: String, required: true },
    age: { type: Number, required: true },
    gender: { type: String, required: true, enum: ["male", "female", "other"] },
    condition: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String, default: "" },
    doctor: { type: Schema.Types.ObjectId, ref: "Doctor", required: true },
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

// Indexes for optimized search, filter, and pagination
PatientSchema.index({ name: "text", condition: "text" });
PatientSchema.index({ doctor: 1 });
PatientSchema.index({ condition: 1 });
PatientSchema.index({ createdAt: -1 });
PatientSchema.index({ isDeleted: 1 });

// Auto-exclude soft-deleted patients from all find queries
PatientSchema.pre("find", function () {
  this.where({ isDeleted: false });
});
PatientSchema.pre("findOne", function () {
  this.where({ isDeleted: false });
});
PatientSchema.pre("countDocuments", function () {
  this.where({ isDeleted: false });
});

export const Patient =
  mongoose.models.Patient ?? mongoose.model<IPatient>("Patient", PatientSchema);
