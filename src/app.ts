import express from "express";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import cors from "cors";
import morgan from "morgan";

import authRoutes from "./routes/auth";
import tasksRoutes from "./routes/tasks";
import { errorHandler } from "./middleware/errorHandler";
import { rateLimiter } from "./middleware/rateLimiter";

const app = express();
app.use(helmet());
app.use(express.json());
app.use(cookieParser());
app.use(cors({ origin: true, credentials: true }));
app.use(morgan("dev"));
app.use(rateLimiter);

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/tasks", tasksRoutes);

app.get("/", (req, res) => res.json({ status: "ok", data: "learning-tracker api" }));

app.use(errorHandler);

export default app;
