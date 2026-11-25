import axios from "axios";

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3000/api",
  headers: { "Content-Type": "application/json" },
  timeout: 15000,
});

apiClient.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token =
      window.localStorage.getItem("taskadoo-token") ??
      window.sessionStorage.getItem("taskadoo-token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default apiClient;
