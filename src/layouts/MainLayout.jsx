import { useEffect } from "react";
import { useDispatch } from "react-redux";
import {
  getActivities,
  getTaskSummary,
  getTasks,
} from "../features/task/taskApi";
import {
  setActivities,
  setTaskSummary,
  setTasks,
} from "../features/task/taskSlice";
import { getUsers } from "../features/user/userApi";
import { setUsers } from "../features/user/userSlice";
import Sidebar from "../components/SIdebar";
import Navbar from "../components/Navbar";
import { Outlet } from "react-router-dom";

function MainLayout() {
  const dispatch = useDispatch();

  const filters = {
    // Define default filter values
    page: 1,
    limit: 10,
    sort: "-createdAt",
    findBy: "",
    search: "",
  };

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const token = localStorage.getItem("token");

        if (!token) return;

        const [summaryRes, tasksRes, usersRes, activitiesRes] =
          await Promise.all([
            getTaskSummary(),
            getTasks(filters),
            getUsers(),
            getActivities(),
          ]);

        console.log("This is Activities: ", activitiesRes);

        if (summaryRes?.pagination) {
          dispatch(
            setTaskSummary({
              summary: summaryRes.pagination,
            }),
          );
        }

        if (tasksRes?.data) {
          dispatch(setTasks(tasksRes.data));
        }

        if (activitiesRes?.data) {
          dispatch(setActivities(activitiesRes.data));
        }

        if (usersRes?.data) {
          dispatch(setUsers(usersRes.data));
        }
      } catch (error) {
        console.error("Error loading initial data:", error);
      }
    };

    loadInitialData();
  }, [dispatch]);

  return (
    <div className="flex">
      <Sidebar />

      <div className="flex-1">
        <Navbar />

        <Outlet />
      </div>
    </div>
  );
}

export default MainLayout;
// export default MainLayout
