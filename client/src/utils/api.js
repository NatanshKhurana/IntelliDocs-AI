// Axios instance - all API calls go through here
// withCredentials: true → browser sends HTTP-only cookie automatically

import axios from "axios";

const api = axios.create({
  // Vite proxy OR direct server URL
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  withCredentials: true,
});

export default api;
