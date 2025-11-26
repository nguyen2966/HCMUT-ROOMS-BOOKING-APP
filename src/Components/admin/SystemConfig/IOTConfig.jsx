import { useMemo, useEffect, useState } from "react";

// Data structure for IOT related settings
const IOT_CONFIG_GROUP = {
    "IOT": [
        { key: "CHECKIN_GRACE_PERIOD", label: "Maximum Check-in Time (minutes)" },
        { key: "CHECKOUT_GRACE_PERIOD", label: "Maximum Check-out Time (minutes)" },
        { key: "AUTO_CHECKOUT", label: "Automatic Check-out upon expiration" },
        { key: "REMINDER_MINUTES", label: "Check-in Reminder (minutes prior)" },
        { key: "SESSION_TIMEOUT", label: "Session Timeout (minutes)" },
        { key: "IOT_TURN_ON_DELAY", label: "IOT Device Turn-On Delay (seconds)" },
        { key: "IOT_TURN_OFF_DELAY", label: "IOT Device Turn-Off Delay (seconds)" },
        { key: "ENERGY_REPORT_PERIOD", label: "Energy Report Cycle (hours)" },
    ]
};

// Sử dụng lại ConfigItem từ ApplicationConfig (cần đặt ở file riêng như ConfigItem.jsx nếu muốn tối ưu hơn)
function ConfigItem({ config, onSave }) {
    const [inputValue, setInputValue] = useState(config.value);
    const [isEditing, setIsEditing] = useState(false);
    
    const isBoolean = inputValue === 'true' || inputValue === 'false';

    const handleSave = () => {
        if (inputValue === config.value) {
            setIsEditing(false);
            return;
        }
        
        const newValue = isBoolean ? inputValue : (+inputValue).toString();

        if (onSave) {
            onSave(config.ID, newValue);
        }
        setIsEditing(false);
    };

    const handleInputChange = (e) => {
        setInputValue(e.target.value);
    };
    
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
                            <option value="true">On</option>
                            <option value="false">Off</option>
                        </select>
                    ) : (
                         <input 
                            type="number" 
                            value={inputValue} 
                            onChange={handleInputChange}
                            style={{width: 100}}
                        />
                    )
                ) : (
                    <span className="config-value-display">
                        {isBoolean ? (inputValue === 'true' ? 'On' : 'Off') : inputValue}
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

export default function IOTConfig({ configs, onSave }) {
    const currentCategoryConfigs = useMemo(() => {
        const group = IOT_CONFIG_GROUP["IOT"] || [];
        
        return group.map(item => {
            const configData = configs[item.key];
            return {
                key: item.key,
                label: item.label,
                ID: configData?.ID,
                value: configData?.value || 'N/A' 
            };
        }).filter(item => item.ID); 
    }, [configs]);
    
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