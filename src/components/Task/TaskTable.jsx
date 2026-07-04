import { ChevronLeft, ChevronRight } from "lucide-react";

const SAMPLE_TASKS = [
  {
    id: 1,
    title: "Migrate Database to v4 Cluster",
    description: "Execute zero-downtime migration f...",
    assignee: "Alex R.",
    status: "IN PROGRESS",
    priority: "HIGH",
    dueDate: "Due: Oct 24",
    createdDate: "Created: Oct 20",
  },
  {
    id: 2,
    title: "Design System Accessibility Audit",
    description: "Review all shared components for...",
    assignee: "Sarah C.",
    status: "TO DO",
    priority: "MEDIUM",
    dueDate: "Due: Oct 28",
    createdDate: "Created: Oct 21",
  },
  {
    id: 3,
    title: "Finalize Q3 Marketing Assets",
    description: "Approve final renders for social medi...",
    assignee: "Mike K.",
    status: "DONE",
    priority: "LOW",
    dueDate: "Due: Oct 15",
    createdDate: "Created: Sep 30",
    isDone: true,
  },
];

function TaskTable({ tasks = SAMPLE_TASKS }) {
  const getStatusStyle = (status) => {
    switch (status) {
      case "IN PROGRESS":
        return "bg-blue-50 text-blue-600 font-bold border border-blue-100 text-[11px] tracking-wider";
      case "TO DO":
        return "bg-gray-100 text-gray-600 font-bold text-[11px] tracking-wider";
      case "DONE":
        return "bg-slate-200 text-slate-600 font-bold text-[11px] tracking-wider";
      default:
        return "bg-gray-50 text-gray-600";
    }
  };

  const getPriorityStyle = (priority) => {
    switch (priority) {
      case "HIGH":
        return "bg-red-50 text-red-600 border border-red-100";
      case "MEDIUM":
        return "bg-orange-50 text-orange-700 border border-orange-100";
      case "LOW":
        return "bg-slate-100 text-slate-600";
      default:
        return "bg-gray-50 text-gray-600";
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50/60 border-b border-gray-200 text-xs font-bold uppercase tracking-wider text-gray-400">
              <th className="py-4 px-6 min-w-[280px]">Task Details</th>
              <th className="py-4 px-4">Assignee</th>
              <th className="py-4 px-4">Status</th>
              <th className="py-4 px-4">Priority</th>
              <th className="py-4 px-4">Dates</th>
              <th className="py-4 px-6 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-base text-gray-600">
            {tasks.map((task) => (
              <tr key={task.id} className="hover:bg-gray-50/30 transition-colors">
                {/* Details */}
                <td className="py-5 px-6">
                  <div className={`font-bold text-gray-900 text-base ${task.isDone ? "line-through text-gray-400" : ""}`}>
                    {task.title}
                  </div>
                  <div className="text-sm text-gray-400 mt-1">{task.description}</div>
                </td>
                
                {/* Assignee */}
                <td className="py-5 px-4 whitespace-nowrap">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-slate-200 text-gray-700 font-bold text-xs flex items-center justify-center">
                      {task.assignee.charAt(0)}
                    </div>
                    <span className="font-semibold text-gray-700">{task.assignee}</span>
                  </div>
                </td>

                {/* Status Badge */}
                <td className="py-5 px-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-black ${getStatusStyle(task.status)}`}>
                    {task.status}
                  </span>
                </td>

                {/* Priority Badge */}
                <td className="py-5 px-4">
                  <span className={`px-2.5 py-1 rounded-lg text-xs font-bold inline-flex items-center gap-1 ${getPriorityStyle(task.priority)}`}>
                    {task.priority === "HIGH" && "▲"}
                    {task.priority === "MEDIUM" && "▲"}
                    {task.priority}
                  </span>
                </td>

                {/* Due Dates */}
                <td className="py-5 px-4 text-sm font-medium text-gray-500 whitespace-nowrap">
                  <div className="font-semibold text-gray-700">{task.dueDate}</div>
                  <div className="text-xs text-gray-400 mt-0.5">{task.createdDate}</div>
                </td>

                {/* Empty Actions context placeholder */}
                <td className="py-5 px-6 text-right" />
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination Block footer */}
      <div className="p-5 border-t border-gray-100 flex items-center justify-between flex-wrap gap-4 bg-white">
        <p className="text-base text-gray-500">
          Showing <strong className="font-bold text-gray-900">1</strong> to <strong className="font-bold text-gray-900">3</strong> of <strong className="font-bold text-gray-900">42</strong> results
        </p>
        <div className="flex items-center gap-1.5">
          <button className="p-2.5 rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-400 transition-colors">
            <ChevronLeft size={16} />
          </button>
          <button className="w-10 h-10 rounded-xl bg-blue-600 text-white font-bold text-sm">1</button>
          <button className="w-10 h-10 rounded-xl border border-transparent hover:border-gray-200 text-gray-600 font-bold text-sm transition-colors">2</button>
          <button className="w-10 h-10 rounded-xl border border-transparent hover:border-gray-200 text-gray-600 font-bold text-sm transition-colors">3</button>
          <span className="px-1 text-gray-400 font-bold text-sm">...</span>
          <button className="w-10 h-10 rounded-xl border border-transparent hover:border-gray-200 text-gray-600 font-bold text-sm transition-colors">5</button>
          <button className="p-2.5 rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-400 transition-colors">
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}

export default TaskTable;