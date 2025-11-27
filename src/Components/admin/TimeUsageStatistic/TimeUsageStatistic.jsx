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
import reportAPI from "../../../services/reportService";
import { AuthContext } from "../../../Context/AuthContext";
import "./TimeUsageStatistic.css";

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

export default function TimeUsageStatistic() {
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

  // Months for X-axis (1-12)
  const monthLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  // Generate years for dropdown (current year and past 5 years)
  const years = Array.from({ length: 6 }, (_, i) => new Date().getFullYear() - i);

  // Sample data for demo/testing
  const generateSampleData = () => {
    return [180, 195, 210, 200, 185, 75, 60, 90, 185, 200, 180, 150];
  };

  const fetchUsageData = async () => {
    setLoading(true);
    setError(null);

    try {
      // Use sample data if toggled
      if (useSampleData) {
        const sampleData = generateSampleData();
        processUsageData(sampleData);
        setReportId(null);
        setLoading(false);
        return;
      }

      if (!accessToken || !user) {
        setError("Vui lòng đăng nhập để xem báo cáo.");
        setLoading(false);
        return;
      }

      const periodStart = new Date(selectedYear, 0, 1);
      const periodEnd = new Date(selectedYear, 11, 31, 23, 59, 59);

      console.log(`Tạo báo cáo sử dụng cho năm ${selectedYear}...`);
      
      // Tạo báo cáo sử dụng cho năm được chọn
      const report = await reportAPI.createUsageReport(
        user.ID,
        periodStart,
        periodEnd,
        accessToken
      );

      console.log('Báo cáo sử dụng đã tạo:', report);
      setReportId(report.ID);

      // Use real monthly data from backend
      let monthlyData = report.monthly_booking_counts || Array(12).fill(0);
      
      // Ensure it's an array of numbers
      if (Array.isArray(monthlyData)) {
        monthlyData = monthlyData.map(count => Number(count) || 0);
      } else {
        monthlyData = Array(12).fill(0);
      }
      
      console.log('📊 Monthly data from backend:', monthlyData);
      console.log('📊 Type of monthly data:', typeof monthlyData, Array.isArray(monthlyData));
      console.log('📊 First value type:', typeof monthlyData[0], monthlyData[0]);
      processUsageData(monthlyData);
      
    } catch (err) {
      console.error("Lỗi khi tạo báo cáo sử dụng:", err);
      const errorMsg = err.response?.data?.message || err.message || "Không thể tạo báo cáo";
      setError(errorMsg);
      
      setChartData({
        labels: monthLabels,
        datasets: [{
          label: "Usage Count",
          data: Array(12).fill(0),
          borderColor: "rgb(75, 132, 192)",
          backgroundColor: "rgba(75, 132, 192, 0.5)",
          tension: 0.3,
          fill: true,
        }],
      });
    } finally {
      setLoading(false);
    }
  };

  const processUsageData = (monthlyData) => {
    setChartData({
      labels: monthLabels,
      datasets: [
        {
          label: "Usage Count",
          data: monthlyData,
          borderColor: "rgb(75, 132, 192)",
          backgroundColor: "rgba(75, 132, 192, 0.5)",
          tension: 0.3,
          fill: true,
          pointRadius: 5,
          pointHoverRadius: 7,
          pointBackgroundColor: "rgb(75, 132, 192)",
          pointBorderColor: "#fff",
          pointBorderWidth: 2,
        },
      ],
    });
  };

  // Initial fetch and refetch on dependency changes
  React.useEffect(() => {
    fetchUsageData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedYear, accessToken, user, useSampleData]);

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
        borderColor: "rgba(75, 132, 192, 0.5)",
        borderWidth: 1,
        callbacks: {
          title: function (context) {
            return `Month: ${context[0].label}`;
          },
          label: function (context) {
            return `Usage count: ${context.parsed.y}`;
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
          stepSize: 50,
          callback: function (value) {
            return value;
          },
        },
        title: {
          display: true,
          text: 'Usage count',
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
    <div className="time-usage-statistic">
      <div className="content-header">
        <h2>USAGE STATISTIC</h2>
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
            <button onClick={fetchUsageData}>Retry</button>
          </div>
        ) : (
          <Line data={chartData} options={chartOptions} />
        )}
      </div>
    </div>
  );
}
