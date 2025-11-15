import React, { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { useAppData } from "../../../Context/AppDataContext";
import { useAuth } from "../../../Context/AuthContext";
import "./SpaceManage.css"
import RoomQR from '../../RoomQR/RoomQR';

// API service functions
const API_BASE = 'http://localhost:3069'; // Adjust to your actual API base URL

const createAPIHeaders = (token, isFormData = false) => {
  const headers = {
    Authorization: `Bearer ${token}`,
  };
  if (!isFormData) {
    headers['Content-Type'] = 'application/json';
  }
  return headers;
};

const roomAPI = {
  create: async (data, token) => {
    const res = await fetch(`${API_BASE}/study-space`, {
      method: 'POST',
      headers: createAPIHeaders(token),
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to create room');
    return res.json();
  },
  
  update: async (id, data, token) => {
    const res = await fetch(`${API_BASE}/study-space/${id}`, {
      method: 'PUT',
      headers: createAPIHeaders(token),
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to update room');
    return res.json();
  },
  
  delete: async (id, token) => {
    const res = await fetch(`${API_BASE}/study-space/${id}`, {
      method: 'DELETE',
      headers: createAPIHeaders(token)
    });
    if (!res.ok) throw new Error('Failed to delete room');
    return res.json();
  },
  
  updateStatus: async (id, status, token) => {
    const res = await fetch(`${API_BASE}/study-space/${id}/status`, {
      method: 'PATCH',
      headers: createAPIHeaders(token),
      body: JSON.stringify({ status })
    });
    if (!res.ok) throw new Error('Failed to update status');
    return res.json();
  },
  
  uploadImage: async (id, file, token) => {
    console.log('=== FRONTEND DEBUG ===');
    console.log('ID:', id);
    console.log('File:', file);
    console.log('File type:', file.type);
    console.log('File size:', file.size);
    const formData = new FormData();
    formData.append('images', file);
      // Kiểm tra FormData
    for (let pair of formData.entries()) {
      console.log(pair[0], pair[1]);
    }

    const res = await fetch(`${API_BASE}/study-space/${id}/upload`, {
      method: 'POST',
      headers: {
          Authorization: `Bearer ${token}`
        },
      body: formData
    });
    if (!res.ok) throw new Error('Failed to upload image');
    return res.json();
  },
  
  deleteImage: async (roomId, imageId, token) => {
    const res = await fetch(`${API_BASE}/study-space/${roomId}/delete-img/${imageId}`, {
      method: 'DELETE',
      headers: createAPIHeaders(token)
    });
    if (!res.ok) throw new Error('Failed to delete image');
    return res.json();
  },
  
  getQR: async (id, token) => {
    const res = await fetch(`${API_BASE}/study-space/${id}/qr`, {
      headers: createAPIHeaders(token)
    });
    if (!res.ok) throw new Error('Failed to get QR code');
    return res.json();
  },
  
  getDevices: async (token) => {
    const res = await fetch(`${API_BASE}/study-space/devices`, {
      headers: createAPIHeaders(token)
    });
    if (!res.ok) throw new Error('Failed to get devices');
    return res.json();
  },
  
  mapIoT: async (id, iotData, token) => {
    const res = await fetch(`${API_BASE}/study-space/${id}/iot-map`, {
      method: 'POST',
      headers: createAPIHeaders(token),
      body: JSON.stringify(iotData)
    });
    if (!res.ok) throw new Error('Failed to map IoT devices');
    return res.json();
  }
};

function RoomTable({ rooms, onEdit, onDelete, onStatusChange, onViewDevices }) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredRooms = rooms.filter(
    r =>
      r.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.building?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.type?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="sm-table-wrap">
      <input
        type="text"
        className="sm-search"
        placeholder="Search rooms by name, building, or type..."
        value={searchTerm}
        onChange={e => setSearchTerm(e.target.value)}
      />
      <table className="sm-table">
        <thead>
          <tr>
            <th>Room Name</th>
            <th>Building</th>
            <th>Type</th>
            <th>Capacity</th>
            <th>Devices</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredRooms.length === 0 ? (
            <tr>
              <td colSpan="7" style={{ textAlign: 'center', padding: '20px' }}>
                No rooms found
              </td>
            </tr>
          ) : (
            filteredRooms.map(r => (
              <tr key={r.ID}>
                <td>{r.name}</td>
                <td>{r.building}</td>
                <td>{r.type}</td>
                <td>{r.capacity}</td>
                <td>
                  <button 
                    className="device-count-btn"
                    onClick={() => onViewDevices(r)}
                    title="View devices"
                  >
                    {r.device?.length || 0} devices
                  </button>
                </td>
                <td>
                  <select 
                    className={`badge ${r.status?.replace(/\s+/g,'').toLowerCase()}`}
                    value={r.status}
                    onChange={(e) => onStatusChange(r.ID, e.target.value)}
                  >
                    <option value="Available">Available</option>
                    <option value="InUse">Unavailable</option>
                    <option value="Maintenance">Maintenance</option>
                  </select>
                </td>
                <td className="actions">
                  <button className="icon-btn" onClick={() => onEdit(r)} title="Edit">✎</button>
                  <button className="icon-btn" onClick={() => onDelete(r.ID)} title="Delete">🗑</button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

function DeviceModal({ room, onClose }) {
  if (!room) return null;

  return (
    <div className="sm-modal-overlay" onClick={onClose}>
      <div className="sm-modal-small" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Devices in {room.name}</h3>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        <div className="device-list">
          {room.device && room.device.length > 0 ? (
            room.device.map(d => (
              <div key={d.ID} className="device-item">
                <div className="device-info">
                  <h4>{d.name}</h4>
                  <p className="device-type">Type: {d.type}</p>
                  <p className="device-desc">{d.description}</p>
                  <p className="device-energy">Energy: {d.energy_consumption} kW</p>
                </div>
              </div>
            ))
          ) : (
            <p className="no-devices">No devices in this room</p>
          )}
        </div>
      </div>
    </div>
  );
}

function RoomModal({ room, onClose, onSave, allDevices, token }) {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    building: '',
    type: 'classroom',
    capacity: 1,
    status: 'available',
    description: '',
    manager_id: user?.id || null,
    ...room
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [qrCode, setQrCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [availableDevices, setAvailableDevices] = useState([]);
  const [selectedDeviceIds, setSelectedDeviceIds] = useState([]);
  const [newDevice, setNewDevice] = useState({
    name: '',
    type: 'projector',
    description: '',
    energy_consumption: 0
  });

  useEffect(() => {
    if (room?.ID) {
      loadQRCode(room.ID);
    }
    loadDevices();
  }, [room]);

  const loadDevices = async () => {
    try {
      const data = await roomAPI.getDevices(token);
      setAvailableDevices(data.devices || []);
    } catch (err) {
      console.error('Failed to load devices:', err);
    }
  };

  const loadQRCode = async (id) => {
    try {
      const data = await roomAPI.getQR(id, token);
      setQrCode(data.qrCode || data.qr_code || '');
    } catch (err) {
      console.error('Failed to load QR code:', err);
      // Generate fallback QR code
      setQrCode(`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=room-${id}`);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileSelect = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handleUploadImage = async () => {
    if (!selectedFile || !room?.ID) {
      alert('Please select a file and save the room first');
      return;
    }
    
    setLoading(true);
    try {
      await roomAPI.uploadImage(room.ID, selectedFile, token);
      alert('Image uploaded successfully!');
      setSelectedFile(null);
    } catch (err) {
      alert('Failed to upload image: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleMapIoT = async () => {
    if (!room?.ID) {
      alert('Please save the room first');
      return;
    }
    
    if (selectedDeviceIds.length === 0) {
      alert('Please select at least one device');
      return;
    }
    
    setLoading(true);
    try {
      await roomAPI.mapIoT(room.ID, { device_ids: selectedDeviceIds }, token);
      alert('IoT devices mapped successfully!');
      setSelectedDeviceIds([]);
    } catch (err) {
      alert('Failed to map IoT devices: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleDeviceSelection = (deviceId) => {
    setSelectedDeviceIds(prev => 
      prev.includes(deviceId) 
        ? prev.filter(id => id !== deviceId)
        : [...prev, deviceId]
    );
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.building) {
      alert('Please fill in room name and building');
      return;
    }

    setLoading(true);
    try {
      await onSave(formData);
      alert(room ? 'Room updated successfully!' : 'Room created successfully!');
      onClose();
    } catch (err) {
      alert('Failed to save room: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="sm-modal-overlay" onClick={onClose}>
      <div className="sm-modal-large" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{room ? 'Edit Room' : 'Add New Room'}</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="modal-content">
          <div className="modal-left">
            <div className="form-section">
              <h3>Basic Information</h3>
              
              <div className="form-group">
                <label>Room Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={e => handleChange('name', e.target.value)}
                  placeholder="e.g., H101"
                />
              </div>

              <div className="form-group">
                <label>Building *</label>
                <input
                  type="text"
                  value={formData.building}
                  onChange={e => handleChange('building', e.target.value)}
                  placeholder="e.g., H1"
                />
              </div>

              <div className="form-group">
                <label>Type</label>
                <select
                  value={formData.type}
                  onChange={e => handleChange('type', e.target.value)}
                >
                  <option value="classroom">Classroom</option>
                  <option value="lab">Laboratory</option>
                  <option value="meeting_room">Meeting Room</option>
                  <option value="study_room">Study Room</option>
                  <option value="lecture_hall">Lecture Hall</option>
                </select>
              </div>

              <div className="form-group">
                <label>Capacity</label>
                <input
                  type="number"
                  min="1"
                  value={formData.capacity}
                  onChange={e => handleChange('capacity', parseInt(e.target.value))}
                />
              </div>

              <div className="form-group">
                <label>Status</label>
                <select
                  value={formData.status}
                  onChange={e => handleChange('status', e.target.value)}
                >
                  <option value="available">Available</option>
                  <option value="unavailable">Unavailable</option>
                  <option value="maintenance">Maintenance</option>
                </select>
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={formData.description}
                  onChange={e => handleChange('description', e.target.value)}
                  placeholder="Enter room description"
                  rows="3"
                />
              </div>
            </div>

            {room?.ID && (
              <div className="form-section">
                <h3>Image Upload</h3>
                <div className="image-upload">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                  />
                  {selectedFile && (
                    <button 
                      className="btn-upload"
                      onClick={handleUploadImage}
                      disabled={loading}
                    >
                      Upload Image
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="modal-right">
            {room?.ID && (
              <>
                <div className="form-section">
                  <h3>QR Code</h3>
                  <RoomQR roomId={ room?.ID }/>
                </div>

                <div className="form-section">
                  <h3>IoT Device Mapping</h3>
                  <div className="device-mapping">
                    {availableDevices.length > 0 ? (
                      <div className="device-checkboxes">
                        {availableDevices.map(device => (
                          <label key={device.ID} className="device-checkbox">
                            <input
                              type="checkbox"
                              checked={selectedDeviceIds.includes(device.ID)}
                              onChange={() => toggleDeviceSelection(device.ID)}
                            />
                            <span>{device.name} ({device.type})</span>
                          </label>
                        ))}
                      </div>
                    ) : (
                      <p className="no-devices">No available devices</p>
                    )}
                    {selectedDeviceIds.length > 0 && (
                      <button 
                        className="btn-map"
                        onClick={handleMapIoT}
                        disabled={loading}
                      >
                        Map Selected Devices
                      </button>
                    )}
                  </div>
                </div>

                <div className="form-section">
                  <h3>Current Devices</h3>
                  <div className="current-devices">
                    {room.device && room.device.length > 0 ? (
                      room.device.map(d => (
                        <div key={d.ID} className="device-chip">
                          {d.name} ({d.type})
                        </div>
                      ))
                    ) : (
                      <p className="no-devices">No devices mapped</p>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="modal-footer">
          <button 
            className="btn-save"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? 'Saving...' : (room ? 'Update Room' : 'Create Room')}
          </button>
          <button 
            className="btn-cancel"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

export default function SpaceManage() {
  const { rooms: contextRooms, refreshRooms } = useAppData();
  const [rooms, setRooms] = useState(contextRooms || []);
  const [modalOpen, setModalOpen] = useState(false);
  const [deviceModalOpen, setDeviceModalOpen] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [allDevices, setAllDevices] = useState([]);

  const {user} = useAuth();
  const token = user?.accessToken;


  useEffect(() => {
    setRooms(contextRooms || []);
  }, [contextRooms]);

  const handleCreate = () => {
    setSelectedRoom(null);
    setModalOpen(true);
  };

  const handleEdit = (room) => {
    setSelectedRoom(room);
    setModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this room?')) {
      return;
    }

    try {
      await roomAPI.delete(id, token);
      setRooms(prev => prev.filter(r => r.ID !== id));
      if (refreshRooms) refreshRooms();
      alert('Room deleted successfully!');
    } catch (err) {
      alert('Failed to delete room: ' + err.message);
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await roomAPI.updateStatus(id, newStatus, token);
      setRooms(prev => prev.map(r => 
        r.ID === id ? { ...r, status: newStatus } : r
      ));
      if (refreshRooms) refreshRooms();
    } catch (err) {
      alert('Failed to update status: ' + err.message);
    }
  };

  const handleSave = async (formData) => {
    if (selectedRoom) {
      // Update existing room
      await roomAPI.update(selectedRoom.ID, formData, token);
      setRooms(prev => prev.map(r => 
        r.ID === selectedRoom.ID ? { ...r, ...formData } : r
      ));
    } else {
      // Create new room
      const result = await roomAPI.create(formData, token);
      setRooms(prev => [...prev, result.room || result]);
    }
    if (refreshRooms) refreshRooms();
  };

  const handleViewDevices = (room) => {
    setSelectedRoom(room);
    setDeviceModalOpen(true);
  };

  return (
    <div className="space-mgmt">
      <div className="sm-header">
        <h1>Room Management</h1>
        <button className="btn-add" onClick={handleCreate}>
          + Add New Room
        </button>
      </div>

      <RoomTable 
        rooms={rooms}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onStatusChange={handleStatusChange}
        onViewDevices={handleViewDevices}
      />

      {modalOpen && (
        <RoomModal
          room={selectedRoom}
          onClose={() => setModalOpen(false)}
          onSave={handleSave}
          allDevices={allDevices}
          token={token}
        />
      )}

      {deviceModalOpen && (
        <DeviceModal
          room={selectedRoom}
          onClose={() => setDeviceModalOpen(false)}
        />
      )}
    </div>
  );
}