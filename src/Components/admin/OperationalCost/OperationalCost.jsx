import React, { useState, useContext } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import axios from "axios";
import API_BASE_URL from "../../../config/api";
import { AuthContext } from "../../../Context/AuthContext";
import "./OperationalCost.css";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function OperationalCost() {
  const { accessToken, user } = useContext(AuthContext);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [useSampleData, setUseSampleData] = useState(true);
  const [chartData, setChartData] = useState({
    labels: [],
    datasets: [],
  });

  // Months for X-axis
  const monthLabels = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  // Generate years for dropdown (current year and past 5 years)
  const years = Array.from({ length: 6 }, (_, i) => new Date().getFullYear() - i);

  // Hàm tạo dữ liệu mẫu cho operational cost forecast
  const generateSampleCost = () => {
    const costData = [];
    
    // Pattern giống mockup:
    // Jan: 55, Feb: 35, Mar: 90, Apr: 70, May: 55
    // Jun: 85, Jul: 90, Aug: 80, Sep: 35, Oct: 30
    // Nov: 75, Dec: 20
    const basePattern = [55, 35, 90, 70, 55, 85, 90, 80, 35, 30, 75, 20];
    
    for (let month = 0; month < 12; month++) {
      // Thêm một chút random để không giống hệt nhau
      const variation = Math.random() * 10 - 5; // -5 đến +5
      costData.push(Math.max(0, basePattern[month] + variation));
    }
    
    return costData;
  };

  const fetchCostData = async () => {
    setLoading(true);
    setError(null);

    try {
      // ===== DÙNG DỮ LIỆU MẪU ĐỂ KIỂM TRA =====
      if (useSampleData) {
        console.log('Đang dùng dữ liệu mẫu để kiểm tra đồ thị operational cost...');
        const costData = generateSampleCost();
        console.log(`Đã tạo dữ liệu chi phí cho 12 tháng`);
        processCostData(costData);
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
        `${API_BASE_URL}/report/operational-cost`,
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
        processCostData(response.data.data.monthlyCost);
      } else {
        setError("No operational cost data available for this year");
        setChartData({
          labels: monthLabels,
          datasets: [{
            label: "Operational cost",
            data: Array(12).fill(0),
            borderColor: "rgb(139, 92, 246)",
            backgroundColor: "rgba(139, 92, 246, 0.1)",
            tension: 0.4,
            fill: false,
          }],
        });
      }
    } catch (err) {
      console.error("Error fetching operational cost data:", err);
      const errorMsg = err.response?.data?.message || err.message || "Failed to fetch data from server";
      setError(errorMsg);
      
      setChartData({
        labels: monthLabels,
        datasets: [{
          label: "Operational cost",
          data: Array(12).fill(0),
          borderColor: "rgb(139, 92, 246)",
          backgroundColor: "rgba(139, 92, 246, 0.1)",
          tension: 0.4,
          fill: false,
        }],
      });
    } finally {
      setLoading(false);
    }
  };

  const processCostData = (costData) => {
    setChartData({
      labels: monthLabels,
      datasets: [
        {
          label: "Operational cost",
          data: costData,
          borderColor: "rgb(139, 92, 246)",
          backgroundColor: "rgba(139, 92, 246, 0.1)",
          tension: 0.4,
          fill: false,
          pointRadius: 4,
          pointHoverRadius: 6,
          pointBackgroundColor: "rgb(139, 92, 246)",
          pointBorderColor: "#fff",
          pointBorderWidth: 2,
          borderWidth: 2,
        },
      ],
    });
  };

  // Initial fetch and refetch on dependency changes
  React.useEffect(() => {
    fetchCostData();
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
        borderColor: "rgba(139, 92, 246, 0.5)",
        borderWidth: 1,
        callbacks: {
          title: function (context) {
            return context[0].label;
          },
          label: function (context) {
            return `Cost: ${context.parsed.y}`;
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        grid: {
          color: "rgba(0, 0, 0, 0.05)",
          drawBorder: false,
        },
        ticks: {
          stepSize: 20,
          callback: function (value) {
            return value;
          },
        },
        title: {
          display: false,
        },
      },
      x: {
        grid: {
          display: false,
        },
        ticks: {
          font: {
            size: 11,
          },
        },
        title: {
          display: false,
        },
      },
    },
    interaction: {
      mode: "nearest",
      axis: "x",
      intersect: false,
    },
  };

  return (
    <div className="operational-cost">
      <div className="content-header">
        <h2>OPERATIONAL COST FORECAST</h2>
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
            <button onClick={fetchCostData}>Retry</button>
          </div>
        ) : (
          <Line data={chartData} options={chartOptions} />
        )}
      </div>
    </div>
  );
}
