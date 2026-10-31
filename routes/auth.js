import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import db from "../models/index.cjs";

const { User } = db;
const router = express.Router();
const SALT_ROUNDS = 10;

// POST /api/auth/register
router.post("/register", async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    if (!password || password.length < 8) {
      return res.status(400).json({ error: "password must be at least 8 characters" });
    }

    const taken = await User.findOne({ where: { email } });
    if (taken) {
      return res.status(409).json({ error: "That email is already registered" });
    }

    const hash = await bcrypt.hash(password, SALT_ROUNDS);

    const user = await User.create({ name, email, password: hash });

    res.status(201).json(user);
  } catch (error) {
    next(error);
  }
});

// POST /api/auth/login
router.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "email and password are required" });
    }

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({ token, user });
  } catch (error) {
    next(error);
  }
});

export default router;