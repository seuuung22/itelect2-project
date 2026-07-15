export const formatDate = (date) =>  `Due: ${new Date(date).toLocaleDateString('en-PH')}`;
export const validateTask = ({title, dueDate} = {}) => !! [title, dueDate].every(Boolean);

export const mergeTaskUpdate = (original, ...updates) => Object.assign({}, original, ...updates);