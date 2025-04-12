/** @format */

import mongoose, { Document, ObjectId, Schema } from "mongoose";
import bcrypt from "bcryptjs";

export interface IUser extends Document {
  _id: ObjectId;
  createdAt: Date;
  updatedAt: Date;
  name: string;
  email: string;
  phoneNumber: string;
  password: string;
  profileImage?: string;
  isVerified: boolean;
  isProfileComplete: boolean;
  verificationCode?: string;
  codeExpiry?: Date;
  role: string;
  pointMember: number;
  /* isLocationSet: boolean;
  location?: {
    coordinates: {
      lat: { type: Number };
      lng: { type: Number };
    };
    address: string;
  }; */
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phoneNumber: { type: String, required: true },
    password: { type: String, required: true },
    profileImage: { type: String },
    isVerified: { type: Boolean, required: true, default: false },
    isProfileComplete: { type: Boolean, required: true, default: false },
    verificationCode: { type: String },
    codeExpiry: { type: Date },
    role: { type: String, enum: ["user", "admin"], default: "user" },
    pointMember: { type: Number, default: 0 },
    /* isLocationSet: { type: Boolean, required: true, default: false },
    location: {
      coordinates: {
        lat: Number,
        lng: Number,
      },
      address: String,
    }, */
  },
  { timestamps: true }
);

// Hash password before saving
UserSchema.pre<IUser>("save", async function (next) {
  if (!this.isModified("password")) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error: any) {
    next(error);
  }
});

// Method to compare passwords
UserSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.model<IUser>("User", UserSchema);
