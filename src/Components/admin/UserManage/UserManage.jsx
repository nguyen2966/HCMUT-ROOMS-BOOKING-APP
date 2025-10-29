import React, { useState } from "react";
import "./UserManage.css";
import user_icon from "../../../Assets/user_icon.png";

const Mock_user = [
  { fullname: "Nithya Menon", penalty: 1, email: "user849@gmail.com", role: "Giảng viên", img: "../../Assets/user_icon.png" },
  { fullname: "Meera Gonzalez", penalty: 0, email: "user849@gmail.com", role: "Admin", img: "../../Assets/user_icon.png" },
  { fullname: "Karthik Subramanian", penalty: 0, email: "user849@gmail.com", role: "Giảng viên", img: "../../Assets/user_icon.png" },
  { fullname: "Mithra B", penalty: 2, email: "user849@gmail.com", role: "Sinh viên", img: "../../Assets/user_icon.png" },
  { fullname: "Jagatheesh Narayanan", penalty: 0, email: "user849@gmail.com", role: "Sinh viên", img: "../../Assets/user_icon.png" },
  { fullname: "Steve Rogers", penalty: 1, email: "user849@gmail.com", role: "Sinh viên", img: "../../Assets/user_icon.png" },
];

// later will fetch from backend

export default function UserManage() {
  const [users, setUsers] = useState(Mock_user);
  const [searchTerm, setSearchTerm] = useState("");

  const handleEdit = (index) => {
    alert(`Edit user: ${users[index].fullname}`);
  };

  const handleDelete = (index) => {
    if (window.confirm(`Are you sure to delete ${users[index].fullname}?`)) {
      setUsers(users.filter((_, i) => i !== index));
    }
  };

  //  Filter users by name using regex
  const filteredUsers = users.filter((u) => {
    const regex = new RegExp(searchTerm, "i");
    return regex.test(u.fullname);
  });

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
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredUsers.map((u, index) => (
            <tr key={index}>
              <td className="user-info">
                <img src={user_icon} alt={u.fullname} className="user-img" />
                <span className="user-name">{u.fullname}</span>
              </td>
              <td>{u.penalty}</td>
              <td className="email">{u.email}</td>
              <td>
                <span className={`role ${u.role.toLowerCase().replace(" ", "-")}`}>
                  {u.role}
                </span>
              </td>
              <td>
                <button className="edit" onClick={() => handleEdit(index)}>✏️</button>
                <button className="delete" onClick={() => handleDelete(index)}>🗑️</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
