import { useEffect, useState } from "react";
import TaskForm from "./components/TaskForm.jsx";
import TaskList from "./components/TaskList.jsx";
import { apiRequest } from "./lib/api.js";
import "./App.css";

const API_URL = import.meta.env.VITE_API_URL || "https://taskmanager-api.onrender.com";
const SESSION_KEY = "taskmanager-session";

function readSession() {
  try {
    return JSON.parse(localStorage.getItem(SESSION_KEY)) || null;
  } catch {
    return null;
  }
}

function AuthForm({ mode, onModeChange, onAuthenticated, onMessage, onError }) {
  const isRegister = mode === "register";
  const [values, setValues] = useState({ name: "", email: "", password: "" });
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitting(true);
    onError("");
    onMessage("");

    try {
      if (isRegister) {
        await apiRequest(API_URL, "/api/auth/register", {
          method: "POST",
          body: { name: values.name, email: values.email, password: values.password },
        });
        onMessage("Account created. Log in to manage your tasks.");
        onModeChange("login");
      } else {
        const session = await apiRequest(API_URL, "/api/auth/login", {
          method: "POST",
          body: { email: values.email, password: values.password },
        });
        onAuthenticated(session);
      }
    } catch (error) {
      onError(error.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="auth-card">
      <div className="section-heading">
        <p className="eyebrow">{isRegister ? "GET STARTED" : "WELCOME BACK"}</p>
        <h2>{isRegister ? "Create your account" : "Sign in"}</h2>
        <p className="muted">
          {isRegister ? "Keep your work in one calm, focused place." : "Sign in to add and update tasks."}
        </p>
      </div>
      <form className="stack-form" onSubmit={handleSubmit}>
        {isRegister && (
          <label>
            Name
            <input
              autoComplete="name"
              maxLength={100}
              onChange={(event) => setValues({ ...values, name: event.target.value })}
              required
              value={values.name}
            />
          </label>
        )}
        <label>
          Email
          <input
            autoComplete="email"
            onChange={(event) => setValues({ ...values, email: event.target.value })}
            required
            type="email"
            value={values.email}
          />
        </label>
        <label>
          Password
          <input
            autoComplete={isRegister ? "new-password" : "current-password"}
            minLength={isRegister ? 8 : undefined}
            onChange={(event) => setValues({ ...values, password: event.target.value })}
            required
            type="password"
            value={values.password}
          />
        </label>
        <button className="button button-primary" disabled={submitting} type="submit">
          {submitting ? "Please wait…" : isRegister ? "Create account" : "Sign in"}
        </button>
      </form>
      <p className="auth-switch">
        {isRegister ? "Already have an account?" : "New to Taskflow?"}{" "}
        <button
          className="text-button"
          onClick={() => onModeChange(isRegister ? "login" : "register")}
          type="button"
        >
          {isRegister ? "Sign in" : "Create an account"}
        </button>
      </p>
    </section>
  );
}

function App() {
  const [session, setSession] = useState(readSession);
  const [authMode, setAuthMode] = useState("login");
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    apiRequest(API_URL, "/api/tasks", { signal: controller.signal })
      .then(setTasks)
      .catch((requestError) => {
        if (requestError.name !== "AbortError") setError(requestError.message);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, []);

  useEffect(() => {
    if (!session?.token) return undefined;
    const controller = new AbortController();
    apiRequest(API_URL, "/api/auth/me", {
      token: session.token,
      signal: controller.signal,
    })
      .then(({ user }) => setSession((current) => ({ ...current, user })))
      .catch((requestError) => {
        if (requestError.name !== "AbortError") handleLogout();
      });
    return () => controller.abort();
  }, [session?.token]);

  function handleAuthenticated(nextSession) {
    localStorage.setItem(SESSION_KEY, JSON.stringify(nextSession));
    setSession(nextSession);
    setError("");
    setMessage("");
  }

  function handleLogout() {
    localStorage.removeItem(SESSION_KEY);
    setSession(null);
    setEditingTask(null);
  }

  async function handleSaveTask(values) {
    setSaving(true);
    setError("");
    setMessage("");
    const isEditing = Boolean(editingTask);

    try {
      const savedTask = await apiRequest(
        API_URL,
        isEditing ? `/api/tasks/${editingTask.id}` : "/api/tasks",
        {
          method: isEditing ? "PUT" : "POST",
          token: session.token,
          body: values,
        },
      );
      if (isEditing) {
        setTasks((current) =>
          current.map((task) =>
            task.id === savedTask.id ? { ...task, ...savedTask } : task,
          ),
        );
        setMessage("Task updated.");
      } else {
        setTasks((current) => [...current, savedTask].sort((a, b) => a.id - b.id));
        setMessage("Task created.");
      }
      setEditingTask(null);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteTask(task) {
    if (!window.confirm(`Delete “${task.title || "Untitled task"}”?`)) return;
    setError("");
    setMessage("");
    try {
      await apiRequest(API_URL, `/api/tasks/${task.id}`, {
        method: "DELETE",
        token: session.token,
      });
      setTasks((current) => current.filter((item) => item.id !== task.id));
      setMessage("Task deleted.");
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  const completedCount = tasks.filter((task) => task.completed).length;

  return (
    <main className="app-shell">
      <header className="topbar">
        <a aria-label="Taskflow home" className="brand" href="/">
          <span aria-hidden="true" className="brand-mark">T</span>
          <span>taskflow<span className="brand-period">.</span></span>
        </a>
        {session?.user && (
          <div className="account">
            <span className="account-name">{session.user.name || session.user.email}</span>
            <span className="role-pill">{session.user.role || "member"}</span>
            <button className="button button-quiet" onClick={handleLogout} type="button">
              Sign out
            </button>
          </div>
        )}
      </header>

      <section className="hero">
        <div>
          <p className="eyebrow">YOUR DAY, IN FOCUS</p>
          <h1>Make room for<br /><span>what matters.</span></h1>
          <p className="hero-copy">
            A clear view of your tasks helps you spend less time keeping track—and more time moving forward.
          </p>
        </div>
        <div aria-label={`${completedCount} of ${tasks.length} tasks complete`} className="progress-card">
          <span className="progress-label">YOUR PROGRESS</span>
          <strong>{completedCount}<span> / {tasks.length}</span></strong>
          <div className="progress-track">
            <span style={{ width: `${tasks.length ? (completedCount / tasks.length) * 100 : 0}%` }} />
          </div>
          <span className="progress-caption">tasks completed</span>
        </div>
      </section>

      {error && <div className="notice notice-error" role="alert">{error}</div>}
      {message && <div className="notice notice-success" role="status">{message}</div>}

      <div className="content-grid">
        <section className="tasks-panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">THE OVERVIEW</p>
              <h2>Your tasks <span className="count-badge">{tasks.length}</span></h2>
            </div>
            {session?.user && (
              <span className="signed-in">Signed in as {session.user.email}</span>
            )}
          </div>
          {loading ? (
            <div className="empty-state"><span className="loader" />Loading your tasks…</div>
          ) : (
            <TaskList
              isAdmin={session?.user?.role === "admin"}
              isAuthenticated={Boolean(session?.token)}
              onDelete={handleDeleteTask}
              onEdit={(task) => {
                setEditingTask(task);
                setMessage("");
              }}
              tasks={tasks}
            />
          )}
        </section>

        <aside className="side-panel">
          {session?.user ? (
            <TaskForm
              key={editingTask?.id || "new-task"}
              onCancel={() => setEditingTask(null)}
              onSubmit={handleSaveTask}
              saving={saving}
              task={editingTask}
            />
          ) : (
            <AuthForm
              mode={authMode}
              onAuthenticated={handleAuthenticated}
              onError={setError}
              onMessage={setMessage}
              onModeChange={setAuthMode}
            />
          )}
          <div className="privacy-note">
            <span aria-hidden="true">✦</span>
            <p>Your tasks stay connected to your account. Sign in to create or update them.</p>
          </div>
        </aside>
      </div>

      <footer className="footer">
        <span>Taskflow</span>
        <span>Small steps. Meaningful progress.</span>
      </footer>
    </main>
  );
}

export default App;
