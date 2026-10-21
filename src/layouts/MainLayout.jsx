import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/SIdebar";
import Navbar from "../components/Navbar";
import { ToastProvider } from "../components/ui/Toast";
import { getCurrentUser } from "../features/auth/authApi";
import { setUser } from "../features/auth/authSlice";
import { loadAppData } from "../features/loadAppData";

function MainLayout() {
  const dispatch = useDispatch();
  const role = useSelector((state) => state.auth.user?.userRole);

  useEffect(() => {
    const init = async () => {
      if (!localStorage.getItem("token")) return;
      let currentRole = role;
      try {
        const me = await getCurrentUser();
        if (me?.data) {
          currentRole = me.data.userRole;
          localStorage.setItem("data", JSON.stringify(me.data));
          dispatch(setUser({ user: me.data }));
        }
      } catch (error) {
        console.error("Could not refresh the current user:", error);
      }
      await loadAppData(dispatch, currentRole);
    };
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch]);

  return (
    <ToastProvider>
      <div className="min-h-screen bg-slate-50 text-slate-900">
        <Sidebar />
        <div className="pl-64">
          <Navbar />
          <main className="mx-auto max-w-[1500px] p-8">
            <Outlet />
          </main>
        </div>
      </div>
    </ToastProvider>
  );
}

export default MainLayout;
