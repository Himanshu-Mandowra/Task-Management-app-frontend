import { userHttp } from "../http";

// Users that belong to the logged in admin
export const getUsers = async () => {
  const response = await userHttp.get("");
  return response.data;
};

export const getUserById = async (userId) => {
  const response = await userHttp.get(`/${userId}`);
  return response.data;
};

export const updateUser = async (userId, data) => {
  const response = await userHttp.post(`/update/${userId}`, data);
  return response.data;
};

export const deleteUser = async (userId) => {
  const response = await userHttp.delete(`/delete/${userId}`);
  return response.data;
};
