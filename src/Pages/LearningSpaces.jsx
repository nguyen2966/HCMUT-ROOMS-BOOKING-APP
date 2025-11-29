import React, { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "./CSS/Rooms.css";
import RoomQR from "../Components/RoomQR/RoomQR";
import axios from "axios";
import { useAuth } from "../Context/AuthContext";

function SpaceCard({ room, onOpen }) {
  const normalized = room.status?.toLowerCase();
  const statusClass =
    normalized === "available"
      ? "available"
      : normalized === "inuse" || normalized === "in used"
      ? "inuse"
      : "checkedout";

  const imageUrl = room.room_image?.[0]?.image_url;
  return (
    <div className={`ls-room-card ${statusClass}`} onClick={() => onOpen(room)}>
      <div 
        className="room-thumb"
        style={{
          backgroundImage: imageUrl ? `url(${imageUrl})` : 'none',
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
      </div>
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

  const [searchTerm, setSearchTerm] = useState("");
  const [filterBuilding, setFilterBuilding] = useState("All");
  const [filterCapacity, setFilterCapacity] = useState("All");

  const [selected, setSelected] = useState(null);
  const [open, setOpen] = useState(false);

  const [startDate, setStartDate] = useState(new Date());
  const [startTimeStr, setStartTimeStr] = useState("08:00");
  const [endTimeStr, setEndTimeStr] = useState("09:00");
  const [teamSize, setTeamSize] = useState(1);
  const [isBooking, setIsBooking] = useState(false);

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const buildings = ["All", ...new Set(rooms.map((r) => r.building))].sort();

  useEffect(() => {
    const fetchRooms = async () => {
      if (!accessToken) {
          setLoading(false);
          return;
      }
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

  const filteredRooms = rooms.filter((room) => {
    const matchesSearch = room.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesBuilding =
      filterBuilding === "All" || room.building === filterBuilding;
    let matchesCapacity = true;
    if (filterCapacity === "< 10") matchesCapacity = room.capacity < 10;
    else if (filterCapacity === "10 - 30")
      matchesCapacity = room.capacity >= 10 && room.capacity <= 30;
    else if (filterCapacity === "> 30") matchesCapacity = room.capacity > 30;

    return matchesSearch && matchesBuilding && matchesCapacity;
  });

  const openModal = (room) => {
    setSelected(room);
    setOpen(true);
    setStartDate(new Date());
    setStartTimeStr("08:00");
    setEndTimeStr("09:00");
    setTeamSize(1);
    setCurrentImageIndex(0);
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

    if (startTimeStr >= endTimeStr) {
      alert("Giờ kết thúc phải sau giờ bắt đầu!");
      return;
    }
    setIsBooking(true);

    try {
      const [startHour, startMin] = startTimeStr.split(":").map(Number);
      const startDateTime = new Date(startDate);
      startDateTime.setHours(startHour, startMin, 0, 0);

      const [endHour, endMin] = endTimeStr.split(":").map(Number);
      const endDateTime = new Date(startDate);
      endDateTime.setHours(endHour, endMin, 0, 0);

      const payload = {
        room_id: selected.ID,
        booking_user: user.ID,
        start_time: startDateTime,
        end_time: endDateTime,
      };

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

  const nextImage = (e) => {
    e.stopPropagation();
    if (selected?.room_image?.length > 0) {
      setCurrentImageIndex((prev) => (prev + 1) % selected.room_image.length);
    }
  };

  const prevImage = (e) => {
    e.stopPropagation();
    if (selected?.room_image?.length > 0) {
      setCurrentImageIndex((prev) => 
        prev === 0 ? selected.room_image.length - 1 : prev - 1
      );
    }
  };
  return (
    <div className="learning-spaces">
      <div className="page-header-row">
        <h2 className="page-title">Learning Spaces</h2>

        <div className="filter-toolbar">
          <div className="search-box">
            <input
              type="text"
              placeholder="Search room..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <span className="search-icon">🔍</span>
          </div>
          <select
            className="filter-select"
            value={filterBuilding}
            onChange={(e) => setFilterBuilding(e.target.value)}
          >
            {buildings.map((b) => (
              <option key={b} value={b}>
                {b === "All" ? "All Buildings" : `Building ${b}`}
              </option>
            ))}
          </select>
          <select
            className="filter-select"
            value={filterCapacity}
            onChange={(e) => setFilterCapacity(e.target.value)}
          >
            <option value="All">All Capacities</option>
            <option value="< 10">Small (&lt; 10)</option>
            <option value="10 - 30">Medium (10 - 30)</option>
            <option value="> 30">Large (&gt; 30)</option>
          </select>
        </div>
      </div>

      <div className="rooms-grid">
        {loading ? (
            <p>Loading rooms...</p>
          ) : filteredRooms.length > 0 ? (
            filteredRooms.map((room) => (
              <SpaceCard key={room.ID} room={room} onOpen={openModal} />
            ))
          ) : (
            <p>No rooms match your criteria.</p>
          )}
      </div>

      {open && selected && (
        <div className="sm-modal-overlay" onClick={closeModal}>
          <div className="sm-modal" onClick={(e) => e.stopPropagation()}>
            <div className="sm-left">
              <div style={{ position: 'relative', marginBottom: '15px' }}>
                {(() => {
                  const images = selected.room_image || [];
                  const currentImgUrl = images[currentImageIndex]?.image_url;
                  
                  return (
                    <div 
                      className="sm-image-placeholder"
                      style={{
                        backgroundImage: currentImgUrl ? `url(${currentImgUrl})` : 'none',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        backgroundColor: '#f0f0f0',
                        position: 'relative',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      {!currentImgUrl && <span style={{color:'#999'}}>No Preview Image</span>}

                      {/* Nút Previous (Chỉ hiện khi có nhiều hơn 1 ảnh) */}
                      {images.length > 1 && (
                        <button 
                          onClick={prevImage}
                          style={{
                            position: 'absolute', left: '10px',
                            background: 'rgba(0,0,0,0.5)', color: '#fff',
                            border: 'none', borderRadius: '50%',
                            width: '30px', height: '30px', cursor: 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '18px', fontWeight: 'bold'
                          }}
                        >
                          ‹
                        </button>
                      )}

                      {/* Nút Next (Chỉ hiện khi có nhiều hơn 1 ảnh) */}
                      {images.length > 1 && (
                        <button 
                          onClick={nextImage}
                          style={{
                            position: 'absolute', right: '10px',
                            background: 'rgba(0,0,0,0.5)', color: '#fff',
                            border: 'none', borderRadius: '50%',
                            width: '30px', height: '30px', cursor: 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '18px', fontWeight: 'bold'
                          }}
                        >
                          ›
                        </button>
                      )}

                      {/* Hiển thị số trang (Ví dụ: 1/3) */}
                      {images.length > 1 && (
                        <div style={{
                          position: 'absolute', bottom: '10px', right: '10px',
                          background: 'rgba(0,0,0,0.6)', color: '#fff',
                          padding: '2px 8px', borderRadius: '10px', fontSize: '12px'
                        }}>
                          {currentImageIndex + 1} / {images.length}
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>
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
