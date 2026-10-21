import { userHttp } from "../http";

// Admin / super-admin creates an admin or a user
export const registerUser = async (userData) => {
  const response = await userHttp.post("/register", userData);
  return response.data;
};

export const loginUser = async (userData) => {
  const response = await userHttp.post("/login", userData);
  return response.data;
};

export const getCurrentUser = async () => {
  const response = await userHttp.get("/me");
  return response.data;
};
