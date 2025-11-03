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
import "./ElectricConsumption.css";

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

export default function ElectricConsumption() {
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

  // Hàm tạo dữ liệu mẫu cho electric consumption
  const generateSampleConsumption = () => {
    const consumptionData = [];
    
    // Tạo dữ liệu cho 12 tháng với pattern giống mockup
    // Tháng 1-5: tăng dần từ 30-200
    // Tháng 6-8: giảm xuống 80-100
    // Tháng 9-12: tăng lại lên 150-170
    for (let month = 0; month < 12; month++) {
      let consumption;
      if (month < 5) {
        // Tháng 1-5: tăng dần
        consumption = 30 + (month * 35) + Math.random() * 20;
      } else if (month >= 5 && month < 8) {
        // Tháng 6-8: giảm
        consumption = 100 - ((month - 5) * 10) + Math.random() * 15;
      } else {
        // Tháng 9-12: tăng lại
        consumption = 80 + ((month - 8) * 20) + Math.random() * 20;
      }
      
      consumptionData.push(Math.round(consumption));
    }
    
    return consumptionData;
  };

  const fetchConsumptionData = async () => {
    setLoading(true);
    setError(null);

    try {
      // ===== DÙNG DỮ LIỆU MẪU ĐỂ KIỂM TRA =====
      if (useSampleData) {
        console.log('Đang dùng dữ liệu mẫu để kiểm tra đồ thị electric consumption...');
        const consumptionData = generateSampleConsumption();
        console.log(`Đã tạo dữ liệu điện năng cho 12 tháng`);
        processConsumptionData(consumptionData);
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
        `${API_BASE_URL}/report/electric-consumption`,
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
        processConsumptionData(response.data.data.monthlyConsumption);
      } else {
        setError("No electric consumption data available for this year");
        setChartData({
          labels: monthLabels,
          datasets: [{
            label: "Electric consumption (kWh)",
            data: Array(12).fill(0),
            borderColor: "rgb(59, 130, 246)",
            backgroundColor: "rgba(59, 130, 246, 0.1)",
            tension: 0.4,
            fill: false,
          }],
        });
      }
    } catch (err) {
      console.error("Error fetching consumption data:", err);
      const errorMsg = err.response?.data?.message || err.message || "Failed to fetch data from server";
      setError(errorMsg);
      
      setChartData({
        labels: monthLabels,
        datasets: [{
          label: "Electric consumption (kWh)",
          data: Array(12).fill(0),
          borderColor: "rgb(59, 130, 246)",
          backgroundColor: "rgba(59, 130, 246, 0.1)",
          tension: 0.4,
          fill: false,
        }],
      });
    } finally {
      setLoading(false);
    }
  };

  const processConsumptionData = (consumptionData) => {
    setChartData({
      labels: monthLabels,
      datasets: [
        {
          label: "Electric consumption (kWh)",
          data: consumptionData,
          borderColor: "rgb(59, 130, 246)",
          backgroundColor: "rgba(59, 130, 246, 0.1)",
          tension: 0.4,
          fill: false,
          pointRadius: 0,
          pointHoverRadius: 5,
          pointBackgroundColor: "rgb(59, 130, 246)",
          pointBorderColor: "#fff",
          pointBorderWidth: 2,
          borderWidth: 2,
        },
      ],
    });
  };

  // Initial fetch and refetch on dependency changes
  React.useEffect(() => {
    fetchConsumptionData();
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
        borderColor: "rgba(59, 130, 246, 0.5)",
        borderWidth: 1,
        callbacks: {
          title: function (context) {
            return context[0].label;
          },
          label: function (context) {
            return `Electric consumption: ${context.parsed.y} kWh`;
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 300,
        grid: {
          color: "rgba(0, 0, 0, 0.05)",
          drawBorder: false,
        },
        ticks: {
          stepSize: 100,
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
    <div className="electric-consumption">
      <div className="content-header">
        <h2>ELECTRIC CONSUMPTION BY MONTH</h2>
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
            <button onClick={fetchConsumptionData}>Retry</button>
          </div>
        ) : (
          <Line data={chartData} options={chartOptions} />
        )}
      </div>
    </div>
  );
}
