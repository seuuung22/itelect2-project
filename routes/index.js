import express from 'express';
import { fetchSampleUsers } from '../src/api.js'; 
import { validateTask, mergeTaskUpdate } from '../src/utils.js';

const tasks = [
  { id: 1, title: 'Learn Node.js', dueDate: '2026-08-01' },
  { id: 2, title: 'Build Express API', dueDate: '2026-08-05' }
];

let nextTaskId = tasks.length ? Math.max(...tasks.map((t) => t.id)) + 1 : 1;

const router = express.Router();

let cachedUsers = [];

(async () => {
  try {
    cachedUsers = await fetchSampleUsers();
    console.log('Sample users cached successfully.');
  } catch (error) {
    console.error('Failed to cache sample users:', error);
  }
})();

router.get('/tasks', (req, res) => {
  res.json(tasks);
});

router.get('/tasks/:id', (req, res, next) => {
  const rawId = req.params.id;

  if (!/^\d+$/.test(rawId)) {
    const err = new Error('Invalid task ID format');
    err.status = 400;
    return next(err);
  }

  const taskId = Number(rawId);
  const task = tasks.find((t) => t.id === taskId);

  if (task) {
    return res.json(task);
  }

  const err = new Error(`Task with id ${taskId} not found`);
  err.status = 404;
  return next(err);
});

router.get('/users', (req, res) => {
  res.json(cachedUsers);
});

router.post('/tasks', (req, res, next) => {
  if (!validateTask(req.body)) {
    const err = new Error('title and dueDate are required');
    err.status = 400;
    return next(err);
  }

  const newTask = {
    id: nextTaskId++,
    ...req.body
  };

  tasks.push(newTask);
  return res.status(201).json(newTask);
});


router.put('/tasks/:id', (req, res, next) => {
  const rawId = req.params.id;

  if (!/^\d+$/.test(rawId)) {
    const err = new Error('Invalid task ID format');
    err.status = 400;
    return next(err);
  }

  const taskId = Number(rawId);
  const index = tasks.findIndex((t) => t.id === taskId);

  if (index === -1) {
    const err = new Error('Task not found');
    err.status = 404;
    return next(err);
  }

  tasks[index] = mergeTaskUpdate(tasks[index], req.body);
  return res.status(200).json(tasks[index]);
});

router.delete('/tasks/:id', (req, res, next) => {
  const rawId = req.params.id;

  if (!/^\d+$/.test(rawId)) {
    const err = new Error('Invalid task ID format');
    err.status = 400;
    return next(err);
  }

  const taskId = Number(rawId);
  const index = tasks.findIndex((t) => t.id === taskId);

  if (index === -1) {
    const err = new Error('Task not found');
    err.status = 404;
    return next(err);
  }

  const [removed] = tasks.splice(index, 1);
  return res.status(200).json({ message: 'Deleted', task: removed }); 
});

export default router;