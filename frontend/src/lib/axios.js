import axios from "axios";

export const axiosInstance = axios.create({
    baseURL:import.meta.env.MODE === "developement" ? "https://chat-app-backend-lpmu.onrender.com/api":"https://chat-app-backend-lpmu.onrender.com/api",
    withCredentials:true,
});
