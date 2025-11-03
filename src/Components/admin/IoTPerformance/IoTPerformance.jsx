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
import axios from "axios";
import API_BASE_URL from "../../../config/api";
import { AuthContext } from "../../../Context/AuthContext";
import "./IoTPerformance.css";

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
  const [useSampleData, setUseSampleData] = useState(true);
  const [chartData, setChartData] = useState({
    labels: [],
    datasets: [],
  });

  // Generate years for dropdown (current year and past 5 years)
  const years = Array.from({ length: 6 }, (_, i) => new Date().getFullYear() - i);

  // Hàm tạo dữ liệu mẫu cho IoT devices performance
  const generateSamplePerformance = () => {
    const devices = ['Air-conditioner', 'Lights', 'Ceiling fan', 'Projector'];
    
    const performanceData = devices.map(device => {
      let thisQuarter, lastQuarter;
      
      if (device === 'Air-conditioner') {
        thisQuarter = Math.floor(Math.random() * 15) + 15; // 15-30
        lastQuarter = Math.floor(Math.random() * 15) + 15; // 15-30
      } else if (device === 'Lights') {
        thisQuarter = Math.floor(Math.random() * 20) + 60; // 60-80
        lastQuarter = Math.floor(Math.random() * 15) + 15; // 15-30
      } else if (device === 'Ceiling fan') {
        thisQuarter = Math.floor(Math.random() * 15) + 40; // 40-55
        lastQuarter = Math.floor(Math.random() * 10) + 10; // 10-20
      } else { // Projector
        thisQuarter = Math.floor(Math.random() * 10) + 15; // 15-25
        lastQuarter = Math.floor(Math.random() * 5) + 5; // 5-10
      }
      
      return {
        device,
        thisQuarter,
        lastQuarter,
      };
    });

    return { devices, performanceData };
  };

  const fetchPerformanceData = async () => {
    setLoading(true);
    setError(null);

    try {
      // ===== DÙNG DỮ LIỆU MẪU ĐỂ KIỂM TRA =====
      if (useSampleData) {
        console.log('Đang dùng dữ liệu mẫu để kiểm tra đồ thị IoT performance...');
        const { devices, performanceData } = generateSamplePerformance();
        processPerformanceData(devices, performanceData);
        setLoading(false);
        return;
      }
      // ========================================

      // Code thực để kết nối API
      if (!accessToken || !user) {
        setError("User not authenticated. Please login.");
        setLoading(false);
        return;
      }

      const periodStart = new Date(selectedYear, 0, 1).toISOString();
      const periodEnd = new Date(selectedYear, 11, 31, 23, 59, 59).toISOString();

      const response = await axios.get(
        `${API_BASE_URL}/report/iot-performance`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          params: {
            startDate: periodStart,
            endDate: periodEnd,
          }
        }
      );

      if (response.data && response.data.data) {
        const { devices, performanceData } = response.data.data;
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
  }, [selectedYear, useSampleData, accessToken, user]);

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
            className={`data-toggle-btn ${useSampleData ? 'active' : ''}`}
            onClick={() => setUseSampleData(!useSampleData)}
            title={useSampleData ? 'Đang dùng dữ liệu mẫu' : 'Đang dùng dữ liệu thật'}
          >
            {useSampleData ? '📊 Dữ liệu mẫu' : '🌐 Dữ liệu thật'}
          </button>
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
