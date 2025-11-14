import { createContext, useState, useContext, useEffect } from "react";
import { useAuth } from "./AuthContext";

const AppDataContext = createContext();

export function AppDataProvider({ children }) {
  const { user } = useAuth();

  const [rooms, setRooms] = useState([]);
  const [devices, setDevices] = useState([]);
  const [users, setUsers] = useState([]);
  const [configs, setConfigs] = useState([]);

  useEffect(() => {
    if (!user) return;

      const fetchData = async () => {
      try {
        const token = user?.accessToken; // get token from AuthContext

        const headers = {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        };

        // Fetch shared data
        const roomsRes = await fetch("http://localhost:3069/study-space", { headers });
        const devicesRes = await fetch("http://localhost:3069/study-space/devices", { headers });

        const roomsData = await roomsRes.json();
        const devicesData = await devicesRes.json();
        //console.log(roomsData);
        // console.log(devicesData);

        setRooms(roomsData?.metaData?.roomList || []);
        setDevices(devicesData?.metaData?.deviceList || []);

        // If admin, fetch all users
        if (user.role === "Admin") {
          const usersRes = await fetch("http://localhost:3069/admin/users", { headers });
          const usersData = await usersRes.json();
          setUsers(usersData.stack?.users || []);

          const configsRes = await fetch("http://localhost:3069/admin/configs", { headers });
          const configsData = await configsRes.json();
          setConfigs(configsData.metaData?.configs || []);
        } else {
          setUsers([]);
        }
      } catch (err) {
        console.error("Error fetching data:", err);
      }
    };


    fetchData();
  }, [user]);

  return (
    <AppDataContext.Provider value={{ rooms, devices, users, configs }}>
      {children}
    </AppDataContext.Provider>
  );
}

export function useAppData() {
  return useContext(AppDataContext);
}
