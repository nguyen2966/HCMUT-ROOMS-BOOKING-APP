import { useState, useEffect, useMemo, useCallback } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "./CSS/Rooms.css"; 
import RoomQR from "../Components/RoomQR/RoomQR";
import { useAuth } from "../Context/AuthContext";
import axiosClient from "../config/axiosClient"; 
import { useAppData } from "../Context/AppDataContext";

// Format date to YYYY-MM-DD for comparison
const formatDateToISOString = (date) => {
    return date.toISOString().split('T')[0];
};

function SpaceCard({ room, onOpen }) {
  const normalized = room.status?.toLowerCase();
  const statusClass =
    normalized === "available"
      ? "available"
      : normalized === "inuse" || normalized === "in used"
      ? "inuse"
      : "unavailable";
  
  const imageUrl = room.room_image?.[0]?.image_url;
  const devices = room.device?.slice(0, 3) || [];

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
              Building: {room.building} | Capacity: {room.capacity}
            </div>
          </div>
          <div className="room-status">
            <span className={`status-pill ${statusClass}-status`}>
              {room.status}
            </span>
          </div>
        </div>
        <div className="room-tags">
          {devices.map((d) => (
            <button key={d.ID} className="tag">
              {d.name.split(' ')[0]}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function Rooms() {
  const { user } = useAuth(); 
  const { rooms: allRooms, refreshData, configs } = useAppData(); 
  console.log(configs);
  
  const [rooms, setRooms] = useState(allRooms);
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
  const [allSystemBookings, setAllSystemBookings] = useState([]); 

  const buildings = ["All", ...new Set(rooms.map((r) => r.building))].sort();
  
  // Get Configs with fallbacks
  
  const MAX_ADVANCE_DAYS = parseInt(configs['ADVANCE_BOOKING_DAYS_STUDENT']) || 7; 
  const MAX_GROUP_SIZE = parseInt(configs['MAX_GROUP_SIZE']) || 6; 
  const MAX_BOOKING_DURATION = parseInt(configs['MAX_BOOKING_DURATION']) || 180;
  const MIN_BOOKING_DURATION = parseInt(configs['MIN_BOOKING_DURATION']) || 30;

  // Sync data from context
  useEffect(() => {
    setRooms(allRooms);
    setLoading(false); 
  }, [allRooms]);

  // Fetch all bookings
  const fetchAllBookings = useCallback(async () => {
    if (!user) return;
    try {
        const res = await axiosClient.get(`/booking`); 
        const activeBookings = res.data.metaData?.bookingList.filter(b => b.status?.toLowerCase() !== 'cancelled') || [];
        setAllSystemBookings(activeBookings);
    } catch (err) {
        console.error("Failed to fetch all system bookings:", err);
        setAllSystemBookings([]);
    }
  }, [user]);

  useEffect(() => {
    if (user) { 
        fetchAllBookings();
    }
  }, [user, fetchAllBookings]);

  // Filter booked slots for selected room and date
  const bookedSlots = useMemo(() => {
    if (!selected || !startDate) return [];

    const selectedDateString = formatDateToISOString(startDate);

    return allSystemBookings.filter(booking => {
        const bookingDateString = new Date(booking.start_time).toISOString().split('T')[0];
        return booking.room_id === selected.ID && bookingDateString === selectedDateString;
    });
  }, [allSystemBookings, selected, startDate]);

const highlightDates = useMemo(() => {
  const dates = new Set();
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Reset to start of day for accurate comparison
  
  allSystemBookings
    .filter(b => b.room_id === selected?.ID)
    .forEach(b => {
      const bookingDate = new Date(b.start_time);
      bookingDate.setHours(0, 0, 0, 0); // Reset to start of day
      
      // Only highlight if booking date is today or in the future
      if (bookingDate >= today) {
        const diffDays = Math.ceil((bookingDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        
        if (diffDays >= 0 && diffDays <= MAX_ADVANCE_DAYS) {
          dates.add(bookingDate.toDateString());
        }
      }
    });
    
  return Array.from(dates).map(d => new Date(d));
}, [allSystemBookings, selected, MAX_ADVANCE_DAYS]);

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

  const handleReserve = async () => {
    if (!selected || !user || selected.status?.toLowerCase() !== 'available') {
      alert("Phòng không khả dụng hoặc bạn chưa đăng nhập!");
      return;
    }

    if (startTimeStr >= endTimeStr) {
      alert("Giờ kết thúc phải sau giờ bắt đầu!");
      return;
    }
    
    const [startHour, startMin] = startTimeStr.split(":").map(Number);
    const [endHour, endMin] = endTimeStr.split(":").map(Number);
    
    const startDateTime = new Date(startDate);
    startDateTime.setHours(startHour, startMin, 0, 0);

    const endDateTime = new Date(startDate);
    endDateTime.setHours(endHour, endMin, 0, 0);

    const durationMinutes = Math.round((endDateTime.getTime() - startDateTime.getTime()) / 60000);

    if (durationMinutes <= 0 || durationMinutes < MIN_BOOKING_DURATION) {
        alert(`Thời gian đặt phải ít nhất ${MIN_BOOKING_DURATION} phút.`);
        return;
    }

    if (durationMinutes > MAX_BOOKING_DURATION) {
        alert(`Thời gian đặt tối đa ${MAX_BOOKING_DURATION} phút.`);
        return;
    }
    
    setIsBooking(true);

    try {
      const payload = {
        room_id: selected.ID,
        booking_user: user.ID,
        start_time: startDateTime.toISOString(),
        end_time: endDateTime.toISOString(),
      };

      await axiosClient.post("/booking", payload);

      alert(`✅ Đặt phòng ${selected.name} thành công!`);
      closeModal();
      if(refreshData) refreshData();
      await fetchAllBookings();

    } catch (error) {
      console.error("Lỗi đặt phòng:", error);
      const msg = error.response?.data?.message || error.message;
      alert(`❌ Đặt phòng thất bại: ${msg}`); 
    } finally {
      setIsBooking(false);
    }
  };

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

                      {images.length > 1 && (
                        <button onClick={prevImage} className="image-nav-btn left">
                          ‹
                        </button>
                      )}

                      {images.length > 1 && (
                        <button onClick={nextImage} className="image-nav-btn right">
                          ›
                        </button>
                      )}

                      {images.length > 1 && (
                        <div className="image-counter">
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
                    <div className="room-meta">
                      <strong>Capacity:</strong> {selected.capacity}
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
                
                {/* BOOKED SLOTS DISPLAY */}
                <div className="booked-slots-box">
                    <h3>Lịch Đã Đặt Ngày {startDate.toLocaleDateString('vi-VN')}</h3>
                    <p className="booked-slots-hint">*Các ngày có chấm đỏ trên lịch có booking.</p>
                    <div className="slot-list">
                        {bookedSlots.length > 0 ? (
                            bookedSlots.map((booking) => (
                                <span key={booking.ID} className="booked-slot-pill">
                                    {new Date(booking.start_time).toLocaleTimeString('vi-VN', {hour: '2-digit', minute: '2-digit'})} - 
                                    {new Date(booking.end_time).toLocaleTimeString('vi-VN', {hour: '2-digit', minute: '2-digit'})}
                                </span>
                            ))
                        ) : (
                            <p className="no-bookings">Phòng trống cả ngày.</p>
                        )}
                    </div>
                </div>
              </div>

              <div className="sm-actions">
                <button
                  className="btn save"
                  onClick={handleReserve}
                  disabled={isBooking || selected.status?.toLowerCase() !== 'available'}
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
                    max={selected.capacity || MAX_GROUP_SIZE}
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
                    highlightDates={highlightDates}
                    maxDate={new Date(new Date().setDate(new Date().getDate() + MAX_ADVANCE_DAYS - 1))}
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