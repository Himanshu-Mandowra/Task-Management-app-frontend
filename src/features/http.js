import axios from "axios";

// Shared axios instances. The backend expects the raw JWT in the Authorization header.
export const userHttp = axios.create({ baseURL: import.meta.env.VITE_BASE_URL });
export const taskHttp = axios.create({ baseURL: import.meta.env.VITE_BASE_URL_TASK });

const attachToken = (config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = token;
  return config;
};

[userHttp, taskHttp].forEach((instance) => {
  instance.interceptors.request.use(attachToken);
});

export const errorMessage = (error, fallback = "Something went wrong") =>
  error?.response?.data?.message || error?.response?.data?.mesaage || error?.message || fallback;
