import { createContext, useState, useContext, useEffect, useCallback } from "react";
import { useAuth } from "./AuthContext";
import axiosClient from "../config/axiosClient";

const AppDataContext = createContext();

export function AppDataProvider({ children }) {
  const { user, accessToken } = useAuth();

  const [rooms, setRooms] = useState([]);
  const [devices, setDevices] = useState([]);
  const [users, setUsers] = useState([]);
  const [configs, setConfigs] = useState([]);

  // 1. Define the fetch logic in a useCallback so it's stable and reusable
  const refreshData = useCallback(async () => {
    // Don't fetch if not logged in
    if (!user || !accessToken) {
       setRooms([]);
       setDevices([]);
       return; 
    }

    try {
      // console.log("Refreshing App Data..."); // Debugging

      // Fetch shared data (Rooms & Devices)
      const [roomsRes, devicesRes] = await Promise.all([
        axiosClient.get("/study-space"),
        axiosClient.get("/study-space/devices")
      ]);

      setRooms(roomsRes.data?.metaData?.roomList || []);
      setDevices(devicesRes.data?.metaData?.deviceList || []);

      // If admin, fetch protected admin data
      // Note: Backend might return role_name as 'Admin' or role_id as 3
      if (user.role === "Admin" || user.role_name === "Admin") {
        const [usersRes, configsRes] = await Promise.all([
           axiosClient.get("/admin/users"),
           axiosClient.get("/admin/configs")
        ]);

        // Note: Handling the backend inconsistencies (stack vs metaData)
        setUsers(usersRes.data?.stack?.users || usersRes.data?.metaData?.users || []); 
        setConfigs(configsRes.data?.metaData?.configs || []);
      }
    } catch (err) {
      console.error("Error fetching app data:", err);
    }
  }, [user, accessToken]); // Re-create this function only if user/token changes

  // 2. Fetch data automatically on mount (or when user logs in)
  useEffect(() => {
    refreshData();
  }, [refreshData]);

  return (
    <AppDataContext.Provider value={{ 
      rooms, 
      devices, 
      users, 
      configs, 
      setRooms, 
      setDevices, 
      setUsers,
      refreshData // <--- 3. EXPORT THIS FUNCTION
    }}>
      {children}
    </AppDataContext.Provider>
  );
}

export function useAppData() {
  return useContext(AppDataContext);
}