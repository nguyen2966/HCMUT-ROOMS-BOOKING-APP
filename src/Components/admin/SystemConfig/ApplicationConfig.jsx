import { useState, useMemo, useEffect } from "react";

// Data structure to define groups and config keys
const APP_CONFIG_GROUPS = {
  "Service time": [
    { key: "SYSTEM_OPEN_TIME", label: "System open time (HH:MM)" },
    { key: "SYSTEM_CLOSE_TIME", label: "System close time (HH:MM)" },
  ],
  "Booking duration": [
    { key: "MIN_BOOKING_DURATION", label: "Minimun booking duration (min)" },
    { key: "MAX_BOOKING_DURATION", label: "Maximum booking duration (min)" },
  ],
  "Maximum bookings": [
    { key: "MAX_BOOKINGS_PER_WEEK_STUDENT", label: "Max bookings for student (per week)" },
    { key: "MAX_BOOKINGS_PER_WEEK_LECTURER", label: "Max bookings for lectured (per week)" },
  ],
  "Advance booking": [
    { key: "ADVANCE_BOOKING_DAYS_STUDENT", label: "students (days)" },
    { key: "ADVANCE_BOOKING_DAYS_LECTURER", label: "Lecturer (days)" },
  ],
  "Group size": [
    { key: "MAX_GROUP_SIZE", label: "Maximum group size" },
  ],
  "Penalty": [
    { key: "PENALTY_NO_CHECKIN", label: "No check-in (point)" },
    { key: "PENALTY_NO_CHECKOUT", label: "No check-out (point)" },
    { key: "PENALTY_LATE_CHECKOUT", label: "Late checkout (point)" },
  ],
};

// Component con để hiển thị từng setting
function ConfigItem({ config, onSave }) {
    const [inputValue, setInputValue] = useState(config.value);
    const [isEditing, setIsEditing] = useState(false);
    
    // Xác định loại input (thời gian, boolean, hay số)
    const isTime = config.key.includes("TIME");
    const isBoolean = inputValue === 'true' || inputValue === 'false';
    const isNumber = !isTime && !isBoolean;

    const handleSave = () => {
        // Chỉ Save nếu giá trị thay đổi
        if (inputValue === config.value) {
            setIsEditing(false);
            return;
        }
        
        // Giá trị mới sẽ là string (cho time) hoặc number/boolean (sau khi ép kiểu)
        const newValue = isNumber ? (+inputValue).toString() : inputValue;

        if (onSave) {
            onSave(config.ID, newValue);
        }
        setIsEditing(false);
    };

    const handleInputChange = (e) => {
        setInputValue(e.target.value);
    };
    
    // Đồng bộ input state khi config data từ server thay đổi (sau khi save thành công)
    useEffect(() => {
        setInputValue(config.value);
    }, [config.value]);

    
    return (
        <div className="config-item">
            <div className="config-item-info">
                <label>{config.label}</label>
                <p className="config-key">{config.key}</p>
            </div>
            
            <div className="config-item-action">
                {isEditing ? (
                    isBoolean ? (
                        <select value={inputValue} onChange={handleInputChange} style={{width: 100}}>
                            <option value="true">Bật</option>
                            <option value="false">Tắt</option>
                        </select>
                    ) : (
                         <input 
                            type={isTime ? "time" : "text"} 
                            value={inputValue} 
                            onChange={handleInputChange}
                            step={isTime ? 60 : undefined} // Step for time input
                            style={{width: isTime ? 120 : 100}}
                        />
                    )
                ) : (
                    <span className="config-value-display">
                        {isBoolean ? (inputValue === 'true' ? 'Bật' : 'Tắt') : inputValue}
                    </span>
                )}
                
                <button 
                    className={`btn-edit ${isEditing ? 'btn-save-item' : ''}`}
                    onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                >
                    {isEditing ? 'Save' : 'Configure'}
                </button>
            </div>
        </div>
    );
}


export default function ApplicationConfig({ category, configs, onSave }) {
    
    const currentCategoryConfigs = useMemo(() => {
        const group = APP_CONFIG_GROUPS[category] || [];
        
        // Map local group structure with live config data
        return group.map(item => {
            const configData = configs[item.key];
            return {
                key: item.key,
                label: item.label,
                ID: configData?.ID,
                value: configData?.value || 'N/A' 
            };
        }).filter(item => item.ID); 
    }, [category, configs]);
    
    return (
        <div className="config-panel">
            {currentCategoryConfigs.map(config => (
                <ConfigItem 
                    key={config.key} 
                    config={config} 
                    onSave={onSave}
                />
            ))}
        </div>
    );
}