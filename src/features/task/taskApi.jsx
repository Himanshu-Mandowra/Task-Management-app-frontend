import { taskHttp } from "../http";

export const getTaskSummary = async () => {
  const response = await taskHttp.get("/user-summary");
  return response.data;
};

export const getActivities = async ({ page = 1, limit = 10 } = {}) => {
  const response = await taskHttp.get("/activities", { params: { page, limit } });
  return response.data;
};

export const getTasks = async ({
  page = 1,
  limit = 10,
  search = "",
  sort = "-createdAt",
  findBy = "",
} = {}) => {
  const response = await taskHttp.get("", {
    params: { page, limit, search, sort, findBy },
  });
  return response.data;
};

export const getTaskById = async (taskId) => {
  const response = await taskHttp.get(`/${taskId}`);
  return response.data;
};

// Admin creates a task (optionally with assignedTo)
export const createTask = async (taskData) => {
  const response = await taskHttp.post("", taskData);
  return response.data;
};

// Non admin users create a task for themselves
export const createEmployeeTask = async (taskData) => {
  const response = await taskHttp.post("/employee-create", taskData);
  return response.data;
};

export const updateTask = async (taskId, data) => {
  const response = await taskHttp.put(`/update/${taskId}`, data);
  return response.data;
};

export const updateTaskStatus = async (taskId, status) => {
  const response = await taskHttp.patch(`/status/${taskId}`, { status });
  return response.data;
};

export const assignTask = async (taskId, userId) => {
  const response = await taskHttp.patch(`/assign/${taskId}`, { assignTo: userId });
  return response.data;
};

export const deleteTask = async (taskId) => {
  const response = await taskHttp.delete(`/delete/${taskId}`);
  return response.data;
};
