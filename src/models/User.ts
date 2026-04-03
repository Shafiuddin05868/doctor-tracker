import mongoose, { Schema, type Document } from "mongoose";

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  isDeleted: boolean;
  deletedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

// Auto-exclude soft-deleted users from all find queries
UserSchema.pre("find", function () {
  this.where({ isDeleted: false });
});
UserSchema.pre("findOne", function () {
  this.where({ isDeleted: false });
});
UserSchema.pre("countDocuments", function () {
  this.where({ isDeleted: false });
});

export const User =
  mongoose.models.User ?? mongoose.model<IUser>("User", UserSchema);
