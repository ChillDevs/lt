import mongoose from "mongoose";
import request from "supertest";
import app from "../src/app"; // Adjust if your express app path is different
import User from "../src/models/User";

beforeEach(async () => {
  // Clear collections between tests
  const collections = await mongoose.connection.db.collections();
  for (const collection of collections) {
    await collection.deleteMany({});
  }
});

describe("Auth API", () => {
  it("should register a user", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({
        email: "test@example.com",
        password: "password123",
      })
      .expect(201);

    expect(res.body).toHaveProperty("accessToken");
    expect(res.body).toHaveProperty("refreshToken");

    const user = await User.findOne({ email: "test@example.com" });
    expect(user).toBeTruthy();
  });

  it("should not register user with existing email", async () => {
    await User.create({ email: "test@example.com", password: "hashedpass" });

    const res = await request(app)
      .post("/api/auth/register")
      .send({
        email: "test@example.com",
        password: "password123",
      })
      .expect(400);

    expect(res.body.error).toMatch(/email.*exists/i);
  });
});
