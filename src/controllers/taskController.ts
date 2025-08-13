import { Request, Response } from "express";
import TaskModel from "../models/Task";
import ProgressModel from "../models/Progress";
import IdempotencyModel from "../models/Idempotency";
import { createTaskSchema, updateTaskSchema } from "../validators/task";
import { Types } from "mongoose";

async function recalcProgress(userId: Types.ObjectId, date: string) {
  const total = await TaskModel.countDocuments({ userId, date });
  const completed = await TaskModel.countDocuments({ userId, date, status: "completed" });
  await ProgressModel.updateOne({ userId, date }, { $set: { totalTasks: total, completedTasks: completed } }, { upsert: true });
}

export async function getTasks(req: Request, res: Response) {
  const user = req.user!;
  const date = (req.query.date as string) || undefined;
  if (!date) return res.status(400).json({ status: "error", error: { code: "MISSING_DATE", message: "Provide date=YYYY-MM-DD" } });

  const tasks = await TaskModel.find({ userId: user.id, date }).sort({ createdAt: 1 });
  return res.json({ status: "ok", data: { tasks } });
}

export async function createTask(req: Request, res: Response) {
  const user = req.user!;
  const parsed = createTaskSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ status: "error", error: { code: "INVALID_INPUT", message: parsed.error.message } });

  const idempotencyKey = req.headers["idempotency-key"] as string | undefined;
  if (idempotencyKey) {
    const existing = await IdempotencyModel.findOne({ key: idempotencyKey, userId: user.id });
    if (existing) return res.json({ status: "ok", data: existing.response });
  }

  const payload = { ...parsed.data, userId: user.id };
  const task = await TaskModel.create(payload as any);
  await recalcProgress(task.userId as any, task.date);

  const response = { task };
  if (idempotencyKey) {
    await IdempotencyModel.create({ key: idempotencyKey, userId: user.id, response });
  }

  return res.status(201).json({ status: "ok", data: response });
}

export async function updateTask(req: Request, res: Response) {
  const user = req.user!;
  const id = req.params.id;
  const parsed = updateTaskSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ status: "error", error: { code: "INVALID_INPUT", message: parsed.error.message } });

  const update = parsed.data;
  const clientVersion = (update as any).version;
  delete (update as any).version;

  // optimistic concurrency using __v
  const query: any = { _id: id, userId: user.id };
  if (typeof clientVersion === "number") query.__v = clientVersion;

  const updated = await TaskModel.findOneAndUpdate(query, { $set: update, $inc: { __v: 1 } }, { new: true });

  if (!updated) {
    // fetch current to return helpful conflict info
    const current = await TaskModel.findOne({ _id: id, userId: user.id });
    return res.status(409).json({ status: "error", error: { code: "TASK_VERSION_MISMATCH", message: "Version conflict", meta: { current } } });
  }

  await recalcProgress(updated.userId as any, updated.date);
  return res.json({ status: "ok", data: { task: updated } });
}

export async function deleteTask(req: Request, res: Response) {
  const user = req.user!;
  const id = req.params.id;
  const t = await TaskModel.findOne({ _id: id, userId: user.id });
  if (!t) return res.status(404).json({ status: "error", error: { code: "TASK_NOT_FOUND", message: "Task not found" } });

  // soft delete by removing the doc or adding deletedAt — here we simply delete
  await t.deleteOne();
  await recalcProgress(t.userId as any, t.date);
  return res.json({ status: "ok", data: null });
}
