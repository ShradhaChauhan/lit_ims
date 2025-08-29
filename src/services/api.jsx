import axios from "axios";

const api = axios.create({
  baseURL: "https://backend.litgroupmes.in",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;
