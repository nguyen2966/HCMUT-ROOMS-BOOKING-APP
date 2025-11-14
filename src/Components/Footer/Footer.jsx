import React from "react";
import "./Footer.css";

export default function Footer() {
  return (
    <div className="footer-container">

      {/* Technician Section */}
      <div className="footer-info">
        <h3>Tổ kỹ thuật / Technician</h3>
        <p>Email : ddthu@hcmut.edu.vn</p>

        <p className="italic">
          Quý Thầy/Cô chưa có tài khoản (hoặc quên mật khẩu) nhà trường vui lòng liên hệ
          Trung tâm Dữ liệu & Công nghệ Thông tin, phòng 109 nhà A5 để được hỗ trợ.
        </p>

        <p className="italic">
          (For HCMUT account, please contact to : Data and Information Technology Center)
        </p>

        <p>Email : dl-cntt@hcmut.edu.vn</p>
        <p>ĐT (Tel.) : (84-8) 38647256 - 7200</p>
      </div>

      {/* Copyright Bar */}
      <div className="footer-bottom">
        Copyright 2007-2023 BKEL - Phát triển dựa trên Moodle
      </div>
    </div>
  );
}
