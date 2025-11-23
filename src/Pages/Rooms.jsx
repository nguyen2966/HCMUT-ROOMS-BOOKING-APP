import React, { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "./CSS/Rooms.css";
import "./admin/Spacemanage.css";
import RoomQR from "../Components/RoomQR/RoomQR";
import axios from "axios";

// import { useAppData } from "../Context/AppDataContext"; 
import { useAuth } from "../Context/AuthContext";

const getDateString = (daysToAdd = 0) => {
  const date = new Date();
  date.setDate(date.getDate() + daysToAdd);
  return date.getFullYear() + '-' + 
        (date.getMonth() + 1).toString().padStart(2, '0') + '-' + 
        date.getDate().toString().padStart(2, '0');
};

const todayStr = getDateString(0);
const tomorrowStr = getDateString(1);

const mockAvailableSlots = {
  'H1.301': {
    [todayStr]: ['08:00 - 09:00', '10:00 - 12:00', '14:00 - 17:00'],
    [tomorrowStr]: ['09:30 - 11:30', '13:00 - 15:00'],
  },
  'H2.106': {
    [todayStr]: ['07:00 - 10:00', '15:00 - 17:00'],
    [tomorrowStr]: ['08:00 - 12:00'],
  },
};
// -----------------------------------------------------------

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
  const [teamSize, setTeamSize] = useState(1);

  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);

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

  const loadAvailableSlots = (roomName, date) => {
    if (!roomName) return;
    const formattedDate =
      date.getFullYear() +
      "-" +
      (date.getMonth() + 1).toString().padStart(2, "0") +
      "-" +
      date.getDate().toString().padStart(2, "0");

    const slots = mockAvailableSlots[roomName]?.[formattedDate] || [];
    setAvailableSlots(slots);
    setSelectedSlot(null);
  };

  const openModal = (room) => {
    setSelected(room);
    setOpen(true);
    const today = new Date();
    setStartDate(today);
    setTeamSize(1);
    loadAvailableSlots(room.name, today);
  };

  const closeModal = () => {
    setSelected(null);
    setOpen(false);
    setAvailableSlots([]);
    setSelectedSlot(null);
    setIsBooking(false);
  };

  const handleDateChange = (date) => {
    setStartDate(date);
    if (selected) {
      loadAvailableSlots(selected.name, date);
    }
  };

  const handleSlotSelect = (slot) => {
    setSelectedSlot(slot);
  };

  const handleReserve = async () => {
    if (!selectedSlot || !selected || !user) {
        alert("Vui lòng chọn slot và đăng nhập trước!");
        return;
    }

    setIsBooking(true);

    try {
        const [startStr, endStr] = selectedSlot.split(' - ');
        const [startHour, startMin] = startStr.split(':').map(Number);
        const [endHour, endMin] = endStr.split(':').map(Number);

        const startTime = new Date(startDate);
        startTime.setHours(startHour, startMin, 0, 0);

        const endTime = new Date(startDate);
        endTime.setHours(endHour, endMin, 0, 0);

        const payload = {
            room_id: selected.ID,
            booking_user: user.ID,
            start_time: startTime,
            end_time: endTime
        };

        const res = await axios.post('http://localhost:3069/booking', payload, {
            headers: { Authorization: `Bearer ${accessToken}` }
        });

        if (res.status === 200) {
            alert("✅ Đặt phòng thành công!");
            closeModal();
        }

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
                  className={`btn save ${!selectedSlot || isBooking ? "disabled" : ""}`}
                  onClick={handleReserve}
                  disabled={!selectedSlot || isBooking}
                >
                  {isBooking ? "Booking..." : "Reserve"}
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
                <div className="calendar-box">
                  <DatePicker
                    selected={startDate}
                    onChange={handleDateChange}
                    inline
                    minDate={new Date()}
                  />
                </div>
                <hr style={{ margin: '10px 0' }} />

                <div className="available-slots">
                  <h4 className="slots-title">Available Slots for {startDate.toLocaleDateString('en-GB')}</h4>
                  
                  {availableSlots.length > 0 ? (
                    <div className="slots-list">
                      {availableSlots.map((slot, index) => (
                        <button
                          key={index}
                          className={`slot-pill ${selectedSlot === slot ? 'selected' : ''}`}
                          onClick={() => handleSlotSelect(slot)}
                        >
                          {slot}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <p className="no-slots">No available slots on this date.</p>
                  )}
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
