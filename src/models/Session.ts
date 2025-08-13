import mongoose, { Schema, Document } from "mongoose";
import crypto from "crypto";

export interface ISession extends Document {
  userId: mongoose.Types.ObjectId;
  refreshTokenHash: string;
  userAgent?: string;
  ip?: string;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const SessionSchema = new Schema<ISession>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    refreshTokenHash: { type: String, required: true, index: true },
    userAgent: { type: String },
    ip: { type: String },
    expiresAt: { type: Date, required: true, index: true }
  },
  { timestamps: true }
);

// TTL index on expiresAt: Mongo will remove docs once expiresAt < now
SessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.model<ISession>("Session", SessionSchema);

// helper to hash tokens
export function hashToken(token: string) {
  return crypto.createHash("sha256").update(token).digest("hex");
}
