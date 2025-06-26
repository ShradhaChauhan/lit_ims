import axios from "axios";

const api = axios.create({
  baseURL: "http://192.168.2.163:8080",
  withCredentials: true,
});

export default api;
