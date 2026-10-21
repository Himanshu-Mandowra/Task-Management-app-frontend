import { getActivities, getTasks, getTaskSummary } from "./task/taskApi";
import { getUsers } from "./user/userApi";
import { setActivities, setTaskSummary, setTasks } from "./task/taskSlice";
import { setUsers } from "./user/userSlice";

export const isAdminRole = (role) => role === "admin" || role === "super-admin";

// Loads everything the shell needs. Called on start and after every change.
export const loadAppData = async (dispatch, role) => {
  const admin = isAdminRole(role);
  const [summary, tasks, users, activities] = await Promise.allSettled([
    getTaskSummary(),
    getTasks({ page: 1, limit: 1000, sort: "-createdAt" }),
    admin ? getUsers() : Promise.resolve(null),
    getActivities({ page: 1, limit: 30 }),
  ]);

  if (summary.status === "fulfilled" && summary.value?.pagination) {
    dispatch(setTaskSummary({ summary: summary.value.pagination }));
  }
  if (tasks.status === "fulfilled") dispatch(setTasks(tasks.value?.data || []));
  if (users.status === "fulfilled" && users.value?.data) dispatch(setUsers(users.value.data));
  if (activities.status === "fulfilled") dispatch(setActivities(activities.value?.data || []));
};
