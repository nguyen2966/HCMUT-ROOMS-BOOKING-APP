import React, { useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "./CSS/Rooms.css";
import "./admin/Spacemanage.css";
import RoomQR from "../Components/RoomQR/RoomQR";

import { useAppData } from "../Context/AppDataContext";
// import { useAuth } from "../Context/AuthContext";

function SpaceCard({ room, onOpen }) {
  // backend: "Available", "available", "In used", "Maintaining"
  const normalized = room.status?.toLowerCase();
  const statusClass =
    normalized === "available"
      ? "available"
      : normalized === "in used"
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

        {/* Device tags */}
        <div className="room-tags">
          {room.device?.slice(0, 3).map((d) => (
            <button key={d.ID} className="tag">
              {d.type}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function Rooms() {
  // const {accessToken } = useAuth();
  const { rooms } = useAppData(); // 
  console.log(rooms);

  const [selected, setSelected] = useState(null);
  const [open, setOpen] = useState(false);

  const openModal = (room) => {
    setSelected(room);
    setOpen(true);
  };

  const closeModal = () => {
    setSelected(null);
    setOpen(false);
  };

  return (
    <div className="learning-spaces">
      <h2 className="page-title">Learning Spaces</h2>

      {/* ✅ Ensure no crash before data loads */}
      <div className="rooms-grid">
        {rooms && rooms.length > 0 ? (
          rooms.map((room) => (
            <SpaceCard key={room.ID} room={room} onOpen={openModal} />
          ))
        ) : (
          <p>Loading rooms...</p>
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
                          {d.type}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="sm-actions">
                <button
                  className="btn save"
                  onClick={() => {
                    alert("Reserved " + selected.name);
                    closeModal();
                  }}
                >
                  Reserve
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
                    defaultValue={1}
                    className="team-input"
                  />
                </div>
              </div>

              <div className="sm-calendar">
                <div className="time-row">
                  <div className="time-field">
                    <label>From</label>
                    <input type="time" className="time-input" />
                  </div>

                <div className="time-field">
                    <label>To</label>
                    <input type="time" className="time-input" />
                  </div>

                  <button className="clock-icon" aria-label="time-picker">
                    🕒
                  </button>
                </div>

                <div className="calendar-box">
                  <DatePicker inline />
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
