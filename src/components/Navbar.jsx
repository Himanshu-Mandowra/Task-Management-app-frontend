import { useState } from "react";
import { Search, LogOut } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { logout } from "../features/auth/authSlice";
import { clearTasks } from "../features/task/taskSlice";
import { clearUsers } from "../features/user/userSlice";
import { initials } from "../utils/taskUtils";

function Navbar() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  const [query, setQuery] = useState("");

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("data");
    dispatch(logout());
    dispatch(clearTasks());
    dispatch(clearUsers());
    navigate("/login", { replace: true });
  };

  const handleSearch = (event) => {
    event.preventDefault();
    const q = query.trim();
    navigate(q ? `/tasks?search=${encodeURIComponent(q)}` : "/tasks");
    setQuery("");
  };

  return (
    <header className="sticky top-0 z-10 flex h-20 w-full items-center justify-between border-b border-slate-200 bg-white px-8">
      <form onSubmit={handleSearch} className="relative w-96 max-w-full">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
        <input
          type="text"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search tasks and press Enter"
          className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-11 pr-4 text-sm outline-none focus:border-blue-500 focus:bg-white"
        />
      </form>

      <div className="flex items-center gap-5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">
            {initials(user?.userName)}
          </div>
          <div className="hidden leading-tight sm:block">
            <span className="block text-sm font-bold text-slate-900">{user?.userName || "User"}</span>
            <span className="block text-xs capitalize text-slate-400">{user?.userRole?.replace("-", " ")}</span>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 hover:border-red-200 hover:bg-red-50 hover:text-red-600"
        >
          <LogOut size={17} /> Logout
        </button>
      </div>
    </header>
  );
}

export default Navbar;
