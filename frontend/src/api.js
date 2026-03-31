import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000"
});

// Attach token automatically
api.interceptors.request.use(config => {
  const token = sessionStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

//  Hybrid response handler
api.interceptors.response.use(
  res => res,
  err => {
    const token = sessionStorage.getItem("token");

    // ONLY handle expired session (not login errors)
    if (err.response?.status === 401 && token) {
      sessionStorage.clear();
      window.location.href = "/";
    }

    return Promise.reject(err); // pass error to component
  }
);

export default api;