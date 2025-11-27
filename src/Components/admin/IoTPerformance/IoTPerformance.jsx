import React, { useState, useContext } from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import reportAPI from "../../../services/reportService";
import { AuthContext } from "../../../Context/AuthContext";
import "./IoTPerformance.css";

// Device types for IoT performance
const DEVICE_TYPES = ['Air-conditioner', 'Lights', 'Ceiling fan', 'Projector'];

// Distribution ratios for devices (based on typical usage patterns)
const DEVICE_RATIOS = {
  'Air-conditioner': 0.35,  // 35% - highest energy consumer
  'Lights': 0.30,           // 30% - second highest
  'Ceiling fan': 0.20,      // 20%
  'Projector': 0.15         // 15% - lowest
};

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export default function IoTPerformance() {
  const { accessToken, user } = useContext(AuthContext);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [reportId, setReportId] = useState(null);
  const [useSampleData, setUseSampleData] = useState(true);
  const [chartData, setChartData] = useState({
    labels: [],
    datasets: [],
  });

  // Generate years for dropdown (current year and past 5 years)
  const years = Array.from({ length: 6 }, (_, i) => new Date().getFullYear() - i);

  // Sample data for demo/testing
  const generateSampleData = () => {
    const devices = DEVICE_TYPES;
    const performanceData = [
      { device: 'Air-conditioner', thisQuarter: 85, lastQuarter: 78 },
      { device: 'Lights', thisQuarter: 92, lastQuarter: 88 },
      { device: 'Ceiling fan', thisQuarter: 76, lastQuarter: 82 },
      { device: 'Projector', thisQuarter: 68, lastQuarter: 71 }
    ];
    return { devices, performanceData };
  };

  // Distribute IoT device performance by device type
  const distributePerformanceByDevice = (totalPerformance) => {
    const performanceData = DEVICE_TYPES.map(device => {
      const baseValue = totalPerformance * DEVICE_RATIOS[device];
      // Simulate current quarter vs last quarter variation
      const thisQuarter = Math.round(baseValue * (0.9 + Math.random() * 0.2)); // 90-110% of base
      const lastQuarter = Math.round(baseValue * (0.85 + Math.random() * 0.3)); // 85-115% of base
      
      return {
        device,
        thisQuarter,
        lastQuarter
      };
    });

    return { devices: DEVICE_TYPES, performanceData };
  };

  const fetchPerformanceData = async () => {
    setLoading(true);
    setError(null);

    try {
      // Use sample data if toggled
      if (useSampleData) {
        const { devices, performanceData } = generateSampleData();
        processPerformanceData(devices, performanceData);
        setReportId(null);
        setLoading(false);
        return;
      }

      if (!accessToken || !user) {
        setError("User not authenticated. Please login.");
        setLoading(false);
        return;
      }

      const periodStart = new Date(selectedYear, 0, 1).toISOString();
      const periodEnd = new Date(selectedYear, 11, 31, 23, 59, 59).toISOString();

      console.log('Fetching IoT performance data for year:', selectedYear);
      const report = await reportAPI.createEnergyReport(
        user.ID,
        periodStart,
        periodEnd,
        accessToken
      );

      console.log('Energy report response:', report);
      
      if (report) {
        setReportId(report.ID);
        
        // Backend returns iot_device_performance as total value
        const totalPerformance = report.iot_device_performance || 100;
        
        console.log('Total IoT device performance:', totalPerformance);
        
        // Distribute by device type
        const { devices, performanceData } = distributePerformanceByDevice(totalPerformance);
        processPerformanceData(devices, performanceData);
      } else {
        setError("No IoT performance data available for this year");
        setChartData({
          labels: [],
          datasets: [],
        });
      }
    } catch (err) {
      console.error("Error fetching IoT performance data:", err);
      const errorMsg = err.response?.data?.message || err.message || "Failed to fetch data from server";
      setError(errorMsg);
      
      setChartData({
        labels: [],
        datasets: [],
      });
    } finally {
      setLoading(false);
    }
  };

  const processPerformanceData = (devices, performanceData) => {
    const datasets = [
      {
        label: 'This quarter',
        data: performanceData.map(item => item.thisQuarter || 0),
        backgroundColor: 'rgba(124, 58, 237, 0.8)',
        borderColor: 'rgb(124, 58, 237)',
        borderWidth: 1,
      },
      {
        label: 'Last quarter',
        data: performanceData.map(item => item.lastQuarter || 0),
        backgroundColor: 'rgba(196, 181, 253, 0.8)',
        borderColor: 'rgb(196, 181, 253)',
        borderWidth: 1,
      }
    ];

    setChartData({
      labels: devices,
      datasets: datasets,
    });
  };

  // Initial fetch and refetch on dependency changes
  React.useEffect(() => {
    fetchPerformanceData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedYear, accessToken, user, useSampleData]);

  const chartOptions = {
    indexAxis: 'y', // Horizontal bar chart
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'bottom',
        labels: {
          boxWidth: 15,
          boxHeight: 15,
          padding: 15,
          font: {
            size: 12,
          },
          usePointStyle: true,
          pointStyle: 'circle',
        },
      },
      title: {
        display: false,
      },
      tooltip: {
        mode: "index",
        intersect: false,
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        padding: 12,
        titleColor: "#fff",
        bodyColor: "#fff",
        borderColor: "rgba(124, 58, 237, 0.5)",
        borderWidth: 1,
        callbacks: {
          label: function (context) {
            return `${context.dataset.label}: ${context.parsed.x}`;
          },
        },
      },
    },
    scales: {
      x: {
        beginAtZero: true,
        max: 100,
        grid: {
          color: "rgba(0, 0, 0, 0.05)",
          drawBorder: false,
        },
        ticks: {
          stepSize: 25,
          callback: function (value) {
            return value;
          },
        },
      },
      y: {
        grid: {
          display: false,
        },
        ticks: {
          font: {
            size: 11,
          },
        },
      },
    },
    interaction: {
      mode: "index",
      intersect: false,
    },
  };

  return (
    <div className="iot-performance">
      <div className="content-header">
        <h2>IOT DEVICES PERFORMANCE</h2>
        <div className="header-controls">
          <button 
            className={`data-toggle-btn ${useSampleData ? 'sample' : 'real'}`}
            onClick={() => setUseSampleData(!useSampleData)}
            title="Toggle between real and sample data"
          >
            {useSampleData ? '📊 Sample Data' : '🔗 Real Data'}
          </button>
          {reportId && (
            <span className="report-info" title={`Report ID: ${reportId}`}>
              📄 Report #{reportId}
            </span>
          )}
          <div className="year-selector">
            <label>this year</label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
            >
              {years.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="chart-container">
        {loading ? (
          <div className="loading-state">
            <p>Loading chart data...</p>
          </div>
        ) : error ? (
          <div className="error-state">
            <p>Error: {error}</p>
            <button onClick={fetchPerformanceData}>Retry</button>
          </div>
        ) : (
          <Bar data={chartData} options={chartOptions} />
        )}
      </div>
    </div>
  );
}
