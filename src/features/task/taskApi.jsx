import axios from "axios";

const BASE_URL = import.meta.env.VITE_BASE_URL_TASK;

export const getTaskSummary = async () => {
  const token = localStorage.getItem("token");

  const response = await axios.get(`${BASE_URL}/user-summary`, {
    headers: {
      Authorization: token,
    },
  });

  return response.data;
};
// ✅ Get Activities
export const getActivities = async ({ page = 1, limit = 10 } = {}) => {
  const token = localStorage.getItem("token");

  const response = await axios.get(`${BASE_URL}/activities`, {
    headers: {
      Authorization: token,
    },
    params: {
      page,
      limit,
    },
  });
  console.log(response);

  return response.data;
};

// ✅ Get Tasks
export const getTasks = async ({
  page = 1,
  limit = 10,
  search = "",
  sort = "-createdAt",
  findBy = "",
}) => {
  const token = localStorage.getItem("token");

  const response = await axios.get(`${BASE_URL}`, {
    headers: {
      Authorization: token,
    },
    params: {
      page,
      limit,
      search,
      sort,
      findBy,
    },
  });

  return response.data;
};

export const createTask = async (taskData) => {
  const token = localStorage.getItem("token");

  const response = await axios.post(BASE_URL, taskData, {
    headers: {
      Authorization: token,
    },
  });

  return response.data;
};
