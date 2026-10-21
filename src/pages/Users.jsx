import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { LayoutGrid, List, SlidersHorizontal, UserPlus, Users as UsersIcon, X } from "lucide-react";
import SearchInput from "../components/ui/SearchInput";
import FilterModal from "../components/ui/FilterModal";
import UserFormModal from "../components/Form/UserFormModal";
import TaskFormModal from "../components/Form/TaskFormModal";
import UserCard3D from "../components/users/UserCard3D";
import UserSpotlight from "../components/users/UserSpotlight";
import { isAdminRole, loadAppData } from "../features/loadAppData";
import { TONE_STYLES, initials, roleLabel, userStats, userTone } from "../utils/taskUtils";

const DEFAULT_FILTERS = { tone: "all", sort: "name" };

const TONE_CHOICES = [
  { value: "all", label: "All users" },
  { value: "red", label: "Overdue tasks" },
  { value: "yellow", label: "Multiple pending" },
  { value: "none", label: "On track" },
];

const SORTS = [
  { value: "name", label: "Name: A to Z" },
  { value: "name-desc", label: "Name: Z to A" },
  { value: "overdue", label: "Most overdue tasks", hint: "Who needs attention first" },
  { value: "open", label: "Most open tasks", hint: "Heaviest workload first" },
];

function Users() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const me = useSelector((state) => state.auth.user);
  const users = useSelector((state) => state.user.users);
  const tasks = useSelector((state) => state.task.tasks);

  const [view, setView] = useState(() => localStorage.getItem("users-view") || "grid");
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [filterOpen, setFilterOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [spot, setSpot] = useState(null); // { user, rect }
  const [assignFor, setAssignFor] = useState(null);

  useEffect(() => localStorage.setItem("users-view", view), [view]);

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase();
    const list = users
      .filter((u) => !q || u.userName?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q))
      .map((u) => {
        const stats = userStats(tasks, u._id);
        return { user: u, stats, tone: userTone(stats) };
      })
      .filter((row) => filters.tone === "all" || row.tone === filters.tone);

    const by = {
      name: (a, b) => a.user.userName.localeCompare(b.user.userName),
      "name-desc": (a, b) => b.user.userName.localeCompare(a.user.userName),
      overdue: (a, b) => b.stats.overdue - a.stats.overdue || b.stats.pending - a.stats.pending,
      open: (a, b) => b.stats.open - a.stats.open,
    };
    return list.sort(by[filters.sort]);
  }, [users, tasks, search, filters]);

  const counts = useMemo(() => {
    const all = users.map((u) => userTone(userStats(tasks, u._id)));
    return {
      total: users.length,
      red: all.filter((t) => t === "red").length,
      yellow: all.filter((t) => t === "yellow").length,
    };
  }, [users, tasks]);

  const reload = () => loadAppData(dispatch, me?.userRole);
  const activeFilters = (filters.tone !== "all") + (filters.sort !== "name");

  if (!isAdminRole(me?.userRole)) {
    return <p className="py-24 text-center text-slate-500">Only admins can manage users.</p>;
  }

  return (
    <div className="anim-rise space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">Users</h2>
          <p className="mt-1 text-slate-500">Everyone who works under your account.</p>
        </div>
        <button
          onClick={() => setAddOpen(true)}
          className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700"
        >
          <UserPlus size={18} /> Add user
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-slate-500">
        <span className="font-semibold text-slate-700">{counts.total} users</span>
        <span className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-sm border border-red-300 bg-red-100" /> {counts.red} with overdue tasks
        </span>
        <span className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-sm border border-yellow-300 bg-yellow-100" /> {counts.yellow} with more than one pending task
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <SearchInput value={search} onChange={setSearch} placeholder="Search users by name or email" className="min-w-[260px] flex-1" />
        <button
          onClick={() => setFilterOpen(true)}
          className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
        >
          <SlidersHorizontal size={17} /> Filters
          {activeFilters > 0 && <span className="rounded-full bg-blue-600 px-2 py-0.5 text-xs text-white">{activeFilters}</span>}
        </button>
        <div className="flex rounded-xl border border-slate-200 bg-white p-1">
          {[
            ["grid", LayoutGrid, "Grid"],
            ["list", List, "List"],
          ].map(([key, Icon, label]) => (
            <button
              key={key}
              onClick={() => setView(key)}
              className={`flex items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-semibold ${
                view === key ? "bg-blue-600 text-white" : "text-slate-500 hover:text-slate-900"
              }`}
            >
              <Icon size={16} /> {label}
            </button>
          ))}
        </div>
      </div>

      {filters.tone !== "all" && (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700">
          {TONE_CHOICES.find((c) => c.value === filters.tone)?.label}
          <button onClick={() => setFilters((f) => ({ ...f, tone: "all" }))} aria-label="Remove filter">
            <X size={14} />
          </button>
        </span>
      )}

      {rows.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-2xl border border-slate-200 bg-white py-20 text-slate-400">
          <UsersIcon size={36} />
          <p className="text-sm font-medium">{users.length === 0 ? "You have not added any users yet" : "No users match"}</p>
        </div>
      ) : view === "grid" ? (
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
          {rows.map(({ user, stats }) => (
            <UserCard3D key={user._id} user={user} stats={stats} onOpen={(rect) => setSpot({ user, stats, rect })} />
          ))}
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
          <div className="hidden grid-cols-[2fr_1fr_2.2fr] gap-4 border-b border-slate-100 bg-slate-50 px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-400 md:grid">
            <span>User</span>
            <span>Type</span>
            <span>Tasks</span>
          </div>
          {rows.map(({ user, stats, tone }) => {
            const style = TONE_STYLES[tone];
            return (
              <div
                key={user._id}
                onClick={() => navigate(`/users/${user._id}`)}
                className={`grid cursor-pointer grid-cols-[2fr_1fr_2.2fr] items-center gap-4 border-b border-slate-100 px-6 py-4 last:border-0 hover:brightness-95 ${
                  tone === "none" ? "hover:bg-slate-50" : style.surface.split(" ")[0]
                }`}
              >
                <div className="flex min-w-0 items-center gap-3">
                  <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white ${style.avatar}`}>
                    {initials(user.userName)}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-slate-900">{user.userName}</p>
                    <p className="truncate text-xs text-slate-500">{user.email}</p>
                  </div>
                </div>
                <span className="text-sm font-semibold text-slate-600">{roleLabel(user.userRole)}</span>
                <div className="flex flex-wrap gap-2 text-xs font-bold">
                  <span className="rounded-full bg-red-100 px-3 py-1 text-red-700">{stats.overdue} overdue</span>
                  <span className="rounded-full bg-yellow-100 px-3 py-1 text-yellow-800">{stats.pending} pending</span>
                  <span className="rounded-full bg-green-100 px-3 py-1 text-green-700">{stats.completed} done</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <FilterModal
        open={filterOpen}
        onClose={() => setFilterOpen(false)}
        values={filters}
        groups={[
          { key: "tone", title: "Workload", type: "chips", options: TONE_CHOICES },
          { key: "sort", title: "Sort by", type: "radio", options: SORTS },
        ]}
        onApply={setFilters}
        onReset={() => setFilters(DEFAULT_FILTERS)}
      />

      <UserFormModal open={addOpen} onClose={() => setAddOpen(false)} onSaved={reload} />

      {spot && (
        <UserSpotlight
          user={spot.user}
          stats={spot.stats}
          originRect={spot.rect}
          onClose={() => setSpot(null)}
          onProfile={() => navigate(`/users/${spot.user._id}`)}
          onAssign={() => {
            setAssignFor(spot.user);
            setSpot(null);
          }}
        />
      )}

      <TaskFormModal
        open={Boolean(assignFor)}
        onClose={() => setAssignFor(null)}
        presetAssignee={assignFor}
        onSaved={reload}
      />
    </div>
  );
}

export default Users;
