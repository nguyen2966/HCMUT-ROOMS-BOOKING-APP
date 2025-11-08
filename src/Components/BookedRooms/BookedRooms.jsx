// BookedRooms.jsx
import React, { useState } from 'react'
import 'react-datepicker/dist/react-datepicker.css'
import './BookedRooms.css'

const mockRooms = [
  { id: 'H2.201', status: 'available', img: null },
  { id: 'H3.105', status: 'inuse', img: null },
  { id: 'H3.406', status: 'checkedout', img: null },
  { id: 'H1.210', status: 'checkedout', img: null },
  { id: 'H1.506', status: 'checkedout', img: null },
  { id: 'H1.406', status: 'checkedout', img: null }
]

function RoomCard({ room, onClick }) {
  return (
    <div className={"room-card " + room.status} onClick={() => onClick(room)}>
      <div className="room-thumb" />
      <div className="room-info">
        <div className="room-id">{room.id}</div>
        <div className="room-status">
          {room.status === 'available' && <span className="green">Available to Check-In</span>}
          {room.status === 'inuse' && <span className="teal">In Use</span>}
          {room.status === 'checkedout' && <span className="muted">User has Checked-out</span>}
        </div>
      </div>
    </div>
  )
}

const BookedRooms = () => {
  const [rooms] = useState(mockRooms)
  const [selected, setSelected] = useState(null)
  const [showQR, setShowQR] = useState(false)

  function handleCardClick(room) {
    setSelected({ ...room, checkIn: '8:00 6/9/2025', checkOut: '10:00 6/9/2025' })
    setShowQR(false)
  }

  function closePanel() {
    setSelected(null)
    setShowQR(false)
  }

  return (
    <div className="rooms-page">
      <main className="rooms-main">
        <h2 className="page-title">Your Rooms</h2>
        <div className="rooms-grid">
          {rooms.map(r => (
            <RoomCard key={r.id} room={r} onClick={handleCardClick} />
          ))}
        </div>
      </main>

      {selected && (
        <div className="room-panel-overlay" onClick={closePanel}>
          <div className="room-panel room-panel-vertical" onClick={e => e.stopPropagation()}>
            {!showQR && (
              <div className="rp-vertical">
                <h3>{selected.id}</h3>
                <p className="status-text">
                  {selected.status === 'available' ? (
                    <span className="green">Available to Check-In</span>
                  ) : selected.status === 'inuse' ? (
                    <span className="teal">In Use</span>
                  ) : (
                    <span className="muted">User has Checked-out</span>
                  )}
                </p>
                <div className="panel-thumb" />

                <div className="dates">
                  <div><strong>Check-in Date:</strong> {selected.checkIn}</div>
                  <div><strong>Check-out Date:</strong> {selected.checkOut}</div>
                </div>

                <div className="panel-actions-vertical">
                  <button className="btn btn-green">Check-In</button>
                  <button className="btn btn-red">Check-Out</button>
                  <button className="btn btn-dark" onClick={() => setShowQR(true)}>Show QR</button>
                </div>
              </div>
            )}

            {showQR && (
              <div className="rp-vertical">
                <h3>{selected.id}</h3>
                <p className="status-text">
                  {selected.status === 'available' ? (
                    <span className="green">Available to Check-In</span>
                  ) : selected.status === 'inuse' ? (
                    <span className="teal">In Use</span>
                  ) : (
                    <span className="muted">User has Checked-out</span>
                  )}
                </p>
                <div className="panel-thumb" />
                <div className="dates">
                  <div><strong>Check-in Date:</strong> {selected.checkIn}</div>
                  <div><strong>Check-out Date:</strong> {selected.checkOut}</div>
                </div>

                <div className="qr-area">
                  <div className="qr-center">
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(selected.id + '|' + selected.checkIn)}`}
                      alt="qr"
                    />
                  </div>
                  <div style={{ marginTop: 12 }}>
                    <button className="btn btn-dark" onClick={() => setShowQR(false)}>Go Back</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default BookedRooms
