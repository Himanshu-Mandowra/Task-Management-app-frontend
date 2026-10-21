import { NavLink } from "react-router-dom";
import { useSelector } from "react-redux";
import { LayoutDashboard, CheckSquare, Users } from "lucide-react";
import { isAdminRole } from "../features/loadAppData";

const linkClass = ({ isActive }) =>
  `flex items-center gap-3.5 rounded-xl px-4 py-3.5 text-base font-semibold ${
    isActive ? "bg-blue-50 font-bold text-blue-600" : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
  }`;

function Sidebar() {
  const role = useSelector((state) => state.auth.user?.userRole);

  return (
    <aside className="fixed inset-y-0 left-0 z-20 flex w-64 flex-col justify-between border-r border-slate-200 bg-white p-6">
      <div className="space-y-8">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 text-white">
            <CheckSquare size={22} strokeWidth={2.5} />
          </div>
          <div>
            <h1 className="text-lg font-bold leading-none tracking-tight text-slate-900">TaskMaster</h1>
            <span className="mt-1 block text-xs font-semibold capitalize text-slate-400">
              {role ? role.replace("-", " ") : "Workspace"}
            </span>
          </div>
        </div>

        <nav className="space-y-2">
          <NavLink to="/" end className={linkClass}>
            <LayoutDashboard size={20} /> Dashboard
          </NavLink>
          <NavLink to="/tasks" className={linkClass}>
            <CheckSquare size={20} /> Tasks
          </NavLink>
          {isAdminRole(role) && (
            <NavLink to="/users" className={linkClass}>
              <Users size={20} /> Users
            </NavLink>
          )}
        </nav>
      </div>
    </aside>
  );
}

export default Sidebar;
