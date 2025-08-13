import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  email: string;
  name?: string;
  passwordHash: string;
  roles: string[];
  preferences?: {
    timezone?: string;
    weekStart?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    email: { type: String, required: true, unique: true, index: true },
    name: { type: String },
    passwordHash: { type: String, required: true },
    roles: { type: [String], default: ["user"] },
    preferences: { type: Object, default: {} }
  },
  { timestamps: true }
);

export default mongoose.model<IUser>("User", UserSchema);
