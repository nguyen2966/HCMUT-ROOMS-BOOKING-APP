// src/Context/AuthContext.jsx
import React, { createContext, useState, useEffect, useLayoutEffect, useCallback } from "react";
import axiosClient from "../config/axiosClient";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const [loading, setLoading] = useState(true); // New: Prevent app from rendering before checking auth

  // Function to refresh the access token
  const refreshAccessToken = useCallback(async () => {
    try {
      // Call backend to refresh token (uses HTTP-only cookie)
      const res = await axiosClient.post("/auth/refresh-token");
      
      const { ID, accessToken: newAccessToken, role, role_id } = res.data.metaData;
      
      setAccessToken(newAccessToken);
      setUser({ ID, role, role_id });
      return newAccessToken;
    } catch (err) {
      // If refresh fails (e.g., expired cookie), clear state
      setAccessToken(null);
      setUser(null);
      throw err;
    }
  }, []);

  // Setup Axios Interceptors (The "Smart" Refresh Strategy)
  useLayoutEffect(() => {
    // Request Interceptor: Attach Token
    const reqInterceptor = axiosClient.interceptors.request.use(
      (config) => {
        if (accessToken) {
          config.headers.Authorization = `Bearer ${accessToken}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response Interceptor: Handle 401 (Expired Token)
    const resInterceptor = axiosClient.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        // If 401 Unauthorized and we haven't retried yet
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true; // Mark as retried
          
          try {
            const newToken = await refreshAccessToken();
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            return axiosClient(originalRequest); // Retry original request
          } catch (refreshError) {
            // If refresh fails, strictly logout
            return Promise.reject(refreshError);
          }
        }
        return Promise.reject(error);
      }
    );

    return () => {
      axiosClient.interceptors.request.eject(reqInterceptor);
      axiosClient.interceptors.response.eject(resInterceptor);
    };
  }, [accessToken, refreshAccessToken]);

  // Initial Auth Check on App Load
  useEffect(() => {
    const initAuth = async () => {
      try {
        await refreshAccessToken();
      } catch (err) {
        console.log("User not logged in (or session expired).");
      } finally {
        setLoading(false);
      }
    };
    initAuth();
  }, [refreshAccessToken]);

  const login = async (email, password) => {
    try {
      const res = await axiosClient.post("/auth/login", { email, password });
      const { ID, accessToken, role, role_id } = res.data.metaData;
      
      setUser({ ID, role, role_id });
      setAccessToken(accessToken);
      return true;
    } catch (err) {
      console.error("Login error:", err.response?.data || err.message);
      return false;
    }
  };

  const logout = async () => {
    try {
      await axiosClient.post("/auth/delete-token"); // Changed from DELETE to POST to match common patterns, check backend router
    } catch (err) {
      console.error("Logout error", err);
    }
    setUser(null);
    setAccessToken(null);
  };

  return (
    <AuthContext.Provider value={{ user, accessToken, login, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => React.useContext(AuthContext);