// src/Context/AuthContext.jsx
import React, { useContext, createContext, useState, useEffect, useRef, useCallback } from "react";
import axios from "axios";
import API_BASE_URL from "../config/api";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(
    JSON.parse(localStorage.getItem("user")) || null
  );
  const [accessToken, setAccessToken] = useState(
    localStorage.getItem("accessToken") || null
  );
  
  const refreshIntervalRef = useRef(null);

  // Function to logout
  const logout = useCallback(async () => {
    try {
      const currentAccessToken = localStorage.getItem("accessToken");
      if (currentAccessToken) {
        await axios.delete(`${API_BASE_URL}/auth/delete-token`, {
          headers: { Authorization: `Bearer ${currentAccessToken}` },
          withCredentials: true, // Important: Send cookies with request
        });
      }
    } catch (err) {
      console.error("Logout error:", err.message);
      // Continue with logout even if API call fails
    }

    // Clear interval
    if (refreshIntervalRef.current) {
      clearInterval(refreshIntervalRef.current);
    }

    // Clear state and localStorage
    setUser(null);
    setAccessToken(null);

    localStorage.removeItem("user");
    localStorage.removeItem("accessToken");
  }, []);

  // Function to refresh the access token
  const refreshAccessToken = useCallback(async () => {
    try {
      const currentAccessToken = localStorage.getItem("accessToken");
      
      if (!currentAccessToken) {
        console.log("No access token found, skipping refresh");
        return false;
      }

      // The refresh token is sent automatically via HTTP-only cookie
      const res = await axios.post(
        `${API_BASE_URL}/auth/refresh-token`,
        {},
        {
          withCredentials: true, // Important: Send cookies with request
        }
      );
      
      const { ID, accessToken: newAccessToken, role } = res.data.metaData;
      console.log("Token refreshed successfully");

      // Update state and localStorage with complete user data
      const userData = { ID, accessToken: newAccessToken, role };
      setAccessToken(newAccessToken);
      setUser(userData);
      localStorage.setItem("accessToken", newAccessToken);
      localStorage.setItem("user", JSON.stringify(userData));

      return true;
    } catch (err) {
      console.error("Token refresh failed:", err.response?.data || err.message);
      
      // If refresh fails, logout the user
      logout();
      return false;
    }
  }, [logout]); // Now logout is defined before and included in deps

  // Setup automatic token refresh
  useEffect(() => {
    // Only setup refresh if user is logged in
    if (!accessToken) {
      return;
    }

    // Refresh immediately on mount if token exists
    refreshAccessToken();

    // Setup interval to refresh every 9 minutes (540000ms)
    // We use 9 minutes instead of 10 to refresh before expiration
    refreshIntervalRef.current = setInterval(() => {
      refreshAccessToken();
    }, 9 * 60 * 1000); // 9 minutes

    // Cleanup interval on unmount or when token changes
    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    };
  }, [accessToken, refreshAccessToken]);

  // Handle page visibility changes - refresh when user comes back
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && accessToken) {
        // User came back to the page, refresh token
        refreshAccessToken();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [accessToken, refreshAccessToken]);

  // Function to log in
  const login = async (email, password) => {
    try {
      const res = await axios.post(`${API_BASE_URL}/auth/login`, {
        email,
        password,
      }, {
        withCredentials: true, // Important: Allow cookies to be set
      });

      const { ID, accessToken, role } = res.data.metaData;
     // console.log("Raw login response:", res.data.metaData);

      // Store in state and localStorage
      // Note: refreshToken is stored in HTTP-only cookie by backend
      const userData = { ID, accessToken, role };
      setUser(userData);
      setAccessToken(accessToken);

      localStorage.setItem('user', JSON.stringify(userData));
      localStorage.setItem("accessToken", accessToken);

      return true;
    } catch (err) {
      console.error("Login error:", err.response?.data || err.message);
      return false;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        accessToken,
        login,
        logout,
        refreshAccessToken // Expose this in case you need manual refresh
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  return useContext(AuthContext);
}