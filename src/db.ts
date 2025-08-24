import mongoose from "mongoose";

export async function connectDB() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error("MONGODB_URI not set in env");
    process.exit(1);
  }

  try {
    await mongoose.connect(uri, {
      // options if needed
    });
    console.log("MongoDB connected");
  } catch (err) {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  }
}

JWT_ACCESS_SECRET=IRJLS70809Id
JWT_REFRESH_SECRET=KRIRJSL7898JK
ACCESS_TOKEN_EXPIRES_MINUTES=15
REFRESH_TOKEN_EXPIRES_DAYS=30
COOKIE_NAME=refresh_token
NODE_ENV=development
