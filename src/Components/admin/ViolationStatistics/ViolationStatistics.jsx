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
import "./ViolationStatistics.css";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export default function ViolationStatistics() {
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

  // Hàm tạo dữ liệu mẫu cho violations
  const generateSampleViolations = () => {
    const userGroups = ['Student', 'Teacher/TA', 'Technical staff', 'Staff'];
    
    const violationData = userGroups.map(group => {
      let baseViolation;
      // Student có nhiều vi phạm nhất, sau đó là Technical staff, Staff, Teacher/TA ít nhất
      if (group === 'Student') {
        baseViolation = Math.floor(Math.random() * 10) + 15; // 15-25
      } else if (group === 'Teacher/TA') {
        baseViolation = Math.floor(Math.random() * 10) + 20; // 20-30
      } else if (group === 'Technical staff') {
        baseViolation = Math.floor(Math.random() * 10) + 25; // 25-35
      } else {
        baseViolation = Math.floor(Math.random() * 10) + 30; // 30-40
      }
      
      return {
        group,
        violations: baseViolation,
      };
    });

    return { userGroups, violationData };
  };

  const fetchViolationData = async () => {
    setLoading(true);
    setError(null);

    try {
      // ===== DÙNG DỮ LIỆU MẪU ĐỂ KIỂM TRA =====
      if (useSampleData) {
        console.log('Đang dùng dữ liệu mẫu để kiểm tra đồ thị violation...');
        const { userGroups, violationData } = generateSampleViolations();
        processViolationData(userGroups, violationData);
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
        `${API_BASE_URL}/report/violations`,
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
        const { userGroups, violationData } = response.data.data;
        processViolationData(userGroups, violationData);
      } else {
        setError("No violation data available for this year");
        setChartData({
          labels: [],
          datasets: [],
        });
      }
    } catch (err) {
      console.error("Error fetching violation data:", err);
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

  const processViolationData = (userGroups, violationData) => {
    const dataset = {
      label: 'Number of violations',
      data: violationData.map(item => item.violations || 0),
      backgroundColor: 'rgba(124, 58, 237, 0.8)',
      borderColor: 'rgb(124, 58, 237)',
      borderWidth: 1,
      barThickness: 80,
      maxBarThickness: 100,
    };

    setChartData({
      labels: userGroups,
      datasets: [dataset],
    });
  };

  // Initial fetch and refetch on dependency changes
  React.useEffect(() => {
    fetchViolationData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedYear, useSampleData, accessToken, user]);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
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
            return `Violations: ${context.parsed.y}`;
          },
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          font: {
            size: 11,
          },
        },
      },
      y: {
        beginAtZero: true,
        max: 40,
        grid: {
          color: "rgba(0, 0, 0, 0.05)",
          drawBorder: false,
        },
        ticks: {
          stepSize: 10,
          callback: function (value) {
            return value;
          },
        },
        title: {
          display: false,
        },
      },
    },
    interaction: {
      mode: "index",
      intersect: false,
    },
  };

  return (
    <div className="violation-statistics">
      <div className="content-header">
        <h2>VIOLATION STATISTIC</h2>
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
            <button onClick={fetchViolationData}>Retry</button>
          </div>
        ) : (
          <Bar data={chartData} options={chartOptions} />
        )}
      </div>
    </div>
  );
}
