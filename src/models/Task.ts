import mongoose, { Schema, Document } from "mongoose";

export type Status = "pending" | "in-progress" | "completed" | "skipped";

export interface ITask extends Document {
  userId: mongoose.Types.ObjectId;
  title: string;
  description?: string;
  date: string; // YYYY-MM-DD in user's timezone
  timeWindow?: { start?: string; end?: string };
  status: Status;
  tags: string[];
  priority: "low" | "medium" | "high";
  estimatedMinutes?: number;
  createdAt: Date;
  updatedAt: Date;
}

const TaskSchema = new Schema<ITask>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    title: { type: String, required: true },
    description: { type: String },
    date: { type: String, required: true, index: true },
    timeWindow: { start: String, end: String },
    status: { type: String, enum: ["pending", "in-progress", "completed", "skipped"], default: "pending" },
    tags: [String],
    priority: { type: String, enum: ["low", "medium", "high"], default: "medium" },
    estimatedMinutes: { type: Number }
  },
  { timestamps: true }
);

TaskSchema.index({ userId: 1, date: 1, status: 1 });

export default mongoose.model<ITask>("Task", TaskSchema);