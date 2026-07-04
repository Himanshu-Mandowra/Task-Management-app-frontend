import axios from "axios";

const BASE_URL = import.meta.env.VITE_BASE_URL;

export const getUsers = async () => {
  const token = localStorage.getItem("token");
  console.log("this is base URL: ", BASE_URL);

  const response = await axios.get(BASE_URL, {
    headers: {
      Authorization: token,
    },
  });

  console.log("This is Response form api file: ", response);

  return response.data;
};