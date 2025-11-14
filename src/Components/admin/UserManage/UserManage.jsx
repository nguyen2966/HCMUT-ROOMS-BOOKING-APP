import React, { useState } from "react";
import "./UserManage.css";
import user_icon from "../../../Assets/user_icon.png";
import { useAppData } from "../../../Context/AppDataContext";
import { useAuth } from "../../../Context/AuthContext";

export default function UserManage() {
  const { users: contextUsers } = useAppData();
  const { user } = useAuth(); // contains accessToken and ID
  const [users, setUsers] = useState(contextUsers || []);
  const [searchTerm, setSearchTerm] = useState("");
  console.log(contextUsers);
  // When context updates (after fetch), sync with local state
  React.useEffect(() => {
    if (contextUsers?.length) {
      setUsers(contextUsers);
    }
  }, [contextUsers]);

  const token = user?.accessToken;
  const adminId = user?.ID;
  // PATCH user status
  const handleToggleStatus = async (u) => {
    const newStatus = u.status === "active" ? "Locked" : "active";

    try {
      const res = await fetch(`http://localhost:3069/admin/users/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          userId: u.ID,
          status: newStatus,
          role_id: u.role_id,
          admin_id: adminId,
        }),
      });

      const data = await res.json();
      console.log("Status update:", data);

      if (res.ok) {
        setUsers((prev) =>
          prev.map((usr) =>
            usr.ID === u.ID ? { ...usr, status: newStatus } : usr
          )
        );
        alert(`User status updated to ${newStatus}`);
      } else {
        alert("Failed to update status: " + data.message);
      }
    } catch (err) {
      console.error(err);
      alert("Error updating status");
    }
  };

  // PATCH reset penalty
  const handleResetPenalty = async (u) => {
    try {
      const res = await fetch(`http://localhost:3069/admin/users/reset-penalty`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          userId: u.ID,
          admin_id: adminId,
        }),
      });

      const data = await res.json();
      console.log("Reset penalty:", data);

      if (res.ok) {
        setUsers((prev) =>
          prev.map((usr) =>
            usr.ID === u.ID ? { ...usr, penalty_penalty_user_idTouser: [] } : usr
          )
        );
        alert(`Penalty reset for ${u.full_name}`);
      } else {
        alert("Failed to reset penalty: " + data.message);
      }
    } catch (err) {
      console.error(err);
      alert("Error resetting penalty");
    }
  };

  // Search filter
  const filteredUsers = users.filter((u) =>
    new RegExp(searchTerm, "i").test(u.full_name)
  );

  return (
    <div className="user-manage">
      <div className="user-manage-header">
        <h2>User Management</h2>
        <input
          type="text"
          placeholder="🔍 Search user..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-bar"
        />
      </div>

      <table className="user-table">
        <thead>
          <tr>
            <th>Full Name</th>
            <th>Penalty</th>
            <th>Email</th>
            <th>Role</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredUsers.map((u) => (
            <tr key={u.ID}>
              <td className="user-info">
                <img src={user_icon} alt={u.full_name} className="user-img" />
                <span className="user-name">{u.full_name}</span>
              </td>
              <td>{u.penalty_penalty_user_idTouser?.length || 0}</td>
              <td className="email">{u.email}</td>
              <td>
                <span className={`role ${u.role?.role_name?.toLowerCase().replace(" ", "-")}`}>
                  {u.role?.role_name}
                </span>
              </td>
              <td>
                <span
                  className={`status ${u.status === "active" ? "active" : "locked"}`}
                >
                  {u.status}
                </span>
              </td>
              <td>
                <button className="edit" onClick={() => handleToggleStatus(u)}>
                  🔄
                </button>
                <button className="reset" onClick={() => handleResetPenalty(u)}>
                  ♻️
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

