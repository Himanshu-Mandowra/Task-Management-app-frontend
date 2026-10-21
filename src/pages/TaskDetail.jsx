import { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, CalendarClock, Clock, Pencil, Trash2, User as UserIcon, UserPlus } from "lucide-react";
import StatusBadge from "../components/ui/StatusBadge";
import ConfirmModal from "../components/ui/ConfirmModal";
import TaskFormModal from "../components/Form/TaskFormModal";
import UserPickerModal from "../components/users/UserPickerModal";
import { useToast } from "../components/ui/toastContext";
import { assignTask, deleteTask, getActivities, getTaskById, updateTaskStatus } from "../features/task/taskApi";
import { errorMessage } from "../features/http";
import { isAdminRole, loadAppData } from "../features/loadAppData";
import {
  STATUS_OPTIONS,
  assigneeId,
  assigneeName,
  dueLabel,
  formatDate,
  initials,
  isOverdue,
  normStatus,
  timeAgo,
} from "../utils/taskUtils";

function Field({ label, children }) {
  return (
    <div className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
      <p className="text-xs font-bold uppercase tracking-wider text-slate-400">{label}</p>
      <div className="mt-1 text-sm font-semibold text-slate-800">{children}</div>
    </div>
  );
}

function TaskDetail() {
  const { taskId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const toast = useToast();
  const user = useSelector((state) => state.auth.user);
  const storeTask = useSelector((state) => state.task.tasks.find((t) => t._id === taskId));
  const admin = isAdminRole(user?.userRole);

  const [task, setTask] = useState(null);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editOpen, setEditOpen] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    try {
      const [taskRes, activityRes] = await Promise.all([
        getTaskById(taskId),
        getActivities({ page: 1, limit: 100 }).catch(() => ({ data: [] })),
      ]);
      setTask(taskRes.data);
      setActivities((activityRes.data || []).filter((a) => a.taskId?._id === taskId));
      setError("");
    } catch (err) {
      setError(errorMessage(err, "Could not load this task"));
    } finally {
      setLoading(false);
    }
  }, [taskId]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    load();
  }, [load]);

  const refreshAll = async () => {
    await Promise.all([load(), loadAppData(dispatch, user?.userRole)]);
  };

  const changeStatus = async (status) => {
    if (status === normStatus(task)) return;
    try {
      await updateTaskStatus(taskId, status);
      toast(`Status changed to ${status}`);
      await refreshAll();
    } catch (err) {
      toast(errorMessage(err, "Could not update the status"), "error");
    }
  };

  const reassign = async (target) => {
    if (!target) return;
    try {
      await assignTask(taskId, target._id);
      toast(`Assigned to ${target.userName}`);
      await refreshAll();
    } catch (err) {
      toast(errorMessage(err, "Could not assign the task"), "error");
    }
  };

  const remove = async () => {
    setBusy(true);
    try {
      await deleteTask(taskId);
      toast("Task deleted");
      await loadAppData(dispatch, user?.userRole);
      navigate("/tasks", { replace: true });
    } catch (err) {
      toast(errorMessage(err, "Could not delete the task"), "error");
      setBusy(false);
    }
  };

  if (loading) return <div className="py-24 text-center text-slate-400">Loading task...</div>;
  if (error || !task) {
    return (
      <div className="py-24 text-center">
        <p className="font-semibold text-slate-700">{error || "Task not found"}</p>
        <Link to="/tasks" className="mt-4 inline-block text-sm font-semibold text-blue-600">
          Back to tasks
        </Link>
      </div>
    );
  }

  const name = assigneeName(task);
  const assignedId = assigneeId(task);
  const overdue = isOverdue(task);
  const createdBy = task.createdBy || storeTask?.createdBy;

  return (
    <div className="anim-rise space-y-6">
      <Link to="/tasks" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-blue-600">
        <ArrowLeft size={16} /> Back to tasks
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">{task.title}</h2>
            <StatusBadge task={task} />
          </div>
          <p className={`mt-2 flex items-center gap-2 text-sm font-medium ${overdue ? "text-red-600" : "text-slate-500"}`}>
            <CalendarClock size={16} /> {dueLabel(task)}
          </p>
        </div>

        {admin && (
          <div className="flex gap-3">
            <button
              onClick={() => setEditOpen(true)}
              className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              <Pencil size={16} /> Edit
            </button>
            <button
              onClick={() => setDeleteOpen(true)}
              className="flex items-center gap-2 rounded-xl border border-red-200 bg-white px-4 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50"
            >
              <Trash2 size={16} /> Delete
            </button>
          </div>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <section className="rounded-2xl border border-slate-200 bg-white p-6">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Description</h3>
            <p className="mt-3 whitespace-pre-wrap text-base leading-relaxed text-slate-700">{task.description}</p>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-6">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Progress</h3>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              {STATUS_OPTIONS.map((status) => {
                const active = normStatus(task) === status;
                return (
                  <button
                    key={status}
                    onClick={() => changeStatus(status)}
                    className={`rounded-xl border px-4 py-3 text-sm font-semibold capitalize ${
                      active
                        ? "border-blue-600 bg-blue-600 text-white"
                        : "border-slate-200 text-slate-600 hover:border-blue-300 hover:bg-blue-50"
                    }`}
                  >
                    {status}
                  </button>
                );
              })}
            </div>
            {overdue && (
              <p className="mt-3 text-sm text-red-600">This task is past its due date, so its status can no longer be changed.</p>
            )}
            {!assignedId && <p className="mt-3 text-sm text-slate-500">Assign this task to someone before updating its status.</p>}
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-6">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Activity</h3>
            {activities.length === 0 ? (
              <p className="mt-4 text-sm text-slate-400">No recorded activity for this task yet.</p>
            ) : (
              <ol className="mt-4 space-y-5 border-l-2 border-slate-100 pl-5">
                {activities.map((activity) => (
                  <li key={activity._id} className="relative">
                    <span className="absolute -left-[27px] top-1 h-3 w-3 rounded-full border-2 border-white bg-blue-500" />
                    <p className="text-sm font-medium text-slate-700">{activity.description}</p>
                    <p className="mt-0.5 flex items-center gap-1.5 text-xs text-slate-400">
                      <Clock size={13} /> {timeAgo(activity.createdAt)}
                    </p>
                  </li>
                ))}
              </ol>
            )}
          </section>
        </div>

        <aside className="space-y-6">
          <section className="rounded-2xl border border-slate-200 bg-white p-6">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Assigned to</h3>
            {name ? (
              <div className="mt-4 flex items-center gap-3">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-blue-600 text-base font-bold text-white">
                  {initials(name)}
                </span>
                <div className="min-w-0">
                  {admin && assignedId ? (
                    <Link to={`/users/${assignedId}`} className="block truncate text-base font-bold text-slate-900 hover:text-blue-600">
                      {name}
                    </Link>
                  ) : (
                    <p className="truncate text-base font-bold text-slate-900">{name}</p>
                  )}
                  <p className="truncate text-sm text-slate-500">{task.assignedTo?.email}</p>
                </div>
              </div>
            ) : (
              <p className="mt-4 flex items-center gap-2 text-sm text-slate-500">
                <UserIcon size={16} /> Nobody is assigned yet
              </p>
            )}
            {admin && (
              <button
                onClick={() => setPickerOpen(true)}
                className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:border-blue-400 hover:text-blue-600"
              >
                <UserPlus size={16} /> {name ? "Reassign" : "Assign user"}
              </button>
            )}
          </section>

          <section className="space-y-3 rounded-2xl border border-slate-200 bg-white p-6">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Details</h3>
            <Field label="Due date">{formatDate(task.dueDate)}</Field>
            <Field label="Created">{formatDate(task.createdAt, true)}</Field>
            {createdBy && <Field label="Created by">{createdBy}</Field>}
            <Field label="Task ID">
              <span className="break-all font-mono text-xs font-medium text-slate-500">{task._id}</span>
            </Field>
          </section>
        </aside>
      </div>

      <TaskFormModal open={editOpen} onClose={() => setEditOpen(false)} task={task} onSaved={refreshAll} />
      <UserPickerModal
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        selectedId={assignedId}
        title={name ? "Reassign task" : "Assign task"}
        subtitle={task.title}
        onSelect={reassign}
      />
      <ConfirmModal
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={remove}
        busy={busy}
        title="Delete this task?"
        message={`"${task.title}" will be permanently removed. This cannot be undone.`}
        confirmLabel="Delete task"
      />
    </div>
  );
}

export default TaskDetail;
