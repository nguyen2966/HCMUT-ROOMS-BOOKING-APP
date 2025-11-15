import React, { useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import RoomQR from "../Components/RoomQR/RoomQR"
import "./CSS/Rooms.css";
import "./admin/Spacemanage.css";

import { useAppData } from "../Context/AppDataContext";

// Convert backend → UI status
function mapStatus(status) {
  if (!status) return "Available";

  switch (status.toLowerCase()) {
    case "available":
      return "Available";
    case "in used":
    case "in use":
    case "reserved":
      return "In used";
    case "maintaining":
    case "maintenance":
      return "Maintaining";
    default:
      return "Available";
  }
}

function SpaceCard({ s, onOpen }) {
  const uiStatus = mapStatus(s.status);

  const statusClass =
    uiStatus === "Available"
      ? "available"
      : uiStatus === "In used"
      ? "inuse"
      : "checkedout";

  const firstImg =
    s.room_image?.[0]?.image_url ||
    "https://via.placeholder.com/200x150?text=No+Image";

  return (
    <div className={`ls-room-card ${statusClass}`} onClick={() => onOpen(s)}>
      <div
        className="room-thumb"
        style={{
          backgroundImage: `url(${firstImg})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />

      <div className="room-info">
        <div className="room-info-top">
          <div className="info-left">
            <div className="room-id">{s.name}</div>
            <div className="room-meta">
              Campus: {s.campus || "N/A"}
              <br />
              Building: {s.building || "N/A"}
            </div>
          </div>

          <div className="room-status">
            {uiStatus === "Available" && (
              <span className="status-pill">Available</span>
            )}
            {uiStatus === "In used" && (
              <span className="status-pill inuse-status">In used</span>
            )}
            {uiStatus === "Maintaining" && (
              <span className="status-pill maintaining-status">Maintaining</span>
            )}
          </div>
        </div>

        <div className="room-tags">
          {s.device?.map((d) => (
            <button key={d.id} className="tag">
              {d.device_name || d.name}
            </button>
          ))}

          {(!s.device || s.device.length === 0) && (
            <button className="tag inactive">No devices</button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function LearningSpaces() {
  const { rooms } = useAppData();
  const [selected, setSelected] = useState(null);
  const [open, setOpen] = useState(false);

  function openModal(room) {
    setSelected(room);
    setOpen(true);
  }
  function closeModal() {
    setOpen(false);
    setSelected(null);
  }

  return (
    <div className="learning-spaces">
      <h2 className="page-title">Learning Spaces</h2>

      {/* Rooms Grid */}
      <div className="rooms-grid">
        {rooms.length === 0 && (
          <div style={{ textAlign: "center", padding: "30px", opacity: 0.7 }}>
            No rooms available.
          </div>
        )}

        {rooms.map((room) => (
          <SpaceCard key={room.ID} s={room} onOpen={openModal} />
        ))}
      </div>

      {/* Modal */}
      {open && selected && (
        <div className="sm-modal-overlay" onClick={closeModal}>
          <div className="sm-modal" onClick={(e) => e.stopPropagation()}>
            <div className="sm-left">
              <div className="sm-image-placeholder">
                <img
                  src={
                    selected.room_image?.[0]?.image_url ||
                    "https://via.placeholder.com/300?text=No+Image"
                  }
                  alt="room"
                />
              </div>

              <div className="sm-desc">
                <div className="sm-desc-row">
                  <div className="sm-desc-left">
                    <div className="room-title">{selected.name}</div>
                    <div className="room-meta">
                      <strong>Campus:</strong> {selected.campus || "N/A"}
                    </div>
                    <div className="room-meta">
                      <strong>Building:</strong> {selected.building || "N/A"}
                    </div>
                  </div>

                  <div className="sm-desc-right">
                    <div className="sm-tags">
                      {selected.device?.map((d) => (
                        <button key={d.id} className="tag">
                          {d.device_name || d.name}
                        </button>
                      ))}

                      {(!selected.device || selected.device.length === 0) && (
                        <button className="tag inactive">No devices</button>
                      )}
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
