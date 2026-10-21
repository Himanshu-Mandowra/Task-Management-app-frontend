import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useSelector } from "react-redux";
import { CalendarDays, UserPlus, X } from "lucide-react";
import Modal from "../ui/Modal";
import { useToast } from "../ui/toastContext";
import UserPickerModal from "../users/UserPickerModal";
import { assignTask, createEmployeeTask, createTask, updateTask } from "../../features/task/taskApi";
import { errorMessage } from "../../features/http";
import { isAdminRole } from "../../features/loadAppData";
import { assigneeId, assigneeName, initials } from "../../utils/taskUtils";

const toInputDate = (iso) => {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

const todayInput = () => toInputDate(new Date().toISOString());

const labelClass = "mb-1.5 block text-sm font-semibold text-slate-700";
const inputClass =
  "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100";

// Create (no `task`) or edit (`task`) form shown in a popup.
// `presetAssignee` pre-selects a user when creating from a user page.
function TaskFormModal({ open, onClose, task, presetAssignee, onSaved }) {
  const toast = useToast();
  const role = useSelector((state) => state.auth.user?.userRole);
  const users = useSelector((state) => state.user.users);
  const admin = isAdminRole(role);
  const editing = Boolean(task);

  const { register, handleSubmit, reset, formState: { errors } } = useForm();
  const [assignee, setAssignee] = useState(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    reset({
      title: task?.title || "",
      description: task?.description || "",
      dueDate: toInputDate(task?.dueDate),
    });
    if (task) {
      const id = assigneeId(task);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setAssignee(id ? users.find((u) => u._id === id) || { _id: id, userName: assigneeName(task) } : null);
    } else {
      setAssignee(presetAssignee || null);
    }
  }, [open, task, presetAssignee, users, reset]);

  const submit = async (values) => {
    setSaving(true);
    try {
      const payload = {
        title: values.title.trim(),
        description: values.description.trim(),
      };
      if (values.dueDate) payload.dueDate = new Date(`${values.dueDate}T23:59:59`).toISOString();

      if (editing) {
        await updateTask(task._id, payload);
        if (assignee && assignee._id !== assigneeId(task)) await assignTask(task._id, assignee._id);
        toast("Task updated");
      } else if (admin) {
        if (assignee) payload.assignedTo = assignee._id;
        await createTask(payload);
        toast(assignee ? `Task assigned to ${assignee.userName}` : "Task created");
      } else {
        await createEmployeeTask(payload);
        toast("Task created");
      }
      onClose();
      await onSaved?.();
    } catch (error) {
      toast(errorMessage(error, "Could not save the task"), "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Modal
        open={open}
        onClose={onClose}
        title={editing ? "Edit task" : "New task"}
        subtitle={editing ? "Update the details below" : "Describe the work and choose who does it"}
        width="max-w-xl"
        footer={
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="task-form"
              disabled={saving}
              className="rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
            >
              {saving ? "Saving..." : editing ? "Save changes" : "Create task"}
            </button>
          </div>
        }
      >
        <form id="task-form" onSubmit={handleSubmit(submit)} className="space-y-5" noValidate>
          <div>
            <label className={labelClass}>Title</label>
            <input
              className={inputClass}
              placeholder="e.g. Prepare the monthly report"
              {...register("title", { required: "Title is required" })}
            />
            {errors.title && <p className="mt-1 text-xs text-red-600">{errors.title.message}</p>}
          </div>

          <div>
            <label className={labelClass}>Description</label>
            <textarea
              rows={4}
              className={`${inputClass} resize-none`}
              placeholder="What needs to be done?"
              {...register("description", { required: "Description is required" })}
            />
            {errors.description && <p className="mt-1 text-xs text-red-600">{errors.description.message}</p>}
          </div>

          <div className={admin ? "grid gap-5 sm:grid-cols-2" : ""}>
            <div>
              <label className={labelClass}>Due date</label>
              <div className="relative">
                <CalendarDays size={18} className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input type="date" min={editing ? undefined : todayInput()} className={inputClass} {...register("dueDate")} />
              </div>
              {!editing && <p className="mt-1 text-xs text-slate-400">Defaults to two days from now when empty.</p>}
            </div>

            {admin && (
              <div>
                <label className={labelClass}>Assign to</label>
                {assignee ? (
                  <div className="flex items-center gap-3 rounded-xl border border-slate-200 px-3 py-2">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
                      {initials(assignee.userName)}
                    </span>
                    <button
                      type="button"
                      onClick={() => setPickerOpen(true)}
                      className="min-w-0 flex-1 truncate text-left text-sm font-semibold text-slate-800"
                    >
                      {assignee.userName}
                    </button>
                    {!editing && (
                      <button
                        type="button"
                        onClick={() => setAssignee(null)}
                        className="text-slate-400 hover:text-slate-700"
                        aria-label="Remove assignee"
                      >
                        <X size={16} />
                      </button>
                    )}
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setPickerOpen(true)}
                    className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-slate-300 px-4 py-3 text-sm font-semibold text-slate-600 hover:border-blue-400 hover:text-blue-600"
                  >
                    <UserPlus size={18} /> Choose user
                  </button>
                )}
              </div>
            )}
          </div>
        </form>
      </Modal>

      {admin && (
        <UserPickerModal
          open={pickerOpen}
          onClose={() => setPickerOpen(false)}
          selectedId={assignee?._id}
          onSelect={(user) => user && setAssignee(user)}
          title="Assign to"
        />
      )}
    </>
  );
}

export default TaskFormModal;
