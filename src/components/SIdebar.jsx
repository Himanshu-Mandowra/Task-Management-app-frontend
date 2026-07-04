import { LayoutDashboard, CheckSquare, Users, BarChart3, User, Settings } from "lucide-react";

function Sidebar() {
  return (
    <aside className="fixed inset-y-0 left-0 z-20 w-64 border-r border-[#E2E8F0] bg-white flex flex-col justify-between p-6">
      <div className="space-y-8">
        {/* Logo Brand */}
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
            <CheckSquare size={22} strokeWidth={2.5} />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-gray-900 leading-none">TaskMaster</h1>
            <span className="text-xs font-semibold text-gray-400 block mt-1">Enterprise Admin</span>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="space-y-2">
          <a href="#" className="flex items-center gap-3.5 px-4 py-3.5 text-base font-bold text-blue-600 bg-blue-50 rounded-xl transition-all">
            <LayoutDashboard size={20} />
            Dashboard
          </a>
          <a href="#" className="flex items-center gap-3.5 px-4 py-3.5 text-base font-semibold text-gray-500 hover:text-gray-900 hover:bg-gray-50 rounded-xl transition-all">
            <CheckSquare size={20} />
            Tasks
          </a>
          <a href="#" className="flex items-center gap-3.5 px-4 py-3.5 text-base font-semibold text-gray-500 hover:text-gray-900 hover:bg-gray-50 rounded-xl transition-all">
            <Users size={20} />
            Users
          </a>
          <a href="#" className="flex items-center gap-3.5 px-4 py-3.5 text-base font-semibold text-gray-500 hover:text-gray-900 hover:bg-gray-50 rounded-xl transition-all">
            <BarChart3 size={20} />
            Reports
          </a>
        </nav>
      </div>

      {/* Lower Sidebar Settings */}
      <div className="space-y-2 border-t border-gray-100 pt-5">
        <a href="#" className="flex items-center gap-3.5 px-4 py-3.5 text-base font-semibold text-gray-500 hover:text-gray-900 hover:bg-gray-50 rounded-xl transition-all">
          <User size={20} />
          Profile
        </a>
        <a href="#" className="flex items-center gap-3.5 px-4 py-3.5 text-base font-semibold text-gray-500 hover:text-gray-900 hover:bg-gray-50 rounded-xl transition-all">
          <Settings size={20} />
          Settings
        </a>
      </div>
    </aside>
  );
}

export default Sidebar;