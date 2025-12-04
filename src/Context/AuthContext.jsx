import React, { createContext, useState, useEffect, useLayoutEffect, useCallback, useRef } from "react";
import axiosClient from "../config/axiosClient";


export const AuthContext = createContext();

// Thời gian Access Token hết hạn. Backend của bạn dùng config (ví dụ: 7 ngày),
// chúng ta đặt timer refresh trước 9 phút (7 ngày - 9 phút)
const REFRESH_INTERVAL_MS = (7 * 24 * 60 * 60 * 1000) - (9 * 60 * 1000); 

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); 
  const [accessToken, setAccessToken] = useState(null);
  const [loading, setLoading] = useState(true); 
  const refreshIntervalRef = useRef(null);
  
  // Ref để theo dõi request đang được retry
  const isRefreshing = useRef(false);

  // --- HÀM LOGOUT ---
  const logout = useCallback(async () => {
    // Xóa cookie refreshToken trên server (không gửi Access Token vì có thể đã hết hạn)
    try {
        await axiosClient.delete("/auth/delete-token"); 
    } catch (err) {
        console.error("Logout error", err);
    }
    // Xóa state
    if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
    }
    setUser(null);
    setAccessToken(null);
    // LƯU Ý: Không cần xóa localStorage nữa vì không còn lưu token ở đó.
  }, []);


  // --- HÀM LÀM MỚI TOKEN ---
  const refreshAccessToken = useCallback(async () => {
    if (isRefreshing.current) return; // Ngăn ngừa chạy lại khi đang refresh
    isRefreshing.current = true;

    try {
      // Gọi backend. Cookie (refreshToken) được gửi tự động.
      const res = await axiosClient.post("/auth/refresh-token");
      
      const { ID, accessToken: newAccessToken, role, role_id } = res.data.metaData;
      
      setAccessToken(newAccessToken);
      setUser({ ID, role, role_id });
      isRefreshing.current = false;
      return newAccessToken;
    } catch (err) {
      // Nếu Refresh thất bại, xóa phiên làm việc.
      isRefreshing.current = false;
      logout();
      throw err;
    }
  }, [logout]);


  // --- AXIOS INTERCEPTORS (PHẢN ỨNG) ---
  useLayoutEffect(() => {
    // 1. Request Interceptor: Đính kèm Token
    const reqInterceptor = axiosClient.interceptors.request.use(
      (config) => {
        if (accessToken) {
          config.headers.Authorization = `Bearer ${accessToken}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // 2. Response Interceptor: Xử lý lỗi 401
    const resInterceptor = axiosClient.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;
        
        // Nếu lỗi 401 VÀ chưa cố gắng retry VÀ không phải là request refresh token
        if (error.response?.status === 401 && !originalRequest._retry && originalRequest.url !== '/auth/refresh-token') {
          originalRequest._retry = true; 
          
          try {
            // Tạm dừng request, làm mới token
            const newToken = await refreshAccessToken();
            // Đính kèm token mới và retry request gốc
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            return axiosClient(originalRequest); 
          } catch (refreshError) {
            // Nếu refresh thất bại (lỗi 401 từ refresh), session đã kết thúc.
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


  // --- LOGIC KHỞI TẠO VÀ DUY TRÌ (CHỦ ĐỘNG) ---
  useEffect(() => {
    let intervalId;

    // 1. Logic Khởi tạo (Chạy 1 lần khi mount)
    if (loading) {
        const initAuth = async () => {
            try {
                await refreshAccessToken(); // Cố gắng khôi phục session từ cookie
            } catch (err) {
                // Session không tồn tại hoặc hết hạn, đã bị logout.
            } finally {
                setLoading(false);
            }
        };
        initAuth();
    }
    
    // 2. Logic Duy trì (Dùng timer)
    if (accessToken) {
        // Cài đặt interval để refresh trước khi token hết hạn
        intervalId = setInterval(() => {
            console.log("Proactive token refresh...");
            refreshAccessToken();
        }, REFRESH_INTERVAL_MS); 
    }

    // Cleanup
    return () => {
        if (intervalId) {
            clearInterval(intervalId);
        }
    };
}, [loading, accessToken, refreshAccessToken]); 

  // --- LOGIN/LOGOUT Functions ---
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

  return (
    <AuthContext.Provider value={{ user, accessToken, login, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => React.useContext(AuthContext);