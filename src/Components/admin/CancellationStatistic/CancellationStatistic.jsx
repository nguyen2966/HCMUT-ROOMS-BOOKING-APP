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
import "./CancellationStatistic.css";

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

export default function CancellationStatistic() {
  const { accessToken, user } = useContext(AuthContext);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [useSampleData, setUseSampleData] = useState(true); // Toggle giữa data mẫu và data thật
  const [chartData, setChartData] = useState({
    labels: [],
    datasets: [],
  });

  // Months for X-axis (1-12)
  const monthLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  // Generate years for dropdown (current year and past 5 years)
  const years = Array.from({ length: 6 }, (_, i) => new Date().getFullYear() - i);

  // Hàm tạo dữ liệu mẫu cho cancellations theo tháng
  const generateSampleCancellations = () => {
    const cancellations = [];
    
    // Tạo cancellations cho từng tháng trong năm
    for (let month = 0; month < 12; month++) {
      // Số lượng cancellations mỗi tháng (5-25 lượt, ít hơn bookings)
      const cancellationsPerMonth = Math.floor(Math.random() * 20) + 5;
      
      for (let i = 0; i < cancellationsPerMonth; i++) {
        // Ngày ngẫu nhiên trong tháng
        const day = Math.floor(Math.random() * 28) + 1;
        const hour = Math.floor(Math.random() * 24);
        
        const cancellationDate = new Date(selectedYear, month, day, hour, 0, 0);
        
        cancellations.push({
          id: `sample-${month}-${day}-${i}`,
          start_time: cancellationDate.toISOString(),
          end_time: new Date(cancellationDate.getTime() + 2 * 60 * 60 * 1000).toISOString(),
          status: 'CANCELLED',
        });
      }
    }
    
    return cancellations;
  };

  const fetchCancellationData = async () => {
    setLoading(true);
    setError(null);

    try {
      // ===== DÙNG DỮ LIỆU MẪU ĐỂ KIỂM TRA =====
      if (useSampleData) {
        console.log('Đang dùng dữ liệu mẫu để kiểm tra đồ thị cancellation...');
        const sampleCancellations = generateSampleCancellations();
        console.log(`Đã tạo ${sampleCancellations.length} cancellations mẫu`);
        processCancellationsData(sampleCancellations, selectedYear);
        setLoading(false);
        return;
      }
      // ========================================

      // Code thực để kết nối API (sẽ dùng khi backend đã chạy)
      if (!accessToken || !user) {
        setError("User not authenticated. Please login.");
        setLoading(false);
        return;
      }

      // Fetch cancelled bookings data from backend
      const periodStart = new Date(selectedYear, 0, 1).toISOString();
      const periodEnd = new Date(selectedYear, 11, 31, 23, 59, 59).toISOString();

      // Try to get cancelled bookings data
      const response = await axios.get(
        `${API_BASE_URL}/booking`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          params: {
            startDate: periodStart,
            endDate: periodEnd,
            status: 'CANCELLED', // Filter for cancelled bookings
          }
        }
      );

      if (response.data && response.data.data) {
        // Process cancellations to calculate monthly count
        processCancellationsData(response.data.data, selectedYear);
      } else {
        setError("No cancellation data available for this year");
        setChartData({
          labels: monthLabels,
          datasets: [{
            label: "Number of cancellation",
            data: Array(12).fill(0),
            borderColor: "rgb(34, 117, 207)",
            backgroundColor: "rgba(34, 117, 207, 0.5)",
            tension: 0.3,
            fill: true,
          }],
        });
      }
    } catch (err) {
      console.error("Error fetching cancellation data:", err);
      const errorMsg = err.response?.data?.message || err.message || "Failed to fetch data from server";
      setError(errorMsg);
      
      // Show empty chart on error
      setChartData({
        labels: monthLabels,
        datasets: [{
          label: "Number of cancellation",
          data: Array(12).fill(0),
          borderColor: "rgb(34, 117, 207)",
          backgroundColor: "rgba(34, 117, 207, 0.5)",
          tension: 0.3,
          fill: true,
        }],
      });
    } finally {
      setLoading(false);
    }
  };

  const processCancellationsData = (cancellations, year) => {
    // Initialize array with 0 for all 12 months
    const monthlyCancellations = Array(12).fill(0);

    // Process each cancellation - count number of cancellations per month
    cancellations.forEach((cancellation) => {
      try {
        const startTime = new Date(cancellation.start_time);
        
        // Check if cancellation is in the selected year
        if (startTime.getFullYear() !== year) {
          return;
        }

        // Get the month (0-11)
        const month = startTime.getMonth();
        monthlyCancellations[month] += 1;
      } catch (err) {
        console.warn("Error processing cancellation:", cancellation, err);
      }
    });

    setChartData({
      labels: monthLabels,
      datasets: [
        {
          label: "Number of cancellation",
          data: monthlyCancellations,
          borderColor: "rgb(34, 117, 207)",
          backgroundColor: "rgba(34, 117, 207, 0.5)",
          tension: 0.3,
          fill: true,
          pointRadius: 5,
          pointHoverRadius: 7,
          pointBackgroundColor: "rgb(34, 117, 207)",
          pointBorderColor: "#fff",
          pointBorderWidth: 2,
        },
      ],
    });
  };

  // Initial fetch and refetch on dependency changes
  React.useEffect(() => {
    fetchCancellationData();
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
        borderColor: "rgba(34, 117, 207, 0.5)",
        borderWidth: 1,
        callbacks: {
          title: function (context) {
            return `Month: ${context[0].label}`;
          },
          label: function (context) {
            return `Number of cancellation: ${context.parsed.y}`;
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 30,
        grid: {
          color: "rgba(0, 0, 0, 0.05)",
          drawBorder: false,
        },
        ticks: {
          stepSize: 5,
          callback: function (value) {
            return value;
          },
        },
        title: {
          display: true,
          text: 'Number of cancellation',
          font: {
            size: 12,
            weight: 'bold',
          },
          color: '#666',
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
          display: true,
          text: 'Month',
          font: {
            size: 12,
            weight: 'bold',
          },
          color: '#666',
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
    <div className="cancellation-statistic">
      <div className="content-header">
        <h2>CANCELLATION STATISTIC</h2>
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
            <button onClick={fetchCancellationData}>Retry</button>
          </div>
        ) : (
          <Line data={chartData} options={chartOptions} />
        )}
      </div>
    </div>
  );
}
