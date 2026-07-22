//GT 3
console.log('Server starting...');

import {formatDate, validateTask, mergeTaskUpdate} from './utils.js';

console.log("Testing ES6 Utility Functions");
console.log(formatDate(new Date("2026-07-22")));

console.log(validateTask({title: "Write Title", dueDate:"" }));
console.log(mergeTaskUpdate({title:"Old"}, {title:"New"}));

//GT 4
import { fetchSampleUsers } from "./api.js";
import { createTask, TaskValidationError } from "./utils.js";

async function main() {
  try {
    const users = await fetchSampleUsers();
    console.log("Users:", users);

    const task = createTask({ title: "Sample task", priority: "high" });
    console.log("Task:", task);
  } catch (err) {
    if (err instanceof TaskValidationError) {
      console.error("Validation error:", err.message);
    } else {
      console.error("Unexpected error:", err.message);
    }
  }
}

main();