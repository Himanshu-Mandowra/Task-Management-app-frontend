import { useState } from "react";
import {
  LayoutDashboard,
  Plus,
  AlertCircle,
  FileText,
  User,
  Clock,
  MoreVertical,
  ArrowRight,
} from "lucide-react";
import CreateTaskModal from "../components/Form/CreateTaskModel";
import { useDispatch, useSelector } from "react-redux";
import { createTask } from "../features/task/taskApi";
import { addTask } from "../features/task/taskSlice";

// Custom components import

function formatDate(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function Dashboard() {
  const dispatch = useDispatch();
  const [open, setOpen] = useState(false);

  const taskData = useSelector((state) => state.task.tasks) || [];
  console.log("This is Task Data: ", taskData);
  const summary = useSelector((state) => state.task.summary) || {};
  const activities = useSelector((state) => state.task.activities);
  console.log("This is Activity Data: ", activities);

  let gridValue = 4; // Default for non-admin users
  console.log(summary);

  const stats = [
    {
      id: 1,
      label: "Total Tasks",
      value: summary.TotalTasks ?? 0,
      icon: LayoutDashboard,
      iconBg: "bg-blue-50",
      iconColor: "text-blue-600",
      percentage: "+12%",
      percentageBg: "bg-green-100",
      percentageColor: "text-green-800",
      showPercentage: true,
    },
    {
      id: 2,
      label: "Assigned To Me",
      value: summary.assignedTasksCount ?? 0,
      icon: User,
      iconBg: "bg-purple-50",
      iconColor: "text-purple-600",
      showPercentage: false,
    },
    {
      id: 3,
      label: "Created By Me",
      value: summary.CreatedTasksCount ?? 0,
      icon: FileText,
      iconBg: "bg-orange-50",
      iconColor: "text-orange-600",
      showPercentage: false,
    },
    {
      id: 4,
      label: "Overdue Tasks",
      value:
        taskData.filter((t) => t.status === "expired" || t.status === "overdue")
          .length || 0,
      icon: AlertCircle,
      iconBg: "bg-red-100",
      iconColor: "text-red-600",
      attention: true,
      attentionBg: "bg-red-50/40",
    },
  ];

  if (summary?.userRole === "admin" || summary?.userRole === "super-admin") {
    gridValue = 5; // Set to 5 for admin/super-admin
    stats.splice(2, 0, {
      id: 5,
      label: "Total Users",
      value: summary?.totalUsers ?? 0,
      icon: User,
      iconBg: "bg-green-50",
      iconColor: "text-green-600",
      showPercentage: false,
    });
  }

  const getStatusStyle = (status) => {
    switch (status?.toLowerCase()) {
      case "completed":
        return "bg-green-100 text-green-800 border border-green-200";
      case "expired":
      case "overdue":
        return "bg-red-100 text-red-800 border border-red-200";
      case "in progress":
        return "bg-blue-100 text-blue-800 border border-blue-200";
      default:
        return "bg-gray-100 text-gray-800 border border-gray-200";
    }
  };

  const handleCreateTask = async (data) => {
    try {
      const res = await createTask(data);

      dispatch(addTask(res.data));
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className="flex min-h-screen p-6 bg-[#F8FAFC] text-[#0F172A] font-sans">
      {/* RIGHT MAIN CONTAINER */}
      <div className="flex-1 pl-64">
        {/* MAIN CONTENT AREA */}
        <main className=" max-w-[1600px] mx-auto">
          {/* Header Row */}
          <div className="flex mb-2 items-center justify-between">
            <div>
              <h2 className="text-3xl font-extrabold tracking-tight text-gray-900">
                Overview
              </h2>
              <p className="text-base text-gray-500 mt-1">
                Here's what's happening with your projects today.
              </p>
            </div>
            <button
              onClick={() => setOpen(!open)}
              className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-base font-bold text-white shadow-md shadow-blue-500/10 hover:bg-blue-700 transition-all active:scale-95"
            >
              <Plus size={18} strokeWidth={2.5} />
              New Task
            </button>
          </div>

          {/* STATS TILES GRID */}
          <div
            className={`grid grid-cols-1 mb-4 sm:grid-cols-2 lg:grid-cols-3 ${
              gridValue === 5 ? "xl:grid-cols-5" : "xl:grid-cols-4"
            } gap-6`}
          >
            {stats.map((stat) => (
              <div
                key={stat.id}
                className={`${stat.attention ? stat.attentionBg : "bg-white"} border ${stat.attention ? "border-red-100" : "border-gray-200"} p-6 rounded-2xl shadow-sm`}
              >
                <div className="flex items-center justify-between">
                  <div
                    className={`p-3 ${stat.iconBg} rounded-xl ${stat.iconColor}`}
                  >
                    <stat.icon size={22} />
                  </div>
                  {stat.showPercentage && (
                    <span
                      className={`text-xs font-bold px-2.5 py-1 ${stat.percentageBg} ${stat.percentageColor} rounded-full`}
                    >
                      {stat.percentage}
                    </span>
                  )}
                  {stat.attention && (
                    <span className="text-xs font-bold tracking-wide uppercase px-2.5 py-1 bg-red-100 text-red-700 rounded-md">
                      Attention
                    </span>
                  )}
                </div>
                <p
                  className={`text-4xl font-extrabold mt-4 tracking-tight ${stat.attention ? "text-red-600" : ""}`}
                >
                  {stat.value}
                </p>
                <p
                  className={`text-base font-semibold mt-1 ${stat.attention ? "text-red-700/70 font-bold" : "text-gray-400"}`}
                >
                  {stat.label}
                </p>
              </div>
            ))}
          </div>

          {/* CHARTS & STATS GRAPH ROWS */}
          <div className="grid grid-cols-1 mb-4 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white border border-gray-200 p-6 rounded-2xl shadow-sm flex flex-col justify-between min-h-[340px]">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-gray-900">
                  Weekly Task Activity
                </h3>
                <button className="text-gray-400 hover:text-gray-600">
                  <MoreVertical size={20} />
                </button>
              </div>
              <div className="h-48 w-full flex items-end justify-between px-4 border-b border-gray-100 pb-3 text-sm font-semibold text-gray-400">
                {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(
                  (day, idx) => (
                    <div
                      key={day}
                      className="flex flex-col items-center gap-2 flex-1 group cursor-pointer"
                    >
                      <div
                        className="w-8 bg-gray-100 rounded-t-md group-hover:bg-blue-200 transition-colors relative"
                        style={{
                          height: `${[40, 55, 95, 60, 80, 30, 45][idx]}px`,
                        }}
                      >
                        {day === "Wed" && (
                          <div className="absolute inset-0 bg-blue-600 rounded-t-md" />
                        )}
                      </div>
                      <span
                        className={
                          day === "Wed" ? "text-gray-900 font-bold" : ""
                        }
                      >
                        {day}
                      </span>
                    </div>
                  ),
                )}
              </div>
            </div>

            {/* Radial Status Chart */}
            <div className="bg-white border border-gray-200 p-6 rounded-2xl shadow-sm flex flex-col items-center justify-between">
              <div className="w-full flex items-center justify-between">
                <h3 className="text-lg font-bold text-gray-900">Task Status</h3>
              </div>
              <div className="relative w-40 h-40 flex items-center justify-center my-4">
                <svg
                  className="absolute w-full h-full transform -rotate-90"
                  viewBox="0 0 100 100"
                >
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    stroke="#F1F5F9"
                    strokeWidth="8"
                    fill="transparent"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    stroke="#2563EB"
                    strokeWidth="8"
                    fill="transparent"
                    strokeDasharray="251.2"
                    strokeDashoffset="110"
                    strokeLinecap="round"
                  />
                </svg>
                <div className="text-center">
                  <p className="text-3xl font-black tracking-tight">
                    {summary.TotalTasks ?? 0}
                  </p>
                  <p className="text-xs font-bold text-gray-400 tracking-wider uppercase mt-1">
                    Total
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-x-4 gap-y-2 w-full text-xs font-bold text-gray-500 pt-3 border-t border-gray-50">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-blue-600" /> In
                  Progress
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-gray-300" />{" "}
                  Remaining
                </div>
              </div>
            </div>
          </div>

          {/* LOWER SECTION: DATA TABLE & TIMELINE */}
          <div className="grid grid-cols-1 mb-4 lg:grid-cols-3 gap-6">
            {/* DATA TABLE */}
            <div className="lg:col-span-2 bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden flex flex-col justify-between">
              <div>
                <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                  <h3 className="text-lg font-bold text-gray-900">
                    Recent Tasks
                  </h3>
                  <a
                    href="#"
                    className="text-sm font-bold text-blue-600 hover:underline inline-flex items-center gap-1"
                  >
                    View All <ArrowRight size={16} />
                  </a>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-gray-50/70 border-b border-gray-100 text-xs font-bold uppercase tracking-wider text-gray-400">
                        <th className="py-4 px-6">Title</th>
                        <th className="py-4 px-4">Assigned</th>
                        <th className="py-4 px-4">Status</th>
                        <th className="py-4 px-4">Due Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50 text-sm text-gray-600">
                      {taskData.slice(0, 5).map((task) => (
                        <tr
                          key={task._id}
                          className="hover:bg-gray-50/40 transition-colors"
                        >
                          <td className="py-4 px-6 max-w-xs">
                            <div className="font-bold text-gray-900 text-sm">
                              {task.title}
                            </div>
                            <div className="text-sm text-gray-400 truncate mt-0.5">
                              {task.description}
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-2.5">
                              <div className="w-7 h-7 rounded-full bg-orange-600 text-white font-bold text-xs flex items-center justify-center">
                                {(
                                  task.assignedTo?.userName ||
                                  task.assignedName ||
                                  "U"
                                ).charAt(0)}
                              </div>
                              <span className="font-semibold text-gray-700">
                                {task.assignedTo?.userName ||
                                  task.assignedName ||
                                  "—"}
                              </span>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <span
                              className={`text-xs font-bold uppercase tracking-wide px-3 py-1.5 rounded-full ${getStatusStyle(task.status)}`}
                            >
                              {task.status === "expired"
                                ? "Overdue"
                                : task.status}
                            </span>
                          </td>
                          <td className="py-4 px-4 font-semibold text-gray-500">
                            {formatDate(task.dueDate)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* ACTIVITY FEED */}
            <div className="space-y-6 relative before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-100">
              {activities.slice(0, 5).map((activity) => (
                <div
                  key={activity._id}
                  className="flex gap-4 items-start relative z-10"
                >
                  <div className="w-6 h-6 rounded-full bg-blue-500 border-4 border-white shadow-sm shrink-0" />

                  <div>
                    <p className="text-base font-medium text-gray-600">
                      <strong className="text-gray-900 font-bold">
                        {activity.userId?.userName}
                      </strong>{" "}
                      {activity.action.replaceAll("_", " ").toLowerCase()}{" "}
                      <span className="text-blue-600 font-semibold">
                        {activity.taskId?.title}
                      </span>
                    </p>

                    <span className="text-xs font-semibold text-gray-400 flex items-center gap-1 mt-1">
                      <Clock size={14} />
                      {formatDate(activity.createdAt)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>
        {open && (
          <CreateTaskModal
            isOpen={open}
            onClose={() => setOpen(false)}
            // onSubmitTask={fetchTasks} // This line was commented out or removed in the original
            usersList={[]}
            onSubmitTask={handleCreateTask}
          />
        )}
      </div>
    </div>
  );
}

export default Dashboard;
