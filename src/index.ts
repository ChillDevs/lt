import dotenv from "dotenv";
dotenv.config();

import { connectDB } from "./db";
import app from "./app";

const PORT = process.env.PORT || 4000;

(async () => {
  try {
    await connectDB();
    app.listen(Number(PORT), () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("Failed to start:", err);
    process.exit(1);
  }
})();
