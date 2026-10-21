import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate, useParams } from "react-router-dom";
import { AlertTriangle, ArrowLeft, ClipboardPlus, Mail, Pencil, ShieldCheck, Trash2, UserCog } from "lucide-react";
import StatusBadge from "../components/ui/StatusBadge";
import ConfirmModal from "../components/ui/ConfirmModal";
import Modal from "../components/ui/Modal";
import SearchInput from "../components/ui/SearchInput";
import TaskFormModal from "../components/Form/TaskFormModal";
import { useToast } from "../components/ui/toastContext";
import { deleteUser, getUserById, updateUser } from "../features/user/userApi";
import { errorMessage } from "../features/http";
import { isAdminRole, loadAppData } from "../features/loadAppData";
import {
  TONE_STYLES,
  assigneeId,
  displayStatus,
  dueLabel,
  formatDate,
  initials,
  isOverdue,
  roleLabel,
  userStats,
  userTone,
} from "../utils/taskUtils";

const STATUS_FILTERS = ["all", "pending", "in progress", "completed", "overdue"];

function UserDetail() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const toast = useToast();
  const me = useSelector((state) => state.auth.user);
  const storeUser = useSelector((state) => state.user.users.find((u) => u._id === userId));
  const tasks = useSelector((state) => state.task.tasks);

  const [profile, setProfile] = useState(storeUser || null);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [assignOpen, setAssignOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [renameOpen, setRenameOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [busy, setBusy] = useState(false);

  const admin = isAdminRole(me?.userRole);

  useEffect(() => {
    let cancelled = false;
    getUserById(userId)
      .then((res) => !cancelled && setProfile(res.data))
      .catch((err) => !cancelled && !storeUser && setError(errorMessage(err, "Could not load this user")));
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const stats = useMemo(() => userStats(tasks, userId), [tasks, userId]);
  const userTasks = useMemo(() => {
    const q = search.trim().toLowerCase();
    return tasks
      .filter((t) => String(assigneeId(t)) === userId)
      .filter((t) => !q || t.title?.toLowerCase().includes(q))
      .filter((t) => status === "all" || displayStatus(t) === status);
  }, [tasks, userId, search, status]);

  if (!admin) return <p className="py-24 text-center text-slate-500">Only admins can view user profiles.</p>;
  if (error && !profile) {
    return (
      <div className="py-24 text-center">
        <p className="font-semibold text-slate-700">{error}</p>
        <Link to="/users" className="mt-4 inline-block text-sm font-semibold text-blue-600">Back to users</Link>
      </div>
    );
  }
  if (!profile) return <div className="py-24 text-center text-slate-400">Loading user...</div>;

  const tone = userTone(stats);
  const style = TONE_STYLES[tone];

  const remove = async () => {
    setBusy(true);
    try {
      await deleteUser(userId);
      toast(`${profile.userName} was removed`);
      await loadAppData(dispatch, me?.userRole);
      navigate("/users", { replace: true });
    } catch (err) {
      toast(errorMessage(err, "Could not delete this user"), "error");
      setBusy(false);
      setDeleteOpen(false);
    }
  };

  const rename = async () => {
    if (!newName.trim()) return;
    setBusy(true);
    try {
      const res = await updateUser(userId, { userName: newName.trim(), userRole: profile.userRole });
      setProfile((p) => ({ ...p, userName: res.data?.userName || newName.trim() }));
      toast("Name updated");
      setRenameOpen(false);
      await loadAppData(dispatch, me?.userRole);
    } catch (err) {
      toast(errorMessage(err, "Could not update the user"), "error");
    } finally {
      setBusy(false);
    }
  };

  const tiles = [
    ["Total tasks", stats.total, "text-slate-900"],
    ["Overdue", stats.overdue, "text-red-600"],
    ["Pending", stats.pending, "text-yellow-700"],
    ["Completed", stats.completed, "text-green-600"],
  ];

  return (
    <div className="anim-rise space-y-6">
      <Link to="/users" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-blue-600">
        <ArrowLeft size={16} /> Back to users
      </Link>

      <section className={`flex flex-wrap items-center justify-between gap-6 rounded-2xl border-2 p-6 ${style.surface}`}>
        <div className="flex min-w-0 items-center gap-5">
          <span className={`flex h-20 w-20 shrink-0 items-center justify-center rounded-full text-2xl font-bold text-white ${style.avatar}`}>
            {initials(profile.userName)}
          </span>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="truncate text-3xl font-extrabold tracking-tight text-slate-900">{profile.userName}</h2>
              <span className="rounded-full bg-white px-3 py-1 text-xs font-bold uppercase tracking-wide text-slate-500 ring-1 ring-slate-200">
                {roleLabel(profile.userRole)}
              </span>
            </div>
            <div className="mt-2 flex flex-wrap gap-x-6 gap-y-1 text-sm text-slate-600">
              <span className="flex items-center gap-2"><Mail size={15} /> {profile.email}</span>
              <span className="flex items-center gap-2"><UserCog size={15} /> Managed by {profile.adminName || "—"}</span>
              <span className="flex items-center gap-2"><ShieldCheck size={15} /> {style.label}</span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => setAssignOpen(true)}
            className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
          >
            <ClipboardPlus size={16} /> Assign task
          </button>
          {me?.userRole === "super-admin" && (
            <button
              onClick={() => {
                setNewName(profile.userName);
                setRenameOpen(true);
              }}
              className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              <Pencil size={16} /> Rename
            </button>
          )}
          <button
            onClick={() => setDeleteOpen(true)}
            className="flex items-center gap-2 rounded-xl border border-red-200 bg-white px-4 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50"
          >
            <Trash2 size={16} /> Remove
          </button>
        </div>
      </section>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {tiles.map(([label, value, color]) => (
          <div key={label} className="rounded-2xl border border-slate-200 bg-white p-5">
            <p className={`text-3xl font-extrabold ${color}`}>{value}</p>
            <p className="mt-1 text-sm font-semibold text-slate-400">{label}</p>
          </div>
        ))}
      </div>

      {tone !== "none" && (
        <div className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-sm font-medium ${style.surface}`}>
          <AlertTriangle size={18} className={tone === "red" ? "text-red-600" : "text-yellow-700"} />
          {tone === "red"
            ? `${profile.userName} has ${stats.overdue} overdue task${stats.overdue === 1 ? "" : "s"}.`
            : `${profile.userName} has ${stats.pending} pending tasks waiting.`}
        </div>
      )}

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <div className="flex flex-wrap items-center gap-3 border-b border-slate-100 p-5">
          <h3 className="mr-auto text-lg font-bold text-slate-900">Assigned tasks</h3>
          <SearchInput value={search} onChange={setSearch} placeholder="Search tasks" className="w-64" />
        </div>
        <div className="flex flex-wrap gap-2 border-b border-slate-100 px-5 py-3">
          {STATUS_FILTERS.map((s) => (
            <button
              key={s}
              onClick={() => setStatus(s)}
              className={`rounded-full border px-4 py-1.5 text-sm font-semibold capitalize ${
                status === s ? "border-blue-600 bg-blue-600 text-white" : "border-slate-200 text-slate-600 hover:bg-slate-50"
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        {userTasks.length === 0 ? (
          <p className="py-14 text-center text-sm text-slate-400">No tasks to show.</p>
        ) : (
          userTasks.map((task) => (
            <Link
              key={task._id}
              to={`/tasks/${task._id}`}
              className={`flex items-center justify-between gap-4 border-b border-slate-100 px-6 py-4 last:border-0 hover:bg-slate-50 ${
                isOverdue(task) ? "bg-red-50/40" : ""
              }`}
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-bold text-slate-900">{task.title}</p>
                <p className={`text-xs ${isOverdue(task) ? "text-red-600" : "text-slate-400"}`}>
                  {formatDate(task.dueDate)} · {dueLabel(task)}
                </p>
              </div>
              <StatusBadge task={task} />
            </Link>
          ))
        )}
      </section>

      <TaskFormModal
        open={assignOpen}
        onClose={() => setAssignOpen(false)}
        presetAssignee={{ _id: userId, userName: profile.userName }}
        onSaved={() => loadAppData(dispatch, me?.userRole)}
      />

      <ConfirmModal
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={remove}
        busy={busy}
        title={`Remove ${profile.userName}?`}
        message="This account will be deleted. Any users that report to this account move under you. This cannot be undone."
        confirmLabel="Remove user"
      />

      <Modal
        open={renameOpen}
        onClose={() => setRenameOpen(false)}
        title="Rename user"
        width="max-w-md"
        footer={
          <div className="flex justify-end gap-3">
            <button onClick={() => setRenameOpen(false)} className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50">
              Cancel
            </button>
            <button onClick={rename} disabled={busy} className="rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-blue-700">
              Save
            </button>
          </div>
        }
      >
        <input
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
        />
      </Modal>
    </div>
  );
}

export default UserDetail;
