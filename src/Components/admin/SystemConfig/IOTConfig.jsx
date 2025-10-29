import React, { useState } from "react";

export default function IOTConfig() {
  const [config, setConfig] = useState({
    IOT_TURN_ON_DELAY: "",
    IOT_TURN_OFF_DELAY: "",
    ENERGY_REPORT_PERIOD: "Daily",
  });

  return (
    <div className="config-section">
      <div className="config-item">
        <label>IOT_TURN_ON_DELAY(s)</label>
        <input
          type="number"
          placeholder="VD: 30"
          value={config.IOT_TURN_ON_DELAY}
          onChange={(e) =>
            setConfig({ ...config, IOT_TURN_ON_DELAY: e.target.value })
          }
        />
      </div>
      
      <div className="config-item">
          <label>IOT_TURN_OFF_DELAY</label>
           <input
            type="number"
            placeholder="VD: 60"
            value={config.IOT_TURN_OFF_DELAY}
            onChange={(e) =>
              setConfig({ ...config, IOT_TURN_OFF_DELAY: e.target.value })
            }
          />
      </div>
      
      <label>ENERGY_REPORT_PERIOD</label>
      <select
        value={config.ENERGY_REPORT_PERIOD}
        onChange={(e) =>
          setConfig({ ...config, ENERGY_REPORT_PERIOD: e.target.value })
        }
      >
        <option>Daily</option>
        <option>Weekly</option>
        <option>Monthly</option>
      </select>
    </div>
  );
}
