import React, { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "./CSS/Rooms.css";
import "./admin/Spacemanage.css";
import RoomQR from "../Components/RoomQR/RoomQR";
import axios from "axios";

// import { useAppData } from "../Context/AppDataContext"; 
import { useAuth } from "../Context/AuthContext";

function SpaceCard({ room, onOpen }) {
  const normalized = room.status?.toLowerCase();
  const statusClass =
    normalized === "available"
      ? "available"
      : normalized === "inuse" || normalized === "in used"
      ? "inuse"
      : "checkedout";

  return (
    <div className={`ls-room-card ${statusClass}`} onClick={() => onOpen(room)}>
      <div className="room-thumb"></div>
      <div className="room-info">
        <div className="room-info-top">
          <div className="info-left">
            <div className="room-id">{room.name}</div>
            <div className="room-meta">
              Campus: Dĩ An <br />
              Building: {room.building}
            </div>
          </div>
          <div className="room-status">
            <span className={`status-pill ${statusClass}-status`}>
              {room.status}
            </span>
          </div>
        </div>
        <div className="room-tags">
          {room.device?.slice(0, 3).map((d) => (
            <button key={d.ID} className="tag">
              {d.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function Rooms() {
  const { accessToken, user } = useAuth(); 
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selected, setSelected] = useState(null);
  const [open, setOpen] = useState(false);

  const [startDate, setStartDate] = useState(new Date());
  const [startTimeStr, setStartTimeStr] = useState("08:00");
  const [endTimeStr, setEndTimeStr] = useState("09:00");
  const [teamSize, setTeamSize] = useState(1);
  const [isBooking, setIsBooking] = useState(false);

  useEffect(() => {
    const fetchRooms = async () => {
      if (!accessToken) return;
      try {
        const res = await axios.get("http://localhost:3069/study-space", {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        if (res.data && res.data.metaData && res.data.metaData.roomList) {
          setRooms(res.data.metaData.roomList);
        }
      } catch (err) {
        console.error("Failed to fetch rooms:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchRooms();
  }, [accessToken]);

  const openModal = (room) => {
    setSelected(room);
    setOpen(true);
    setStartDate(new Date());
    setStartTimeStr("08:00");
    setEndTimeStr("09:00");
    setTeamSize(1);
  };

  const closeModal = () => {
    setSelected(null);
    setOpen(false);
    setIsBooking(false);
  };

  const handleReserve = async () => {
    if (!selected || !user) {
      alert("Vui lòng đăng nhập để đặt phòng!");
      return;
    }

    // Validate giờ
    if (startTimeStr >= endTimeStr) {
      alert("Giờ kết thúc phải sau giờ bắt đầu!");
      return;
    }

    setIsBooking(true);

    try {
      // 1. Tạo object Date cho start_time
      const [startHour, startMin] = startTimeStr.split(":").map(Number);
      const startDateTime = new Date(startDate);
      startDateTime.setHours(startHour, startMin, 0, 0);

      // 2. Tạo object Date cho end_time
      const [endHour, endMin] = endTimeStr.split(":").map(Number);
      const endDateTime = new Date(startDate);
      endDateTime.setHours(endHour, endMin, 0, 0);

      // 3. Chuẩn bị payload gửi Backend
      const payload = {
        room_id: selected.ID,
        booking_user: user.ID,
        start_time: startDateTime, // Axios tự format ISO String
        end_time: endDateTime,
      };

      // 4. Gọi API
      await axios.post("http://localhost:3069/booking", payload, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      alert(`✅ Đặt phòng ${selected.name} thành công!\nThời gian: ${startTimeStr} - ${endTimeStr} ngày ${startDate.toLocaleDateString('en-GB')}`);
      closeModal();
      
    } catch (error) {
      console.error("Lỗi đặt phòng:", error);
      const msg = error.response?.data?.message || error.message;
      alert(`❌ Đặt phòng thất bại: ${msg}`);
    } finally {
      setIsBooking(false);
    }
  };

  return (
    <div className="learning-spaces">
      <h2 className="page-title">Learning Spaces</h2>

      <div className="rooms-grid">
        {loading ? (
            <p>Loading rooms...</p>
        ) : rooms && rooms.length > 0 ? (
          rooms.map((room) => (
            <SpaceCard key={room.ID} room={room} onOpen={openModal} />
          ))
        ) : (
          <p>No rooms found.</p>
        )}
      </div>

      {open && selected && (
        <div className="sm-modal-overlay" onClick={closeModal}>
          <div className="sm-modal" onClick={(e) => e.stopPropagation()}>
            <div className="sm-left">
              <div className="sm-image-placeholder">Preview image</div>

              <div className="sm-desc">
                <div className="sm-desc-row">
                  <div className="sm-desc-left">
                    <div className="room-title">{selected.name}</div>
                    <div className="room-meta">
                      <strong>Campus:</strong> Dĩ An
                    </div>
                    <div className="room-meta">
                      <strong>Building:</strong> {selected.building}
                    </div>
                  </div>

                  <div className="sm-desc-right">
                    <div className="sm-tags">
                      {selected.device?.map((d) => (
                        <button key={d.ID} className="tag">
                          {d.name}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="sm-actions">
                <button
                  className="btn save"
                  onClick={handleReserve}
                  disabled={isBooking}
                >
                  {isBooking ? "Processing..." : "Reserve"}
                </button>
              </div>
            </div>

            <div className="sm-right">
              <div className="sm-right-header">
                <div className="team-label">Team size:</div>
                <div className="team-input-wrap">
                  <input
                    type="number"
                    min="1"
                    max={selected.capacity || 100}
                    value={teamSize}
                    onChange={(e) => {
                        let val = parseInt(e.target.value);
                        if (isNaN(val) || val < 1) val = 1;
                        if (selected.capacity && val > selected.capacity) val = selected.capacity;
                        setTeamSize(val);
                    }}
                    className="team-input"
                  />
                </div>
              </div>

              <div className="sm-calendar">
                <div className="time-selection-box">
                    <div className="time-field">
                        <label>Start Time</label>
                        <input 
                            type="time" 
                            className="time-input"
                            value={startTimeStr}
                            onChange={(e) => setStartTimeStr(e.target.value)}
                        />
                    </div>
                    <div className="time-field">
                        <label>End Time</label>
                        <input 
                            type="time" 
                            className="time-input"
                            value={endTimeStr}
                            onChange={(e) => setEndTimeStr(e.target.value)}
                        />
                    </div>
                </div>
                <div className="calendar-box">
                  <DatePicker
                    selected={startDate}
                    onChange={(date) => setStartDate(date)}
                    inline
                    minDate={new Date()}
                  />
                </div>

                <RoomQR roomId={selected?.ID} roomName={selected?.name} />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
