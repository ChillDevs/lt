import mongoose from "mongoose";
import request from "supertest";
import app from "../src/app";
import User from "../src/models/User";
import Task from "../src/models/Task";
import { signAccessToken } from "../src/utils/jwt";

let accessToken: string;

beforeAll(async () => {
  // Create a user and token for task tests
  const user = await User.create({
    email: "tasks@example.com",
    password: "hashedpass",
  });
  accessToken = signAccessToken(user._id.toString(), ["user"]);
});

beforeEach(async () => {
  // Clear collections between tests
  const collections = await mongoose.connection.db.collections();
  for (const collection of collections) {
    await collection.deleteMany({});
  }
});

describe("Tasks API", () => {
  it("should create a task", async () => {
    const res = await request(app)
      .post("/api/tasks")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({
        title: "Test Task",
        description: "This is a test",
      })
      .expect(201);

    expect(res.body).toHaveProperty("_id");
    expect(res.body.title).toBe("Test Task");

    const task = await Task.findOne({ title: "Test Task" });
    expect(task).toBeTruthy();
  });

  it("should fetch tasks", async () => {
    await Task.create({ title: "Sample Task", description: "Sample", userId: "123" });

    const res = await request(app)
      .get("/api/tasks")
      .set("Authorization", `Bearer ${accessToken}`)
      .expect(200);

    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
  });
});
