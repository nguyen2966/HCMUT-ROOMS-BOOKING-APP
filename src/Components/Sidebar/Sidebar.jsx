import React from "react";
import "./Sidebar.css"; // import CSS file

export default function Sidebar({ menu, selected, onSelect }) {
  return (
    <div className="sidebar">
      {menu.map((item, idx) => (
        <div
          key={idx}
          className={`sidebar-item ${selected === idx ? "active" : ""}`}
          onClick={() => onSelect(idx)}
        >
          <p className="sidebar-title">{item.name}</p>
          <p className="sidebar-description">{item.description}</p>
        </div>
      ))}
    </div>
  );
}
