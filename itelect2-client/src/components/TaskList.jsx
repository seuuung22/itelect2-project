function formatDueDate(value) {
  if (!value) return "No due date";
  const date = new Date(`${value.slice(0, 10)}T00:00:00`);
  return new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric", year: "numeric" }).format(date);
}

function TaskList({ tasks, isAuthenticated, isAdmin, onEdit, onDelete }) {
  if (tasks.length === 0) {
    return (
      <div className="empty-state">
        <span aria-hidden="true" className="empty-icon">✳</span>
        <h3>A fresh start.</h3>
        <p>Your task list is clear. Sign in to add your first task.</p>
      </div>
    );
  }

  return (
    <ul className="task-list">
      {tasks.map((task) => (
        <li className={`task-item${task.completed ? " task-complete" : ""}`} key={task.id}>
          <span aria-hidden="true" className="task-check">{task.completed ? "✓" : ""}</span>
          <div className="task-details">
            <h3>{task.title || "Untitled task"}</h3>
            <div className="task-meta">
              <span>{formatDueDate(task.dueDate)}</span>
              {task.User?.name && <span>· {task.User.name}</span>}
            </div>
          </div>
          <span className={`status-pill${task.completed ? " status-done" : ""}`}>
            {task.completed ? "Done" : "In progress"}
          </span>
          {(isAuthenticated || isAdmin) && (
            <div className="task-actions">
              {isAuthenticated && (
                <button aria-label={`Edit ${task.title || "task"}`} className="icon-button" onClick={() => onEdit(task)} type="button">
                  Edit
                </button>
              )}
            {isAdmin && (
              <button
                aria-label={`Delete ${task.title || "task"}`}
                className="icon-button icon-danger"
                onClick={() => onDelete(task)}
                type="button"
              >
                Delete
              </button>
            )}
            </div>
          )}
        </li>
      ))}
    </ul>
  );
}

export default TaskList;
