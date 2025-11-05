import React, { useState } from 'react'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import './CSS/Rooms.css'
import './admin/Spacemanage.css'

const mockSpaces = [
  { id: 'Room H1.301', campus: 'Di An', building: 'H6', status: 'Available' },
  { id: 'Room H3.105', campus: 'Di An', building: 'H3', status: 'In used' },
  { id: 'Room H2.106', campus: 'Di An', building: 'H2', status: 'Maintaining' },
  { id: 'Room H3.402', campus: 'Di An', building: 'H3', status: 'Available' },
  { id: 'Room H3.501', campus: 'Di An', building: 'H3', status: 'Maintaining' },
  { id: 'Room H1.506', campus: 'Di An', building: 'H1', status: 'Available' },
]

function SpaceCard({s, onOpen}){
  const statusClass = s.status === 'Available' ? 'available' : (s.status === 'In used' ? 'inuse' : 'checkedout')
  return (
    <div className={"ls-room-card " + statusClass} onClick={() => onOpen(s)}>
      <div className="room-thumb" />
      <div className="room-info">
        <div className="room-info-top">
          <div className="info-left">
            <div className="room-id">{s.id}</div>
            <div className="room-meta">Campus: {s.campus}<br/>Building: {s.building}</div>
          </div>

          <div className="room-status">
            {s.status === 'Available' && <span className="status-pill">Available</span>}
            {s.status === 'In used' && <span className="status-pill inuse-status">In used</span>}
            {s.status === 'Maintaining' && <span className="status-pill maintaining-status">Maintaining</span>}
          </div>
        </div>

        <div className="room-tags">
          <button className="tag">TV</button>
          <button className="tag active">Whiteboard</button>
          <button className="tag">Slide screen</button>
        </div>
      </div>
    </div>
  )
}

export default function LearningSpaces(){
  const [selected, setSelected] = useState(null)
  const [open, setOpen] = useState(false)

  function openModal(s){
    setSelected(s)
    setOpen(true)
  }

  function closeModal(){
    setOpen(false)
    setSelected(null)
  }

  return (
    <div className="learning-spaces">
      <h2 className="page-title">Learning Spaces</h2>
      <div className="rooms-grid">
        {mockSpaces.map(s => <SpaceCard key={s.id} s={s} onOpen={openModal} />)}
      </div>

      {open && selected && (
        <div className="sm-modal-overlay" onClick={closeModal}>
          <div className="sm-modal" onClick={e => e.stopPropagation()}>
            <div className="sm-left">
              <div className="sm-image-placeholder">Preview image</div>

              {/* info row: left = room/campus/building, right = device tags */}
              <div className="sm-desc">
                <div className="sm-desc-row">
                  <div className="sm-desc-left">
                    <div className="room-title">{selected.id}</div>
                    <div className="room-meta"><strong>Campus:</strong> {selected.campus}</div>
                    <div className="room-meta"><strong>Building:</strong> {selected.building}</div>
                  </div>

                  <div className="sm-desc-right">
                    <div className="sm-tags">
                      <button className="tag">TV</button>
                      <button className="tag active">Whiteboard</button>
                      <button className="tag">Slide screen</button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="sm-actions">
                <button className="btn save" onClick={() => { alert('Reserved ' + selected.id); closeModal(); }}>Reserve</button>
              </div>
            </div>

            <div className="sm-right">
              <div className="sm-right-header">
                <div className="team-label">Team size:</div>
                <div className="team-input-wrap">
                  <input type="number" min="1" defaultValue={1} className="team-input" />
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

                  <button className="clock-icon" aria-label="time-picker">🕒</button>
                </div>

                <div className="calendar-box"><DatePicker inline /></div>

                <div className="qr-small">
                  <img src={`https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(selected.id)}`} alt="qr"/>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
