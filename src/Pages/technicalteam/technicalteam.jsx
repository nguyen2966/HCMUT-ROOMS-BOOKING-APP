import React, { useState } from "react";
import Sidebar from "../../Components/Sidebar/Sidebar";
import { technicalTeamMenu } from "./TechnicalTeamMenuData";
import "./technicalteam.css";

export default function TechnicalTeamPanel() {
  const [selected, setSelected] = useState(0);
  const SelectedComponent = technicalTeamMenu[selected].component;

  return (
    <div className="technicalteam-panel">
      <Sidebar menu={technicalTeamMenu} selected={selected} onSelect={setSelected} />
      <div className="technicalteam-content">
        <SelectedComponent />
      </div>
    </div>
  );
}
