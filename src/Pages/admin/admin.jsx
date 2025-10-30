import React, { useState } from "react";
import Sidebar from "../../Components/Sidebar/Sidebar";
import { adminMenu } from "./AdminMenuData";
import "./admin.css"; // import your CSS here

export default function AdminPanel() {
  const [selected, setSelected] = useState(0);
  const SelectedComponent = adminMenu[selected].component;

  return (
    <div className="admin-panel">
      <Sidebar menu={adminMenu} selected={selected} onSelect={setSelected} />
      <div className="admin-content">
        <SelectedComponent />
      </div>
    </div>
  );
}