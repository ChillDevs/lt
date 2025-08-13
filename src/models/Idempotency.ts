import mongoose, { Schema, Document } from "mongoose";

export interface IIdempotency extends Document {
  key: string;
  userId: mongoose.Types.ObjectId;
  response?: any;
  createdAt: Date;
}

const IdempotencySchema = new Schema<IIdempotency>(
  {
    key: { type: String, required: true, unique: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    response: { type: Schema.Types.Mixed }
  },
  { timestamps: true }
);

export default mongoose.model<IIdempotency>("Idempotency", IdempotencySchema);