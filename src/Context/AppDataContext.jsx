import { createContext, useState, useContext, useEffect } from "react";
import { useAuth } from "./AuthContext";

const AppDataContext = createContext();

export function AppDataProvider({ children }) {
  const { user } = useAuth();

  const [rooms, setRooms] = useState([]);
  const [devices, setDevices] = useState([]);
  const [users, setUsers] = useState([]);
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      try {
        // Fetch user's own data
        const userRes = await fetch(`http://localhost:5000/users/${user.id}`);
        const userInfo = await userRes.json();
        setUserData(userInfo);

        // Fetch shared data
        const roomsRes = await fetch("http://localhost:5000/rooms");
        const devicesRes = await fetch("http://localhost:5000/devices");

        const roomsData = await roomsRes.json();
        const devicesData = await devicesRes.json();

        setRooms(roomsData);
        setDevices(devicesData);

        // If admin, fetch all users
        if (user.role === "Admin") {
          const usersRes = await fetch("http://localhost:5000/users");
          const usersData = await usersRes.json();
          setUsers(usersData);
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
    <AppDataContext.Provider value={{ rooms, devices, users, userData }}>
      {children}
    </AppDataContext.Provider>
  );
}

export function useAppData() {
  return useContext(AppDataContext);
}
