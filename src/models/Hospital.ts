import mongoose, { Schema, type Document } from "mongoose";

export interface IHospital extends Document {
  name: string;
  address: string;
  city: string;
  phone: string;
  isDeleted: boolean;
  deletedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const HospitalSchema = new Schema<IHospital>(
  {
    name: { type: String, required: true, unique: true },
    address: { type: String, default: "" },
    city: { type: String, default: "" },
    phone: { type: String, default: "" },
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

HospitalSchema.index({ isDeleted: 1 });
HospitalSchema.index({ city: 1 });

HospitalSchema.pre("find", function () {
  this.where({ isDeleted: false });
});
HospitalSchema.pre("findOne", function () {
  this.where({ isDeleted: false });
});
HospitalSchema.pre("countDocuments", function () {
  this.where({ isDeleted: false });
});

export const Hospital =
  mongoose.models.Hospital ??
  mongoose.model<IHospital>("Hospital", HospitalSchema);
