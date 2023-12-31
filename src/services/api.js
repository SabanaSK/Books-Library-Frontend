import axios from "axios";
import { autoLogin } from "./userServices.js";

const instance = axios.create({
  baseURL: "/api",
});

instance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = token;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

instance.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    if (error.response && error.response.status === 401) {
      if (error.response.data.message === "Token is not valid") {
        if (!originalRequest._retry) {
          originalRequest._retry = true;
          try {
            const response = await autoLogin(); 
            const newToken = response.data.accessToken; 
            localStorage.setItem("accessToken", newToken); 
            originalRequest.headers["Authorization"] = newToken; 
            return instance(originalRequest);
          } catch (autoLoginError) {
            localStorage.removeItem("accessToken");
            window.location.href = "/";
            return Promise.reject(autoLoginError);
          }
        }
      } else {
        window.location.href = "/";
      }
    }

    return Promise.reject(error);
  }
);

export default instance;
