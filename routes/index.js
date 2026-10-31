import express from 'express';
import db from '../models/index.cjs';
import verifyToken from '../middleware/verifyToken.js';
import requireRole from '../middleware/requireRole.js';

const { Task, User } = db;
const router = express.Router();

router.get('/tasks', async (req, res, next) => {
  try {
    const tasks = await Task.findAll({ include: User, order: [['id', 'ASC']] });
    res.json(tasks);
  } catch (error) {
    next(error);
  }
});

router.get('/tasks/:id', async (req, res, next) => {
  try {
    const rawId = req.params.id;

    if (!/^\d+$/.test(rawId)) {
      const err = new Error('Invalid task ID format');
      err.status = 400;
      return next(err);
    }

    const task = await Task.findByPk(rawId, { include: User });

    if (task) {
      return res.json(task);
    }

    const err = new Error(`Task with id ${rawId} not found`);
    err.status = 404;
    return next(err);
  } catch (error) {
    next(error);
  }
});

router.get('/users', async (req, res, next) => {
  try {
    const users = await User.findAll({ order: [['id', 'ASC']] });
    res.json(users);
  } catch (error) {
    next(error);
  }
});

router.post('/tasks', verifyToken, async (req, res, next) => {
  try {
    const task = await Task.create(req.body);
    res.status(201).json(task);
  } catch (error) {
    next(error);
  }
});

router.put('/tasks/:id', verifyToken, async (req, res, next) => {
  try {
    const rawId = req.params.id;

    if (!/^\d+$/.test(rawId)) {
      const err = new Error('Invalid task ID format');
      err.status = 400;
      return next(err);
    }

    const task = await Task.findByPk(rawId);

    if (!task) {
      const err = new Error('Task not found');
      err.status = 404;
      return next(err);
    }

    await task.update(req.body);
    res.status(200).json(task);
  } catch (error) {
    next(error);
  }
});

router.delete('/tasks/:id', verifyToken, requireRole('admin'), async (req, res, next) => {
  try {
    const rawId = req.params.id;

    if (!/^\d+$/.test(rawId)) {
      const err = new Error('Invalid task ID format');
      err.status = 400;
      return next(err);
    }

    const task = await Task.findByPk(rawId);

    if (!task) {
      const err = new Error('Task not found');
      err.status = 404;
      return next(err);
    }

    await task.destroy();
    res.status(200).json({ message: 'Deleted', task });
  } catch (error) {
    next(error);
  }
});

export default router;