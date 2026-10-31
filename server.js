import "dotenv/config";
import express from "express";
import cors from "cors";
import morgan from "morgan";
import authRouter from "./routes/auth.js";
import taskRouter from "./routes/tasks.js";
import userRouter from "./routes/users.js";
import errorHandler from "./middleware/errorHandler.js";

const app = express();
const allowedOrigins = process.env.CORS_ORIGIN
  ?.split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);
const PORT = process.env.PORT || 3000;

// Prevent server startup if JWT_SECRET is missing or too short
if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
  console.error("JWT_SECRET in .env must be at least 32 characters.");
  process.exit(1);
}

app.use(cors(allowedOrigins?.length ? { origin: allowedOrigins } : {}));
app.use(morgan("dev"));
app.use(express.json());

// Mount routers
app.use("/api/auth", authRouter);
app.use("/api/tasks", taskRouter);
app.use("/api", userRouter);

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Task Manager API running on port ${PORT}`);
});