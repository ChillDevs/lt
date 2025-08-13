import mongoose, { Schema, Document } from "mongoose";

export interface IProgress extends Document {
  userId: mongoose.Types.ObjectId;
  date: string; // YYYY-MM-DD
  totalTasks: number;
  completedTasks: number;
  updatedAt: Date;
}

const ProgressSchema = new Schema<IProgress>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    date: { type: String, required: true },
    totalTasks: { type: Number, default: 0 },
    completedTasks: { type: Number, default: 0 }
  },
  { timestamps: { createdAt: false, updatedAt: true } }
);

ProgressSchema.index({ userId: 1, date: 1 }, { unique: true });

export default mongoose.model<IProgress>("Progress", ProgressSchema);