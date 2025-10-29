import React from "react";

const data = {
  "Thời gian hoạt động": [
    { key: "SYSTEM_OPEN_TIME", label: "Giờ mở cửa (VD: 07:00)" },
    { key: "SYSTEM_CLOSE_TIME", label: "Giờ đóng cửa (VD: 22:00)" },
  ],
  "Thời lượng đặt phòng": [
    { key: "MIN_BOOKING_DURATION", label: "Số phút tối thiểu (VD: 30 phút)" },
    { key: "MAX_BOOKING_DURATION", label: "Số giờ tối đa (VD: 4 giờ)" },
  ],
  "Số lần đặt tối đa": [
    { key: "MAX_BOOKINGS_PER_WEEK_STUDENT", label: "Sinh viên (VD: 3)" },
    { key: "MAX_BOOKINGS_PER_WEEK_LECTURER", label: "Giảng viên (VD: 7)" },
  ],
  "Đặt trước tối đa": [
    { key: "ADVANCE_BOOKING_DAYS_STUDENT", label: "Sinh viên (VD: 3 ngày)" },
    { key: "ADVANCE_BOOKING_DAYS_LECTURER", label: "Giảng viên (VD: 5 ngày)" },
  ],
  "Quy định nhóm": [
    { key: "MAX_GROUP_SIZE", label: "Số thành viên tối đa (VD: 8 người)" },
  ],
  Penalty: [
    { key: "PENALTY_NO_CHECKIN", label: "Điểm phạt không check-in (VD: +1)" },
    { key: "PENALTY_NO_CHECKOUT", label: "Điểm phạt không check-out (VD: +2)" },
    { key: "PENALTY_LATE_CHECKOUT", label: "Điểm phạt check-out trễ (VD: +1)" },
    { key: "MAX_PENALTY_BEFORE_BLOCK", label: "Ngưỡng khóa tài khoản (VD: 3 điểm)" },
    { key: "BLOCK_DURATION_DAYS", label: "Thời gian khóa (VD: 7 ngày)" },
    { key: "PENALTY_RESET_MONTHS", label: "Tự động reset điểm phạt (VD: 1 tháng)" },
  ],
};

export default function ApplicationConfig({ category }) {
  const configs = data[category] || [];

  return (
    <div className="config-section">
      {configs.map((c) => (
        <div key={c.key} className="config-item">
          <label>{c.key}: {c.label}</label>
          <input type="text" placeholder={c.label} />
        </div>
      ))}
    </div>
  );
}
