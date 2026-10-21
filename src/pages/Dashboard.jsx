import { useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { AlertTriangle, ArrowRight, CheckCircle2, ClipboardList, Clock, Plus, Users } from "lucide-react";
import StatusBadge from "../components/ui/StatusBadge";
import TaskFormModal from "../components/Form/TaskFormModal";
import { isAdminRole, loadAppData } from "../features/loadAppData";
import {
  TONE_STYLES,
  assigneeName,
  formatDate,
  initials,
  isDone,
  isOverdue,
  timeAgo,
  userStats,
  userTone,
} from "../utils/taskUtils";

function Dashboard() {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  const tasks = useSelector((state) => state.task.tasks);
  const users = useSelector((state) => state.user.users);
  const summary = useSelector((state) => state.task.summary) || {};
  const activities = useSelector((state) => state.task.activities);
  const [formOpen, setFormOpen] = useState(false);
  const admin = isAdminRole(user?.userRole);

  const recent = useMemo(
    () => [...tasks].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 6),
    [tasks],
  );

  const attention = useMemo(
    () =>
      users
        .map((u) => {
          const stats = userStats(tasks, u._id);
          return { user: u, stats, tone: userTone(stats) };
        })
        .filter((row) => row.tone !== "none")
        .sort((a, b) => b.stats.overdue - a.stats.overdue || b.stats.pending - a.stats.pending)
        .slice(0, 5),
    [users, tasks],
  );

  const stats = [
    { label: "Total tasks", value: summary.TotalTasks ?? tasks.length, icon: ClipboardList, color: "bg-blue-50 text-blue-600" },
    { label: "Pending or active", value: tasks.filter((t) => !isDone(t) && !isOverdue(t)).length, icon: Clock, color: "bg-yellow-50 text-yellow-700" },
    { label: "Overdue", value: tasks.filter(isOverdue).length, icon: AlertTriangle, color: "bg-red-50 text-red-600" },
    admin
      ? { label: "Users", value: summary.totalUsers ?? users.length, icon: Users, color: "bg-slate-100 text-slate-700" }
      : { label: "Completed", value: tasks.filter(isDone).length, icon: CheckCircle2, color: "bg-green-50 text-green-600" },
  ];

  return (
    <div className="anim-rise space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">
            Hello, {user?.userName?.split(" ")[0] || "there"}
          </h2>
          <p className="mt-1 text-slate-500">Here is what is happening with your tasks today.</p>
        </div>
        <button
          onClick={() => setFormOpen(true)}
          className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700"
        >
          <Plus size={18} strokeWidth={2.5} /> New task
        </button>
      </div>

      <div className="grid grid-cols-2 gap-5 xl:grid-cols-4">
        {stats.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5">
            <span className={`flex h-12 w-12 items-center justify-center rounded-xl ${color}`}>
              <Icon size={22} />
            </span>
            <div>
              <p className="text-3xl font-extrabold text-slate-900">{value}</p>
              <p className="text-sm font-semibold text-slate-400">{label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white xl:col-span-2">
          <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
            <h3 className="text-lg font-bold text-slate-900">Recently assigned</h3>
            <Link to="/tasks" className="flex items-center gap-1.5 text-sm font-semibold text-blue-600 hover:text-blue-700">
              View all <ArrowRight size={15} />
            </Link>
          </div>
          {recent.length === 0 && <p className="py-14 text-center text-sm text-slate-400">No tasks yet.</p>}
          {recent.map((task) => (
            <Link
              key={task._id}
              to={`/tasks/${task._id}`}
              className={`flex items-center justify-between gap-4 border-b border-slate-100 px-6 py-4 last:border-0 hover:bg-slate-50 ${
                isOverdue(task) ? "bg-red-50/40" : ""
              }`}
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-bold text-slate-900">{task.title}</p>
                <p className="truncate text-xs text-slate-400">
                  {assigneeName(task) || "Unassigned"} · Due {formatDate(task.dueDate)}
                </p>
              </div>
              <StatusBadge task={task} />
            </Link>
          ))}
        </section>

        <div className="space-y-6">
          {admin && (
            <section className="rounded-2xl border border-slate-200 bg-white p-6">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-bold text-slate-900">Needs attention</h3>
                <Link to="/users" className="text-sm font-semibold text-blue-600 hover:text-blue-700">All users</Link>
              </div>
              {attention.length === 0 ? (
                <p className="text-sm text-slate-400">Everyone is on track.</p>
              ) : (
                <div className="space-y-3">
                  {attention.map(({ user: u, stats: s, tone }) => (
                    <Link
                      key={u._id}
                      to={`/users/${u._id}`}
                      className={`flex items-center gap-3 rounded-xl border px-3 py-2.5 hover:brightness-95 ${TONE_STYLES[tone].surface}`}
                    >
                      <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white ${TONE_STYLES[tone].avatar}`}>
                        {initials(u.userName)}
                      </span>
                      <span className="min-w-0 flex-1 truncate text-sm font-bold text-slate-900">{u.userName}</span>
                      <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${TONE_STYLES[tone].chip}`}>
                        {tone === "red" ? `${s.overdue} overdue` : `${s.pending} pending`}
                      </span>
                    </Link>
                  ))}
                </div>
              )}
            </section>
          )}

          <section className="rounded-2xl border border-slate-200 bg-white p-6">
            <h3 className="mb-4 text-lg font-bold text-slate-900">Recent activity</h3>
            {activities.length === 0 ? (
              <p className="text-sm text-slate-400">Nothing yet.</p>
            ) : (
              <ol className="space-y-4 border-l-2 border-slate-100 pl-5">
                {activities.slice(0, 6).map((activity) => (
                  <li key={activity._id} className="relative">
                    <span className="absolute -left-[27px] top-1 h-3 w-3 rounded-full border-2 border-white bg-blue-500" />
                    <p className="text-sm font-medium text-slate-700">{activity.description}</p>
                    <p className="mt-0.5 text-xs text-slate-400">{timeAgo(activity.createdAt)}</p>
                  </li>
                ))}
              </ol>
            )}
          </section>
        </div>
      </div>

      <TaskFormModal open={formOpen} onClose={() => setFormOpen(false)} onSaved={() => loadAppData(dispatch, user?.userRole)} />
    </div>
  );
}

export default Dashboard;
