import React, { useState } from "react";
import "./SystemConfig.css";
import ApplicationConfig from "./ApplicationConfig";
import IOTConfig from "./IOTConfig";

const tabs = [
  "Thời gian hoạt động",
  "Thời lượng đặt phòng",
  "Số lần đặt tối đa",
  "Đặt trước tối đa",
  "Quy định nhóm",
  "Penalty",
  "IOT"
];

export default function SystemConfig() {
  const [activeTab, setActiveTab] = useState("IOT");

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
          <IOTConfig />
        ) : (
          <ApplicationConfig category={activeTab} />
        )}
      </div>
    </div>
  );
}
