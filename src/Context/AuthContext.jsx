import React, { createContext, useState, useEffect, useLayoutEffect, useCallback, useRef } from "react";
import axiosClient from "../config/axiosClient";

export const AuthContext = createContext();

const REFRESH_INTERVAL_MS = (7 * 24 * 60 * 60 * 1000) - (9 * 60 * 1000); 

// Simple localStorage helpers
const saveAuthData = (userData, token) => {
  try {
    localStorage.setItem('user_session', JSON.stringify(userData));
    localStorage.setItem('access_token', token);
  } catch (err) {
    console.error("Failed to save auth data:", err);
  }
};

const getAuthData = () => {
  try {
    const user = localStorage.getItem('user_session');
    const token = localStorage.getItem('access_token');
    return {
      user: user ? JSON.parse(user) : null,
      token: token || null
    };
  } catch (err) {
    console.error("Failed to get auth data:", err);
    return { user: null, token: null };
  }
};

const clearAuthData = () => {
  try {
    localStorage.removeItem('user_session');
    localStorage.removeItem('access_token');
  } catch (err) {
    console.error("Failed to clear auth data:", err);
  }
};

export const AuthProvider = ({ children }) => {
  // Initialize from localStorage
  const [user, setUser] = useState(() => getAuthData().user); 
  const [accessToken, setAccessToken] = useState(() => getAuthData().token);
  const [loading, setLoading] = useState(true);
  const refreshIntervalRef = useRef(null);
  const isRefreshing = useRef(false);

  // --- LOGOUT ---
  const logout = useCallback(async () => {
    try {
        await axiosClient.delete("/auth/delete-token"); 
    } catch (err) {
        console.error("Logout error", err);
    }
    
    if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
    }
    
    setUser(null);
    setAccessToken(null);
    clearAuthData();
  }, []);

  // --- REFRESH TOKEN ---
  const refreshAccessToken = useCallback(async () => {
    if (isRefreshing.current) return;
    isRefreshing.current = true;

    try {
      const res = await axiosClient.post("/auth/refresh-token");
      const { ID, accessToken: newAccessToken, role, role_id } = res.data.metaData;
      
      const userData = { ID, role, role_id };
      
      setAccessToken(newAccessToken);
      setUser(userData);
      saveAuthData(userData, newAccessToken);
      
      isRefreshing.current = false;
      return newAccessToken;
    } catch (err) {
      isRefreshing.current = false;
      logout();
      throw err;
    }
  }, [logout]);

  // --- AXIOS INTERCEPTORS ---
  useLayoutEffect(() => {
    const reqInterceptor = axiosClient.interceptors.request.use(
      (config) => {
        if (accessToken) {
          config.headers.Authorization = `Bearer ${accessToken}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    const resInterceptor = axiosClient.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;
        
        if (error.response?.status === 401 && !originalRequest._retry && originalRequest.url !== '/auth/refresh-token') {
          originalRequest._retry = true; 
          
          try {
            const newToken = await refreshAccessToken();
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            return axiosClient(originalRequest); 
          } catch (refreshError) {
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

  // --- INITIALIZATION ---
  useEffect(() => {
    const initAuth = async () => {
      const stored = getAuthData();
      
      // If we have stored data, try to refresh the token
      if (stored.user && stored.token) {
        try {
          await refreshAccessToken();
        } catch (err) {
          console.log("Session expired");
          clearAuthData();
          setUser(null);
          setAccessToken(null);
        }
      }
      
      setLoading(false);
    };
    
    initAuth();
  }, [refreshAccessToken]);

  // --- TOKEN MAINTENANCE ---
  useEffect(() => {
    if (accessToken && !loading) {
      const intervalId = setInterval(() => {
        console.log("Proactive token refresh...");
        refreshAccessToken();
      }, REFRESH_INTERVAL_MS);
      
      refreshIntervalRef.current = intervalId;

      return () => {
        clearInterval(intervalId);
      };
    }
  }, [accessToken, loading, refreshAccessToken]);

  // --- LOGIN ---
  const login = async (email, password) => {
    try {
      const res = await axiosClient.post("/auth/login", { email, password });
      const { ID, accessToken, role, role_id } = res.data.metaData;
      
      const userData = { ID, role, role_id };
      
      setUser(userData);
      setAccessToken(accessToken);
      saveAuthData(userData, accessToken);
      
      return true;
    } catch (err) {
      console.error("Login error:", err.response?.data || err.message);
      return false;
    }
  };

  return (
    <AuthContext.Provider value={{ user, accessToken, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => React.useContext(AuthContext);