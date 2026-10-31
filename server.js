import express from "express";
import cors from "cors";
import morgan from "morgan";
import router from "./routes/index.js";
import authRouter from "./routes/auth.js";
import db from "./models/index.cjs";

const { Task, User } = db;
const app = express();
const PORT = process.env.PORT || 3000;

// Prevent server startup if JWT_SECRET is missing or too short
if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
  console.error("JWT_SECRET in .env must be at least 32 characters.");
  process.exit(1);
}

app.use(cors());
app.use(morgan("dev"));
app.use(express.json());

// Mount authentication routes
app.use("/api/auth", authRouter);
app.use("/api", router);

// Error handling middleware
app.use((err, req, res, next) => {
  if (err.name === "SequelizeValidationError") {
    return res.status(400).json({ error: err.errors.map((e) => e.message) });
  }
  if (err.name === "SequelizeUniqueConstraintError") {
    return res.status(409).json({ error: "That email is already registered" });
  }
  if (err.status && err.status < 500) {
    return res.status(err.status).json({ error: err.message });
  }
  console.error(err.message);
  res.status(500).json({ error: "Something went wrong on the server" });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});