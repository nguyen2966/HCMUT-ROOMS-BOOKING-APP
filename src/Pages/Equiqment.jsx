import React, { useState, useMemo } from 'react';
import { useAppData } from '../Context/AppDataContext';
import './CSS/Equiqment.css'; // Ensure you created the CSS file above

const Equiqment = () => {
  // 1. Get Devices and Rooms from Global Context
  const { devices } = useAppData();
  const [filterType, setFilterType] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  // 2. Get Unique Device Types for Filter Buttons
  const deviceTypes = useMemo(() => {
    const types = new Set(devices.map(d => d.type));
    return ['All', ...Array.from(types)];
  }, [devices]);

  // 4. Filter Logic
  const filteredDevices = devices.filter(device => {
    const matchesType = filterType === 'All' || device.type === filterType;
    const matchesSearch = device.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          device.description?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesType && matchesSearch;
  });

  return (
    <div className='equipment-page'>
      
      {/* Header Section */}
      <div className="eq-header">
        <h1>Equipment Inventory</h1>
        <div className="eq-stats">
          <span>Total Devices: <strong>{devices.length}</strong></span>
          <span>Showing: <strong>{filteredDevices.length}</strong></span>
        </div>
      </div>

      {/* Filter & Search Section */}
      <div className="eq-filters">
        {deviceTypes.map(type => (
          <button 
            key={type}
            className={`filter-btn ${filterType === type ? 'active' : ''}`}
            onClick={() => setFilterType(type)}
          >
            {type.replace(/_/g, ' ')}
          </button>
        ))}
        
        <input 
          type="text" 
          placeholder="Search devices..." 
          className="filter-btn" // Reusing style for simplicity, can create specific class
          style={{cursor: 'text', minWidth: '200px'}}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Device Grid */}
      <div className="eq-grid">
        {filteredDevices.length > 0 ? (
          filteredDevices.map(device => (
            <div key={device.ID} className="device-card">
              
              {/* Image Area */}
              <div className="card-img-wrap">
                <span className="type-badge">{device.type?.replace(/_/g, ' ')}</span>
                {device.image_url ? (
                  <img 
                    src={device.image_url} 
                    alt={device.name} 
                    className="device-img"
                    onError={(e) => {e.target.src = 'https://via.placeholder.com/300x200?text=No+Image'}} // Fallback
                  />
                ) : (
                  <div className="no-image">📷</div>
                )}
              </div>

              {/* Info Area */}
              <div className="card-content">
                <h3>{device.name}</h3>
                <p className="device-desc">
                  {device.description || "No description available."}
                </p>
                
                <div className="card-footer">
                  <div className="energy-tag" title="Energy Consumption">
                    ⚡ {device.energy_consumption} kW
                  </div>
                </div>
              </div>

            </div>
          ))
        ) : (
          <div className="empty-state">
            <p>No devices found matching your filters.</p>
          </div>
        )}
      </div>

    </div>
  );
}

export default Equiqment;