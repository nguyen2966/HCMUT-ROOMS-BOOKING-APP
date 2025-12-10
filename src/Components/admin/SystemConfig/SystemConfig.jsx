import { useState, useEffect, useCallback } from "react";
import "./SystemConfig.css";
import ApplicationConfig from "./ApplicationConfig";
import IOTConfig from "./IOTConfig";
import axiosClient from "../../../config/axiosClient";
import { useAuth } from "../../../Context/AuthContext";
import { useAppData } from "../../../Context/AppDataContext"; // ADD THIS

const tabs = [
  "Service time", "Booking duration", "Maximum bookings", 
  "Advance booking", "Group size", "Penalty", "IOT"
];

// Helper để chuyển mảng API thành object { KEY: { ID, value } }
const mapConfigArrayToKeyedObject = (configArray) => {
    if (!Array.isArray(configArray)) return {};
    return configArray.reduce((acc, config) => {
        acc[config.config_name] = {
            ID: config.ID,
            value: config.config_value,
        };
        return acc;
    }, {});
};

export default function SystemConfig() {
  const [activeTab, setActiveTab] = useState("Service time");
  const [configs, setConfigs] = useState({}); 
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { refreshData } = useAppData(); // GET refreshData from context

  // --- API Wrapper ---
  const AdminConfigAPI = {
      getAll: async () => {
          const res = await axiosClient.get('/admin/configs');
          return mapConfigArrayToKeyedObject(res.data.metaData.configs);
      },
      update: async (id, value) => {
          const res = await axiosClient.patch(`/admin/configs/${id}`, { 
            config_value: value,
            admin_id: user.ID 
          });
          return res.data;
      }
  };

  // Fetching logic
  const fetchConfigs = useCallback(async () => {
      setLoading(true);
      try {
          const data = await AdminConfigAPI.getAll();
          setConfigs(data);
      } catch (error) {
          console.error("Failed to fetch configs:", error);
          alert("Không thể tải cấu hình hệ thống.");
      } finally {
          setLoading(false);
      }
  }, []);

  useEffect(() => {
    fetchConfigs();
  }, [fetchConfigs]);

  // Handler khi nhấn nút Save
  const handleSaveConfig = async (id, newValue) => {
      if (!id || newValue === undefined) return;

      try {
          // 1. Gọi API cập nhật
          await AdminConfigAPI.update(id, newValue);
          
          // 2. Cập nhật state cục bộ ngay lập tức (UI responsive hơn)
          setConfigs(prev => ({
              ...prev,
              [Object.keys(prev).find(key => prev[key].ID === id)]: {
                  ...prev[Object.keys(prev).find(key => prev[key].ID === id)],
                  value: newValue,
              }
          }));
          
          // 3. **FIX: Refresh AppDataContext so all components get new configs**
          if (refreshData) {
              await refreshData();
          }
          
          alert("Cập nhật thành công!");
      } catch (error) {
          console.error("Update failed:", error);
          alert("Lỗi cập nhật: " + (error.response?.data?.message || error.message));
      }
  };

  if (loading) {
      return <div className="system-config" style={{padding: 50, textAlign: 'center'}}>Đang tải cấu hình...</div>
  }
  
  return (
    <div className="system-config">
      <div className="tab-container">
        {tabs.map((tab) => (
          <button
            key={tab}
            className={`tab ${activeTab === tab ? "active" : ""}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="config-content">
        {activeTab === "IOT" ? (
          <IOTConfig configs={configs} onSave={handleSaveConfig} />
        ) : (
          <ApplicationConfig category={activeTab} configs={configs} onSave={handleSaveConfig} />
        )}
      </div>
    </div>
  );
}