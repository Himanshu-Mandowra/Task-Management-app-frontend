import { displayStatus } from "../../utils/taskUtils";

const STYLES = {
  pending: "bg-yellow-100 text-yellow-800",
  "in progress": "bg-blue-100 text-blue-700",
  completed: "bg-green-100 text-green-700",
  overdue: "bg-red-100 text-red-700",
  expired: "bg-red-100 text-red-700",
};

function StatusBadge({ task, status }) {
  const value = status || displayStatus(task);
  return (
    <span
      className={`inline-block whitespace-nowrap rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide ${
        STYLES[value] || "bg-slate-100 text-slate-600"
      }`}
    >
      {value}
    </span>
  );
}

export default StatusBadge;
