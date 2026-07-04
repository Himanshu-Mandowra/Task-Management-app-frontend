import axios from "axios";

const BASE_URL = import.meta.env.VITE_BASE_URL;

export const registerUser = async (
    userData
) => {

    const response =
        await axios.post(
            `${BASE_URL}/register`,
            userData
        );

    return response.data;
};

export const loginUser = async (
    userData
) => {

    const response =
        await axios.post(
            `${BASE_URL}/login`,
            userData
        );

    return response.data;
};

export const getCurrentUser = async () => {

    const token =
        localStorage.getItem("token");

    const response =
        await axios.get(
            `${BASE_URL}/me`,
            {
                headers: {
                    Authorization: token
                }
            }
        );

    return response.data;
};