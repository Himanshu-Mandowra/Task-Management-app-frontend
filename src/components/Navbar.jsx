import { Search, Bell, LogOut } from "lucide-react";
import { logout } from "../features/auth/authSlice"; // Assuming logout is an action creator
import { clearTasks } from "../features/task/taskSlice";
import { clearUsers } from "../features/user/userSlice";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";

function Navbar({ userName }) {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleLogout = () => {
    localStorage.removeItem("token");

    dispatch(logout());
    dispatch(clearTasks());
    dispatch(clearUsers());

    navigate("/login", { replace: true });
};

  return (
    <header className="sticky top-0 z-10 flex h-20 w-full items-center justify-between border-b border-[#E2E8F0] bg-white px-8">
      <div className="relative left-[20%] w-96">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
        <input 
          type="text" 
          placeholder="Search anything..." 
          className="w-full rounded-xl border border-gray-200 bg-gray-50/50 py-2.5 pl-11 pr-4 text-base outline-none focus:border-blue-500 focus:bg-white transition-all shadow-sm"
        />
      </div>
      <div className="flex items-center gap-5">
        <button className="relative p-2.5 text-gray-400 hover:text-gray-600 transition-colors bg-gray-50 rounded-xl">
          <Bell size={22} />
          <span className="absolute top-2 right-2 w-2.5 h-2.5 rounded-full bg-red-500" />
        </button>
        <div className="h-10 w-px bg-gray-200" />
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-full bg-blue-600 text-white font-bold text-base flex items-center justify-center border-2 border-white shadow-md">
            {userName?.charAt(0) || "A"}
          </div>
          <span className="text-base font-bold text-gray-800 hidden sm:inline">{userName || "Admin"}</span>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-500 text-white font-bold text-sm hover:bg-red-600 transition-colors shadow-sm shadow-red-500/20"
        >
          <LogOut size={18} /> Logout
        </button>
      </div>
    </header>
  );
}

export default Navbar;