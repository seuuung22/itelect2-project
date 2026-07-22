//GT 3
export const formatDate = (date) =>  `Due: ${new Date(date).toLocaleDateString('en-PH')}`;
export const validateTask = ({title, dueDate} = {}) => !! [title, dueDate].every(Boolean);

export const mergeTaskUpdate = (original, ...updates) => Object.assign({}, original, ...updates);

export class TaskValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = "TaskValidationError";
  }
}
//GT 4
export function createTask(taskData) {
  if (!validateTask(taskData)) {
    throw new TaskValidationError("Invalid task data");
  }
  return { id: Date.now(), completed: false, ...taskData };
}