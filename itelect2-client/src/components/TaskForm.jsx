import { useState } from "react";

const EMPTY_TASK = { title: "", dueDate: "", completed: false };

function getTaskValues(task) {
  if (!task) return EMPTY_TASK;
  return {
    title: task.title || "",
    dueDate: task.dueDate ? task.dueDate.slice(0, 10) : "",
    completed: Boolean(task.completed),
  };
}

function TaskForm({ task, onSubmit, onCancel, saving }) {
  const [values, setValues] = useState(() => getTaskValues(task));
  const isEditing = Boolean(task);

  function handleSubmit(event) {
    event.preventDefault();
    onSubmit({ ...values, dueDate: values.dueDate || null });
  }

  return (
    <section className="form-card">
      <div className="section-heading">
        <p className="eyebrow">{isEditing ? "MAKE A CHANGE" : "TAKE THE NEXT STEP"}</p>
        <h2>{isEditing ? "Edit task" : "Add a task"}</h2>
        <p className="muted">
          {isEditing ? "Adjust the details and keep moving." : "Capture it now. You can refine it later."}
        </p>
      </div>
      <form className="stack-form" onSubmit={handleSubmit}>
        <label>
          Task
          <input
            autoFocus={isEditing}
            maxLength={255}
            onChange={(event) => setValues({ ...values, title: event.target.value })}
            placeholder="What needs your attention?"
            required
            value={values.title}
          />
        </label>
        <label>
          Due date <span className="optional">(optional)</span>
          <input
            onChange={(event) => setValues({ ...values, dueDate: event.target.value })}
            type="date"
            value={values.dueDate}
          />
        </label>
        {isEditing && (
          <label className="checkbox-row">
            <input
              checked={values.completed}
              onChange={(event) => setValues({ ...values, completed: event.target.checked })}
              type="checkbox"
            />
            Mark as complete
          </label>
        )}
        <div className="form-actions">
          <button className="button button-primary" disabled={saving} type="submit">
            {saving ? "Saving…" : isEditing ? "Save changes" : "Add task"}
          </button>
          {isEditing && (
            <button className="button button-quiet" onClick={onCancel} type="button">
              Cancel
            </button>
          )}
        </div>
      </form>
    </section>
  );
}

export default TaskForm;
