import React, { useState, useEffect } from "react";
import "./UserManage.css";
import user_icon from "../../../Assets/user_icon.png";
import { useAppData } from "../../../Context/AppDataContext";
import { useAuth } from "../../../Context/AuthContext";
import axiosClient from "../../../config/axiosClient";

export default function UserManage() {
  // 1. Use refreshData from context
  const { users: contextUsers, refreshData } = useAppData();
  const { user } = useAuth(); 
  
  const [users, setUsers] = useState(contextUsers || []);
  const [searchTerm, setSearchTerm] = useState("");

  // Sync local state with global context updates
  useEffect(() => {
    setUsers(contextUsers || []);
  }, [contextUsers]);

  const adminId = user?.ID;

  // --- Logic: Toggle Status ---
  const handleToggleStatus = async (u) => {
    // Fix Case Sensitivity: Backend likely uses "Active"/"Locked" (Capitalized)
    const newStatus = u.status === "Active" ? "Locked" : "Active";
    
    try {
      await axiosClient.patch('/admin/users/status', {
        userId: u.ID,
        status: newStatus,
        role_id: u.role_id,
        admin_id: adminId, // Note: Keeping this until backend is refactored to read from token
      });

      // 2. Trigger global refresh -> UI updates automatically
      if (refreshData) await refreshData();
      
    } catch (err) {
      console.error(err);
      alert("Failed to update status: " + (err.response?.data?.message || err.message));
    }
  };

  // --- Logic: Reset Penalty ---
  const handleResetPenalty = async (u) => {
    if (!window.confirm(`Reset penalties for ${u.full_name}?`)) return;

    try {
      await axiosClient.patch('/admin/users/reset-penalty', {
        userId: u.ID,
        admin_id: adminId,
      });

      if (refreshData) await refreshData();
      alert(`Penalty reset successfully for ${u.full_name}`);

    } catch (err) {
      console.error(err);
      alert("Failed to reset penalty: " + (err.response?.data?.message || err.message));
    }
  };


  // Filter Logic
  const filteredUsers = users.filter((u) =>
    u.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="user-manage">
      <div className="user-manage-container">
        {/* Header */}
        <div className="user-manage-header">
          <h2>User Management</h2>
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-bar"
          />
        </div>

        {/* Scrollable Table Area */}
        <div className="table-scroll-wrapper">
          <table className="user-table">
            <thead>
              <tr>
                <th>User Info</th>
                <th>Email</th>
                <th>Role</th>
                <th>Penalty</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length > 0 ? (
                filteredUsers.map((u) => (
                  <tr key={u.ID}>
                    <td>
                      <div className="user-info">
                        <img src={user_icon} alt="user" className="user-img" />
                        <span className="user-name">{u.full_name}</span>
                      </div>
                    </td>
                    <td className="email">{u.email}</td>
                    <td>
                      <span className={`role ${u.role?.role_name?.toLowerCase() || 'student'}`}>
                        {u.role?.role_name || 'Student'}
                      </span>
                    </td>
                    <td>
                      {/* Display penalty count cleanly */}
                      <span style={{fontWeight: 'bold', color: u.penalty_penalty_user_idTouser?.length > 0 ? 'red' : '#ccc'}}>
                        {u.penalty_penalty_user_idTouser?.length || 0}
                      </span>
                    </td>
                    <td>
                      <span className={`status ${u.status?.toLowerCase()}`}>
                        {u.status}
                      </span>
                    </td>
                    <td>
                      <div className="actions-cell">
                        <button 
                          className="action-btn edit" 
                          onClick={() => handleToggleStatus(u)} 
                          title={u.status === "Active" ? "Lock User" : "Activate User"}
                        >
                          {u.status === "Active" ? "🔒" : "🔓"}
                        </button>
                        <button 
                          className="action-btn reset" 
                          onClick={() => handleResetPenalty(u)} 
                          title="Reset Penalty"
                        >
                          ⚠️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" style={{ textAlign: "center", padding: "30px", color: "#999" }}>
                    No users found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}