import axios from "axios";
import API_BASE_URL from "./api";

const axiosClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Important: Sends cookies (refreshToken) with every request
  headers: {
    "Content-Type": "application/json",
  },
});

export default axiosClient;