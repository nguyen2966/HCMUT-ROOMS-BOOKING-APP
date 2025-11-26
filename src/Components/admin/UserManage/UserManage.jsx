import { useState, useEffect } from "react";
import "./UserManage.css";
import user_icon from "../../../Assets/user_icon.png";
import { useAppData } from "../../../Context/AppDataContext";
import { useAuth } from "../../../Context/AuthContext";
import axiosClient from "../../../config/axiosClient";


// --- Role Mapping for Frontend Display ---
const ROLE_OPTIONS = [
    { id: 4, name: 'Admin' },
    { id: 5, name: 'Technical Staff' },
];

// --- New Component: Modal for Creating New User ---
function CreateUserModal({ onClose, onSave }) {
    const [formData, setFormData] = useState({
        full_name: '',
        email: '',
        password: '',
        role_id: 1, // Default to Student
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const { user } = useAuth();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const { full_name, email, password, role_id } = formData;
        
        if (!full_name || !email || !password || !role_id) {
            setError("Please enter all fields.");
            setLoading(false);
            return;
        }

        try {
            // SECURITY NOTE: The backend ignores admin_id from the body and uses the token's ID.
            await axiosClient.post('/admin/users', {
                full_name,
                email,
                password,
                role_id: +role_id, // Ensure it's a number
                admin_id: +user.ID
            });

            onSave(); // Close modal and refresh data
            alert(`Create account ${email} successfully!`);
        } catch (err) {
            console.error("Create User Error:", err);
            setError(err.response?.data?.message || 'Tạo người dùng thất bại. Vui lòng kiểm tra email hoặc kết nối.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="sm-modal-overlay" onClick={onClose}>
            <div className="sm-modal-small" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>Create account</h2>
                    <button className="close-btn" onClick={onClose}>×</button>
                </div>
                <form onSubmit={handleSubmit} className="modal-form-content">
                    <div className="form-group">
                        <label htmlFor="full_name">Full name</label>
                        <input type="text" name="full_name" value={formData.full_name} onChange={handleChange} required />
                    </div>
                    <div className="form-group">
                        <label htmlFor="email">Email</label>
                        <input type="email" name="email" value={formData.email} onChange={handleChange} required />
                    </div>
                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <input type="password" name="password" value={formData.password} onChange={handleChange} required />
                    </div>
                    <div className="form-group">
                        <label htmlFor="role_id">Role</label>
                        <select name="role_id" value={formData.role_id} onChange={handleChange} required>
                            {ROLE_OPTIONS.map(role => (
                                <option key={role.id} value={role.id}>{role.name}</option>
                            ))}
                        </select>
                    </div>

                    {error && <p className="error-message" style={{color: 'red', marginTop: 10}}>{error}</p>}

                    <div className="modal-footer" style={{borderTop: 'none', padding: '20px 0 0'}}>
                        <button type="submit" className="btn-save" disabled={loading}>
                            {loading ? 'Đang Tạo...' : 'Create account'}
                        </button>
                        <button type="button" className="btn-cancel" onClick={onClose} disabled={loading}>Hủy</button>
                    </div>
                </form>
            </div>
        </div>
    );
}
// --- Main Component: UserManage ---

export default function UserManage() {
  const { users: contextUsers, refreshData } = useAppData();
  const { user } = useAuth(); 
  
  const [users, setUsers] = useState(contextUsers || []);
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false); // New State

  // Sync local state with global context updates
  useEffect(() => {
    setUsers(contextUsers || []);
  }, [contextUsers]);

  const adminId = user?.ID;

  // --- Logic: Toggle Status ---
  const handleToggleStatus = async (u) => {
    // FIX: Use 'Active'/'Locked' to match backend case and Enums
    const newStatus = u.status === "Active" ? "Locked" : "Active";
    
    try {
      await axiosClient.patch('/admin/users/status', {
        userId: u.ID,
        status: newStatus,
        role_id: u.role_id,
        admin_id: adminId,
      });

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
        // admin_id is IGNRORED by backend for security
      });

      if (refreshData) await refreshData();
      alert(`Penalty reset successfully for ${u.full_name}`);

    } catch (err) {
      console.error(err);
      alert("Failed to reset penalty: " + (err.response?.data?.message || err.message));
    }
  };

  // --- Logic: Delete User ---
  const handleDeleteUser = async (u) => {
      if(!window.confirm(`Are you sure you want to delete ${u.full_name}?`)) return;

      try {
          await axiosClient.delete('/admin/users', {
              data: { userId: u.ID, admin_id: adminId } 
          });
          
          if (refreshData) await refreshData();

      } catch (err) {
          console.error(err);
          alert("Failed to delete user: " + (err.response?.data?.message || err.message));
      }
  }
  
  // --- Handler for Create Modal ---
  const handleCreateUser = () => {
      setIsCreateModalOpen(true);
  };
  
  const handleUserSaved = () => {
      setIsCreateModalOpen(false);
      if(refreshData) refreshData();
  }


  // Filter Logic
  const filteredUsers = users.filter((u) =>
    u.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="user-manage">
      <div className="user-manage-container">
        {/* Header - ADD NEW USER BUTTON */}
        <div className="user-manage-header">
          <h2>User Management</h2>
          <button className="btn-add" onClick={handleCreateUser}>
            + Add staff
          </button>
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
                         <button 
                          className="action-btn delete" 
                          onClick={() => handleDeleteUser(u)} 
                          title="Delete User"
                        >
                          🗑
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" style={{ textAlign: "center", padding: "30px", color: "#999" }}>
                    Không tìm thấy người dùng.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* New User Creation Modal */}
      {isCreateModalOpen && (
          <CreateUserModal
              onClose={() => setIsCreateModalOpen(false)}
              onSave={handleUserSaved}
          />
      )}
    </div>
  );
}