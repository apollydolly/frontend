import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

export const authClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

authClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

authClient.interceptors.response.use(
  (response) => {
    console.log(
      "[Response Interceptor] Success:",
      response.status,
      response.config.url
    );

    if (response.data && response.data.code === 10004) {
      localStorage.removeItem("access_token");
      const currentPath = window.location.pathname;

      if (currentPath !== "/login") {
        console.log("Redirecting to /login");
        window.location.href = "/login";
        return Promise.reject(new Error("Token expired - redirected to login"));
      }
    }

    return response;
  },
  (error) => {
    if (
      error.response?.status === 401 ||
      error.response?.data?.code === 10004
    ) {
      localStorage.removeItem("access_token");
      const currentPath = window.location.pathname;

      if (currentPath !== "/login") {
        window.location.href = "/login";
        return Promise.reject(new Error("Token expired - redirected to login"));
      }
    }

    return Promise.reject(error);
  }
);
