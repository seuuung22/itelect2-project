console.log('Server starting...');

import {formatDate, validateTask, mergeTaskUpdate} from './utils.js';

console.log("Testing ES6 Utility Functions");
console.log(formatDate(new Date("2026-07-22")));

console.log(validateTask({title: "Write Title", dueDate:"" }));
console.log(mergeTaskUpdate({title:"Old"}, {title:"New"}));