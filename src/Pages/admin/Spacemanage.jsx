import React, { useState } from 'react'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import './Spacemanage.css'

const mockRooms = [
  { id: 'H6-201', building: 'BK.B6', capacity: 40, status: 'Available', updated: '18/10/2025' },
  { id: 'H3-305', building: 'BK.B3', capacity: 30, status: 'Maintaining', updated: '18/10/2025' },
  { id: 'H2-106', building: 'BK.B2', capacity: 25, status: 'In used', updated: '18/10/2025' },
  { id: 'H1-701', building: 'BK.B1', capacity: 20, status: 'Maintaining', updated: '18/10/2025' },
  { id: 'H3-402', building: 'BK.B3', capacity: 50, status: 'Available', updated: '18/10/2025' },
  { id: 'H3-501', building: 'BK.B3', capacity: 40, status: 'Maintaining', updated: '18/10/2025' },
]

function RoomTable({rows, onOpenModal}){
  return (
    <div className="sm-table-wrap">
      <table className="sm-table">
        <thead>
          <tr>
            <th></th>
            <th>Room Name</th>
            <th>Building</th>
            <th>Capacity</th>
            <th>Status</th>
            <th>Last Updated</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(r=> (
            <tr key={r.id}>
              <td><input type="checkbox"/></td>
              <td className="room-name">{r.id}</td>
              <td>{r.building}</td>
              <td>{r.capacity}</td>
              <td><span className={`badge ${r.status.replace(/\s+/g,'').toLowerCase()}`}>{r.status}</span></td>
              <td>{r.updated}</td>
              <td className="actions">
                <button className="icon">✎</button>
                <button className="icon">🗑</button>
                <button className="icon">⚙</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default function SpaceManagement(){
  const [open,setOpen] = useState(false)

  return (
    <div className="space-mgmt">
      <div className="sm-header">
        <button className="sm-add" onClick={()=>setOpen(true)}>Add New Room</button>
        <input className="sm-search" placeholder="Search" />
      </div>

      <RoomTable rows={mockRooms} />

      {open && (
        <div className="sm-modal-overlay" onClick={()=>setOpen(false)}>
          <div className="sm-modal" onClick={e=>e.stopPropagation()}>
            <div className="sm-left">
              <div className="sm-image-placeholder">Upload image</div>
              <div className="sm-desc">
                <div className="sm-info-row">
                    <div className="sm-info-text">
                        <div>Room: ..............</div>
                        <div>Campus: ..........</div>
                        <div>Building: ........</div>
                    </div>
                    <div className="sm-tags">
                        <button className="tag">TV</button>
                        <button className="tag">Whiteboard</button>
                        <button className="tag">Slide screen</button>
                    </div>
                </div>
              </div>
              <div className="sm-actions">
                <button className="btn save">Save</button>
                <button className="btn cancel" onClick={()=>setOpen(false)}>Cancel</button>
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
                  <img src={`https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=admin-room`} alt="qr"/>
                </div>
                <button className="btn create">Create QR</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
