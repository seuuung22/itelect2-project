import express from "express";
import { listUsers } from "../controllers/taskController.js";

const router = express.Router();

router.get("/users", listUsers);

export default router;
