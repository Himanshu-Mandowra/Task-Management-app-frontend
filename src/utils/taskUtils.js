export const STATUS = {
  PENDING: "pending",
  IN_PROGRESS: "in progress",
  COMPLETED: "completed",
};

export const STATUS_OPTIONS = [STATUS.PENDING, STATUS.IN_PROGRESS, STATUS.COMPLETED];

export const normStatus = (task) => String(task?.status || "pending").toLowerCase();

export const isDone = (task) => normStatus(task) === STATUS.COMPLETED;

export const isOverdue = (task) =>
  !isDone(task) && Boolean(task?.dueDate) && new Date(task.dueDate) < new Date();

// Status shown to the user: anything past its due date and not completed is overdue
export const displayStatus = (task) => (isOverdue(task) ? "overdue" : normStatus(task));

export const assigneeId = (task) => task?.assignedTo?._id || task?.assignedTo || null;

export const assigneeName = (task) => task?.assignedTo?.userName || task?.assignedName || "";

export const initials = (name = "") =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("") || "?";

export const formatDate = (iso, withTime = false) => {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    ...(withTime ? { hour: "numeric", minute: "2-digit" } : {}),
  });
};

export const timeAgo = (iso) => {
  if (!iso) return "";
  const seconds = Math.max(1, Math.floor((Date.now() - new Date(iso)) / 1000));
  const steps = [
    [60, "second"],
    [60, "minute"],
    [24, "hour"],
    [30, "day"],
    [12, "month"],
  ];
  let value = seconds;
  for (const [limit, unit] of steps) {
    if (value < limit) return `${value} ${unit}${value === 1 ? "" : "s"} ago`;
    value = Math.floor(value / limit);
  }
  return `${value} year${value === 1 ? "" : "s"} ago`;
};

export const dueLabel = (task) => {
  if (!task?.dueDate) return "No due date";
  if (isDone(task)) return `Due ${formatDate(task.dueDate)}`;
  const days = Math.ceil((new Date(task.dueDate) - new Date()) / 86400000);
  if (days < 0) return `Overdue by ${Math.abs(days)} day${Math.abs(days) === 1 ? "" : "s"}`;
  if (days === 0) return "Due today";
  return `Due in ${days} day${days === 1 ? "" : "s"}`;
};

// Workload of one user derived from the task list
export const userStats = (tasks, userId) => {
  const mine = tasks.filter((task) => String(assigneeId(task)) === String(userId));
  const overdue = mine.filter(isOverdue).length;
  const pending = mine.filter((task) => !isOverdue(task) && normStatus(task) === STATUS.PENDING).length;
  const completed = mine.filter(isDone).length;
  return { total: mine.length, overdue, pending, completed, open: mine.length - completed };
};

// red: has overdue work, yellow: more than one pending task, none: all good
export const userTone = (stats) => {
  if (stats.overdue > 0) return "red";
  if (stats.pending > 1) return "yellow";
  return "none";
};

export const TONE_STYLES = {
  red: {
    surface: "bg-red-50 border-red-200",
    chip: "bg-red-100 text-red-700",
    avatar: "bg-red-600",
    label: "Has overdue tasks",
  },
  yellow: {
    surface: "bg-yellow-50 border-yellow-200",
    chip: "bg-yellow-100 text-yellow-800",
    avatar: "bg-yellow-600",
    label: "Multiple pending tasks",
  },
  none: {
    surface: "bg-white border-slate-200",
    chip: "bg-slate-100 text-slate-600",
    avatar: "bg-blue-600",
    label: "On track",
  },
};

export const TASK_SORTS = [
  { value: "-createdAt", label: "Recently assigned", hint: "Newest first" },
  { value: "createdAt", label: "Oldest first", hint: "Longest waiting at the top" },
  { value: "dueDate", label: "Due date: earliest", hint: "Most urgent first" },
  { value: "-dueDate", label: "Due date: latest", hint: "Furthest deadline first" },
];

// Used when the server does not paginate (non-admin users)
export const sortTasksLocal = (tasks, sort) => {
  const desc = sort.startsWith("-");
  const key = sort.replace("-", "");
  return [...tasks].sort((a, b) => {
    const diff = new Date(a[key] || 0) - new Date(b[key] || 0);
    return desc ? -diff : diff;
  });
};

export const roleLabel = (role) => (role === "admin" || role === "super-admin" ? "Admin" : "User");
