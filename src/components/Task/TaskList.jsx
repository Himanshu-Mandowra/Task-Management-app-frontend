import { Plus } from "lucide-react";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import TaskFilters from "./TaskFilters";
import TaskTable from "./TaskTable";

function TaskList() {
  return (
    <div className="flex min-h-screen bg-[#F8FAFC] text-[#0F172A] font-sans">
      {/* Global Application Navbars & Sidebars */}
      <Sidebar />

      <div className="flex-1 pl-64">
        <Navbar userName="Admin" />

        {/* Dynamic Inner Layout Frame */}
        <main className="p-8 space-y-6 max-w-[1600px] mx-auto">
          {/* Main Title Row */}
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-3xl font-extrabold tracking-tight text-gray-900">All Tasks</h2>
              <p className="text-base text-gray-500 mt-1">Manage, track, and assign project deliverables.</p>
            </div>
            <button className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-base font-bold text-white shadow-md shadow-blue-500/10 hover:bg-blue-700 transition-all active:scale-95 whitespace-nowrap">
              <Plus size={18} strokeWidth={2.5} />
              Create Task
            </button>
          </div>

          {/* Separate Filters Section component */}
          <TaskFilters />

          {/* Separate Data Table Component View */}
          <TaskTable />
        </main>
      </div>
    </div>
  );
}

export default TaskList;