import React, { useState, useEffect } from 'react';
import { useAuth } from '../../Context/AuthContext';
import axiosClient from '../../config/axiosClient';
import './UserInfo.css';
import admin_img from "./admin-avatar.png"

// Mock image URL since the API response doesn't include one
const MOCK_USER_IMAGE = admin_img; // Unique avatar per ID

// Helper function to format date
const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN') + ' ' + date.toLocaleTimeString('vi-VN', {hour: '2-digit', minute: '2-digit'});
};

// Component to display user details
const UserInfo = () => {
    const { user: authUser } = useAuth();
    const [userInfo, setUserInfo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch details for the currently logged-in user
    useEffect(() => {
        if (!authUser?.ID) {
            setLoading(false);
            return;
        }

        const fetchUserInfo = async () => {
            try {
                // Assuming the backend has a direct GET endpoint for user details
                const res = await axiosClient.get(`/user/${authUser.ID}`);
                setUserInfo(res.data.metaData);
            } catch (err) {
                console.error("Failed to fetch user info:", err);
                setError("Không thể tải thông tin người dùng.");
            } finally {
                setLoading(false);
            }
        };

        fetchUserInfo();
    }, [authUser?.ID]);

    if (loading) {
        return <div className="user-profile-page loading-state">Đang tải thông tin...</div>;
    }

    if (error || !userInfo) {
        return <div className="user-profile-page loading-state" style={{color: 'red'}}>{error || "Không tìm thấy hồ sơ người dùng."}</div>;
    }

    const { 
        full_name, 
        email, 
        phone_num, 
        status, 
        created_date, 
        last_login, 
        role 
    } = userInfo;

    return (
        <div className="user-profile-page">
            <div className="profile-card">
                <div className="profile-img-wrap">
                    <img 
                        src={ MOCK_USER_IMAGE } 
                        alt="User Avatar" 
                        className="profile-img"
                    />
                </div>
                
                <div className="profile-header">
                    <h1>{full_name}</h1>
                    <span className="role-badge">{role?.role_name || 'N/A'}</span>
                </div>

                <div className="profile-details-grid">
                    <div className="detail-row">
                        <span className="detail-label">Email:</span>
                        <span className="detail-value">{email}</span>
                    </div>

                    <div className="detail-row">
                        <span className="detail-label">Phone:</span>
                        <span className="detail-value">{phone_num || 'Chưa cập nhật'}</span>
                    </div>


                    <div className="detail-row">
                        <span className="detail-label">Status:</span>
                        <span className="detail-value" style={{color: status === 'Active' ? '#2e7d32' : '#d32f2f'}}>
                            {status}
                        </span>
                    </div>

                    <div className="detail-row">
                        <span className="detail-label">Created Date:</span>
                        <span className="detail-value">{formatDate(created_date)}</span>
                    </div>

                    <div className="detail-row">
                        <span className="detail-label">Last login:</span>
                        <span className="detail-value">{formatDate(last_login)}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserInfo;