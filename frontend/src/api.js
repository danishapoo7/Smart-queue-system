import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000"
});

// 🔥 Attach token automatically
api.interceptors.request.use(config => {
  const token = sessionStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// 🔥 Handle expired token
api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      sessionStorage.clear();
      window.location.href = "/";
    }
    return Promise.reject(err);
  }
);

export default api;