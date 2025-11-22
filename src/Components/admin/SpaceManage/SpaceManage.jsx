import { useState, useEffect } from 'react';
import 'react-datepicker/dist/react-datepicker.css';
import { useAppData } from "../../../Context/AppDataContext";
import { useAuth } from "../../../Context/AuthContext";
import "./SpaceManage.css"
import axiosClient from '../../../config/axiosClient'; // Import the centralized client

// --- NEW: Simplified API calls using axiosClient ---
// Note: No need to pass 'token' anymore; interceptors handle it.
const roomAPI = {
  create: async (data) => {
    const res = await axiosClient.post('/study-space', data);
    return res.data?.metaData?.newRoom || res.data;
  },
  
  update: async (id, data) => {
    const res = await axiosClient.put(`/study-space/${id}`, data);
    return res.data?.metaData?.updatedRoom || res.data;
  },
  
  delete: async (id) => {
    const res = await axiosClient.delete(`/study-space/${id}`);
    return res.data;
  },
  
  updateStatus: async (id, status) => {
    const res = await axiosClient.patch(`/study-space/${id}/status`, { status });
    return res.data;
  },
  
  uploadImage: async (id, file) => {
    const formData = new FormData();
    formData.append('images', file);

    const res = await axiosClient.post(`/study-space/${id}/upload`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data', 
      },
    });
    return res.data;
  },
  
  deleteImage: async (roomId, imageId) => {
    const res = await axiosClient.delete(`/study-space/${roomId}/delete-img/${imageId}`);
    return res.data;
  },
  
  getQR: async (id) => {
    const res = await axiosClient.get(`/study-space/${id}/qr`);
    return res.data?.metaData || res.data;
  },
  
  getDevices: async () => {
    const res = await axiosClient.get('/study-space/devices');
    return res.data?.metaData || res.data;
  },
  
  mapIoT: async (id, iotData) => {
    const res = await axiosClient.post(`/study-space/${id}/iot-map`, iotData);
    return res.data;
  }
};

// --- Components ---

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

function RoomModal({ room, onClose, onSave, onRefresh }) {
  const { user } = useAuth();
  // Remove token from here, API calls don't need it passed explicitly anymore
  
  const [formData, setFormData] = useState({
    name: '',
    building: '',
    type: 'classroom',
    capacity: 1,
    status: 'available',
    description: '',
    manager_id: user?.ID || null, // Ensure we use user.ID (uppercase matches backend)
    ...room
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [qrCode, setQrCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [availableDevices, setAvailableDevices] = useState([]);
  const [selectedDeviceIds, setSelectedDeviceIds] = useState([]);

  useEffect(() => {
    if (room?.ID) {
      loadQRCode(room.ID);
    }
    loadDevices();
    // eslint-disable-next-line
  }, [room]);

  const loadDevices = async () => {
    try {
      const data = await roomAPI.getDevices();
      setAvailableDevices(data.deviceList || []);
    } catch (err) {
      console.error('Failed to load devices:', err);
    }
  };

  const loadQRCode = async (id) => {
    try {
      const data = await roomAPI.getQR(id);
      setQrCode(data.qr_path || '');
    } catch (err) {
      console.error('Failed to load QR code:', err);
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
      await roomAPI.uploadImage(room.ID, selectedFile);
      alert('Image uploaded successfully!');
      setSelectedFile(null);
      if (onRefresh) onRefresh();
    } catch (err) {
      alert('Failed to upload image: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteImage = async (imageId) => {
      if (!window.confirm("Delete this image?")) return;
  
      setLoading(true);
      try {
        await roomAPI.deleteImage(room.ID, imageId);
        alert('Image deleted successfully!');
        if (onRefresh) onRefresh(); // Refresh data to remove image from UI
      } catch (err) {
        alert('Failed to delete image: ' + err.message);
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
      await roomAPI.mapIoT(room.ID, { deviceIds: selectedDeviceIds });
      alert('IoT devices mapped successfully!');
      setSelectedDeviceIds([]);
      if (onRefresh) onRefresh();
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
                <h3>Image Management</h3>
                
                {/* Display Images */}
                 <div className="current-images-container" style={{ marginBottom: '15px' }}>
                  {room.room_image && room.room_image.length > 0 ? (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                      {room.room_image.map(img => (
                        <div key={img.id} style={{ position: 'relative', width: '100px', height: '100px' }}>
                          <img 
                            src={img.image_url} 
                            alt="Room" 
                            style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '4px' }} 
                          />
                          <button 
                            onClick={() => handleDeleteImage(img.id)}
                            style={{
                              position: 'absolute', top: -5, right: -5, 
                              background: 'red', color: 'white', border: 'none', 
                              borderRadius: '50%', width: '20px', height: '20px', 
                              cursor: 'pointer', fontSize: '12px', lineHeight: '1'
                            }}
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p style={{ color: '#666', fontStyle: 'italic' }}>No images uploaded yet.</p>
                  )}
                </div>

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
                   <div style={{textAlign: 'center'}}>
                     {qrCode ? <img src={qrCode} alt="Room QR" style={{maxWidth: '100%', maxHeight: '200px'}} /> : 'Loading QR...'}
                  </div>
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
  const { rooms: contextRooms, refreshData } = useAppData();
  const [rooms, setRooms] = useState(contextRooms || []);
  const [modalOpen, setModalOpen] = useState(false);
  const [deviceModalOpen, setDeviceModalOpen] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);

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

  const handleStatusChange = async (id, newStatus) => {
    try {
      await roomAPI.updateStatus(id, newStatus);
      
      // 2. Refresh
      if (refreshData) await refreshData();
      
    } catch (err) {
      alert('Failed to update status: ' + err.message);
    }
  };

  const handleSave = async (formData) => {
    try {
      if (selectedRoom) {
        await roomAPI.update(selectedRoom.ID, formData);
      } else {
        await roomAPI.create(formData);
      }
      
      // 2. Refresh
      if (refreshData) await refreshData();
      
    } catch (err) {
      alert(err.message); // Handle errors from modal save
    }
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
        onStatusChange={handleStatusChange}
        onViewDevices={handleViewDevices}
      />

      {modalOpen && (
        <RoomModal
          room={selectedRoom}
          onClose={() => setModalOpen(false)}
          onSave={handleSave}
          onRefresh={refreshData}
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