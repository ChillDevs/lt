// tests/jestGlobalSetup.ts
import { MongoMemoryServer } from "mongodb-memory-server";

export default async function globalSetup() {
  const mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();

  // Save the URI globally so tests can use it
  (global as any).__MONGO_URI__ = uri;
  (global as any).__MONGO_SERVER__ = mongoServer;
}
