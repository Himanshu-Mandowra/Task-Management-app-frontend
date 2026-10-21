import { useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { Check, UserX, Users } from "lucide-react";
import Modal from "../ui/Modal";
import SearchInput from "../ui/SearchInput";
import { TONE_STYLES, initials, userStats, userTone } from "../../utils/taskUtils";

// Popup list of the admin's users with search. Replaces any select / dropdown.
function UserPickerModal({
  open,
  onClose,
  onSelect,
  selectedId,
  title = "Choose a user",
  subtitle = "Only users under your account can be selected.",
  allowClear = false,
  clearLabel = "No user",
}) {
  const users = useSelector((state) => state.user.users);
  const tasks = useSelector((state) => state.task.tasks);
  const [query, setQuery] = useState("");

  const list = useMemo(() => {
    const q = query.trim().toLowerCase();
    return users
      .filter((u) => !q || u.userName?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q))
      .map((u) => ({ ...u, stats: userStats(tasks, u._id) }));
  }, [users, tasks, query]);

  const choose = (user) => {
    onSelect(user);
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title={title} subtitle={subtitle} width="max-w-md">
      <SearchInput value={query} onChange={setQuery} placeholder="Search by name or email" />

      <div className="mt-4 space-y-2">
        {allowClear && (
          <button
            type="button"
            onClick={() => choose(null)}
            className="flex w-full items-center gap-3 rounded-xl border border-dashed border-slate-300 px-4 py-3 text-left text-sm font-semibold text-slate-500 hover:bg-slate-50"
          >
            <UserX size={18} /> {clearLabel}
          </button>
        )}

        {list.map((user) => {
          const tone = TONE_STYLES[userTone(user.stats)];
          const selected = String(selectedId) === String(user._id);
          return (
            <button
              type="button"
              key={user._id}
              onClick={() => choose(user)}
              className={`flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left hover:border-blue-300 ${
                selected ? "border-blue-500 bg-blue-50" : tone.surface
              }`}
            >
              <span
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white ${tone.avatar}`}
              >
                {initials(user.userName)}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-bold text-slate-900">{user.userName}</span>
                <span className="block truncate text-xs text-slate-500">{user.email}</span>
              </span>
              <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${tone.chip}`}>
                {user.stats.open} open
              </span>
              {selected && <Check size={18} className="text-blue-600" />}
            </button>
          );
        })}

        {list.length === 0 && (
          <div className="flex flex-col items-center gap-2 py-10 text-slate-400">
            <Users size={32} />
            <p className="text-sm">{users.length === 0 ? "You have no users yet." : "No users match your search."}</p>
          </div>
        )}
      </div>
    </Modal>
  );
}

export default UserPickerModal;
