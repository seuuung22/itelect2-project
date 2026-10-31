import db from "../models/index.cjs";

const { Task, User } = db;
const TASK_FIELDS = ["title", "dueDate", "completed"];

function validateTaskId(id) {
  if (!/^\d+$/.test(id)) {
    const error = new Error("Invalid task ID format");
    error.status = 400;
    throw error;
  }
}

export async function listTasks(req, res, next) {
  try {
    const tasks = await Task.findAll({
      include: [{ model: User, attributes: { exclude: ["password"] } }],
      order: [["id", "ASC"]],
    });
    res.json(tasks);
  } catch (err) {
    next(err);
  }
}

export async function getTask(req, res, next) {
  try {
    validateTaskId(req.params.id);
    const task = await Task.findByPk(req.params.id, {
      include: [{ model: User, attributes: { exclude: ["password"] } }],
    });
    if (!task) {
      return res.status(404).json({ error: "Task not found" });
    }
    res.json(task);
  } catch (err) {
    next(err);
  }
}

export async function createTask(req, res, next) {
  try {
    const task = await Task.create(req.body, { fields: TASK_FIELDS });
    res.status(201).json(task);
  } catch (err) {
    next(err);
  }
}

export async function updateTask(req, res, next) {
  try {
    validateTaskId(req.params.id);
    const task = await Task.findByPk(req.params.id);
    if (!task) {
      return res.status(404).json({ error: "Task not found" });
    }
    await task.update(req.body, { fields: TASK_FIELDS });
    res.json(task);
  } catch (err) {
    next(err);
  }
}

export async function deleteTask(req, res, next) {
  try {
    validateTaskId(req.params.id);
    const task = await Task.findByPk(req.params.id);
    if (!task) {
      return res.status(404).json({ error: "Task not found" });
    }
    await task.destroy();
    res.json({ message: "Deleted", task, deletedBy: req.user.email });
  } catch (err) {
    next(err);
  }
}

export async function listUsers(req, res, next) {
  try {
    const users = await User.findAll({ order: [["id", "ASC"]] });
    res.json(users);
  } catch (err) {
    next(err);
  }
}
