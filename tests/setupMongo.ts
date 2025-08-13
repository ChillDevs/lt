// tests/setupMongo.ts
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";

let mongod: MongoMemoryServer;

export default async function globalSetup() {
  // Start MongoDB before all tests
  mongod = await MongoMemoryServer.create({
    binary: { version: "7.0.3" }, // specify version to avoid random downloads
  });

  const uri = mongod.getUri();

  // Store the URI globally so tests can access it
  global.__MONGO_URI__ = uri;

  // Connect once for all tests
  await mongoose.connect(uri);
}

export async function globalTeardown() {
  // Disconnect and stop server
  await mongoose.disconnect();
  if (mongod) {
    await mongod.stop();
  }
}
