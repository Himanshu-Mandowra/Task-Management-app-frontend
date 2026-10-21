import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useSearchParams } from "react-router-dom";
import { CheckCircle2, ClipboardList, Plus, SlidersHorizontal, UserPlus, X } from "lucide-react";
import SearchInput from "../components/ui/SearchInput";
import FilterModal from "../components/ui/FilterModal";
import StatusBadge from "../components/ui/StatusBadge";
import Pagination from "../components/Pagination";
import TaskFormModal from "../components/Form/TaskFormModal";
import UserPickerModal from "../components/users/UserPickerModal";
import { useToast } from "../components/ui/toastContext";
import { assignTask, getTasks, updateTaskStatus } from "../features/task/taskApi";
import { errorMessage } from "../features/http";
import { isAdminRole, loadAppData } from "../features/loadAppData";
import {
  STATUS,
  TASK_SORTS,
  assigneeId,
  assigneeName,
  displayStatus,
  dueLabel,
  formatDate,
  initials,
  isOverdue,
  sortTasksLocal,
} from "../utils/taskUtils";

const PAGE_SIZE = 10;

const STATUS_CHOICES = [
  { value: "all", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "in progress", label: "In progress" },
  { value: "completed", label: "Completed" },
  { value: "overdue", label: "Overdue" },
];

const DEFAULT_FILTERS = { sort: "-createdAt", status: "all", assigneeId: "" };

function Tasks() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const toast = useToast();
  const [params, setParams] = useSearchParams();
  const user = useSelector((state) => state.auth.user);
  const users = useSelector((state) => state.user.users);
  const admin = isAdminRole(user?.userRole);

  const [search, setSearch] = useState(params.get("search") || "");
  const [debounced, setDebounced] = useState(search);
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [page, setPage] = useState(1);
  const [rows, setRows] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [version, setVersion] = useState(0);

  const [filterOpen, setFilterOpen] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [assigning, setAssigning] = useState(null);
  const [filterUserPicker, setFilterUserPicker] = useState(false);

  // Navbar search sends ?search= ; keep the input in sync with it
  const urlSearch = params.get("search");
  const lastUrlSearch = useRef(urlSearch);
  useEffect(() => {
    if (urlSearch !== lastUrlSearch.current) {
      lastUrlSearch.current = urlSearch;
      setSearch(urlSearch || "");
    }
  }, [urlSearch]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebounced(search.trim());
      setPage(1);
    }, 450);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      setLoading(true);
      try {
        const res = admin
          ? await getTasks({ page, limit: PAGE_SIZE, search: debounced, sort: filters.sort })
          : await getTasks({ page: 1, limit: 1000 });
        if (cancelled) return;
        setRows(res?.data || []);
        setPagination(res?.pagination || null);
      } catch (error) {
        if (!cancelled) toast(errorMessage(error, "Could not load tasks"), "error");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    if (user) run();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [admin, page, debounced, filters.sort, version, user?._id]);

  const refresh = useCallback(async () => {
    setVersion((v) => v + 1);
    await loadAppData(dispatch, user?.userRole);
  }, [dispatch, user?.userRole]);

  // Status and assignee filters run on the loaded page; non admins also search/sort/page locally
  const visible = useMemo(() => {
    let list = rows;
    if (!admin) {
      const q = debounced.toLowerCase();
      if (q) list = list.filter((t) => t.title?.toLowerCase().includes(q));
      list = sortTasksLocal(list, filters.sort);
    }
    if (filters.status !== "all") list = list.filter((t) => displayStatus(t) === filters.status);
    if (filters.assigneeId) list = list.filter((t) => String(assigneeId(t)) === filters.assigneeId);
    return list;
  }, [rows, admin, debounced, filters]);

  const totalPages = admin ? pagination?.totalPages : Math.ceil(visible.length / PAGE_SIZE);
  const shown = admin ? visible : visible.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const filterUser = users.find((u) => u._id === filters.assigneeId);
  const activeChips = [
    filters.status !== "all" && { key: "status", label: `Status: ${filters.status}` },
    filters.assigneeId && { key: "assigneeId", label: `User: ${filterUser?.userName || "selected"}` },
    filters.sort !== DEFAULT_FILTERS.sort && {
      key: "sort",
      label: TASK_SORTS.find((s) => s.value === filters.sort)?.label,
    },
  ].filter(Boolean);

  const clearChip = (key) => {
    setFilters((f) => ({ ...f, [key]: DEFAULT_FILTERS[key] }));
    setPage(1);
  };

  const onSearch = (value) => {
    setSearch(value);
    if (params.get("search")) setParams({}, { replace: true });
  };

  const assignTo = async (target) => {
    if (!target || !assigning) return;
    try {
      await assignTask(assigning._id, target._id);
      toast(`Assigned to ${target.userName}`);
      await refresh();
    } catch (error) {
      toast(errorMessage(error, "Could not assign the task"), "error");
    }
  };

  const markComplete = async (task) => {
    try {
      await updateTaskStatus(task._id, STATUS.COMPLETED);
      toast("Task marked as completed");
      await refresh();
    } catch (error) {
      toast(errorMessage(error, "Could not update the status"), "error");
    }
  };

  const gridCols = admin ? "grid-cols-[2.2fr_1.4fr_1fr_1.2fr]" : "grid-cols-[2.4fr_1fr_1.2fr_auto]";

  return (
    <div className="anim-rise space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">Tasks</h2>
          <p className="mt-1 text-slate-500">
            {admin ? "Track, assign and follow up on every task." : "Tasks assigned to you."}
          </p>
        </div>
        <button
          onClick={() => setFormOpen(true)}
          className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700"
        >
          <Plus size={18} strokeWidth={2.5} /> New task
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <SearchInput value={search} onChange={onSearch} placeholder="Search tasks by title" className="min-w-[260px] flex-1" />
        <button
          onClick={() => setFilterOpen(true)}
          className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
        >
          <SlidersHorizontal size={17} /> Filters
          {activeChips.length > 0 && (
            <span className="rounded-full bg-blue-600 px-2 py-0.5 text-xs text-white">{activeChips.length}</span>
          )}
        </button>
      </div>

      {activeChips.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {activeChips.map((chip) => (
            <span
              key={chip.key}
              className="flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1.5 text-xs font-semibold capitalize text-blue-700"
            >
              {chip.label}
              <button onClick={() => clearChip(chip.key)} aria-label="Remove filter">
                <X size={14} />
              </button>
            </span>
          ))}
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <div className={`hidden gap-4 border-b border-slate-100 bg-slate-50 px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-400 md:grid ${gridCols}`}>
          <span>Task</span>
          <span>{admin ? "Assigned to" : "Status"}</span>
          <span>{admin ? "Status" : "Due"}</span>
          <span>{admin ? "Due" : "Action"}</span>
        </div>

        <div className={`transition-opacity duration-500 ${loading ? "opacity-50" : "opacity-100"}`}>
          {shown.map((task) => {
            const name = assigneeName(task);
            return (
              <div
                key={task._id}
                onClick={() => navigate(`/tasks/${task._id}`)}
                className={`grid cursor-pointer items-center gap-4 border-b border-slate-100 px-6 py-4 last:border-0 hover:bg-slate-50 ${gridCols} ${
                  isOverdue(task) ? "bg-red-50/40" : ""
                }`}
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-slate-900">{task.title}</p>
                  <p className="truncate text-sm text-slate-500">{task.description}</p>
                </div>

                {admin ? (
                  <div onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => setAssigning(task)}
                      className="flex max-w-full items-center gap-2 rounded-xl border border-slate-200 px-2.5 py-1.5 text-sm font-semibold text-slate-700 hover:border-blue-400 hover:text-blue-600"
                    >
                      {name ? (
                        <>
                          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-600 text-[11px] font-bold text-white">
                            {initials(name)}
                          </span>
                          <span className="truncate">{name}</span>
                        </>
                      ) : (
                        <>
                          <UserPlus size={16} /> Assign
                        </>
                      )}
                    </button>
                  </div>
                ) : (
                  <div><StatusBadge task={task} /></div>
                )}

                {admin ? (
                  <div><StatusBadge task={task} /></div>
                ) : (
                  <div>
                    <p className="text-sm font-semibold text-slate-700">{formatDate(task.dueDate)}</p>
                    <p className={`text-xs ${isOverdue(task) ? "text-red-600" : "text-slate-400"}`}>{dueLabel(task)}</p>
                  </div>
                )}

                {admin ? (
                  <div>
                    <p className="text-sm font-semibold text-slate-700">{formatDate(task.dueDate)}</p>
                    <p className={`text-xs ${isOverdue(task) ? "text-red-600" : "text-slate-400"}`}>{dueLabel(task)}</p>
                  </div>
                ) : (
                  <div onClick={(e) => e.stopPropagation()}>
                    {displayStatus(task) !== "completed" && !isOverdue(task) && (
                      <button
                        onClick={() => markComplete(task)}
                        className="flex items-center gap-1.5 rounded-xl border border-green-200 px-3 py-1.5 text-xs font-semibold text-green-700 hover:bg-green-50"
                      >
                        <CheckCircle2 size={15} /> Complete
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}

          {!loading && shown.length === 0 && (
            <div className="flex flex-col items-center gap-2 py-16 text-slate-400">
              <ClipboardList size={36} />
              <p className="text-sm font-medium">No tasks found</p>
              <p className="text-xs">Try changing the search or filters.</p>
            </div>
          )}
          {loading && shown.length === 0 && <div className="py-16 text-center text-sm text-slate-400">Loading tasks...</div>}
        </div>

        <Pagination page={page} totalPages={totalPages} onChange={setPage} />
      </div>

      <FilterModal
        open={filterOpen}
        onClose={() => setFilterOpen(false)}
        values={filters}
        groups={[
          { key: "sort", title: "Sort by", type: "radio", options: TASK_SORTS },
          { key: "status", title: "Status", type: "chips", options: STATUS_CHOICES },
        ]}
        onApply={(next) => {
          setFilters(next);
          setPage(1);
        }}
        onReset={() => {
          setFilters(DEFAULT_FILTERS);
          setPage(1);
        }}
        extra={
          admin
            ? (draft, set) => (
                <section>
                  <h4 className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-400">Assigned user</h4>
                  <button
                    type="button"
                    onClick={() => setFilterUserPicker(true)}
                    className="flex w-full items-center justify-between rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    {users.find((u) => u._id === draft.assigneeId)?.userName || "Any user"}
                    <UserPlus size={17} className="text-slate-400" />
                  </button>
                  <UserPickerModal
                    open={filterUserPicker}
                    onClose={() => setFilterUserPicker(false)}
                    selectedId={draft.assigneeId}
                    allowClear
                    clearLabel="Any user"
                    title="Filter by user"
                    onSelect={(u) => set("assigneeId", u?._id || "")}
                  />
                </section>
              )
            : undefined
        }
      />

      <TaskFormModal open={formOpen} onClose={() => setFormOpen(false)} onSaved={refresh} />

      <UserPickerModal
        open={Boolean(assigning)}
        onClose={() => setAssigning(null)}
        selectedId={assigning && assigneeId(assigning)}
        title="Assign task"
        subtitle={assigning?.title}
        onSelect={assignTo}
      />
    </div>
  );
}

export default Tasks;
