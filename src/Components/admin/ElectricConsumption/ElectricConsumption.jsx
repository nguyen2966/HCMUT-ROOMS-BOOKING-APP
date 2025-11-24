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
  const [reportId, setReportId] = useState(null);
  const [chartData, setChartData] = useState({
    labels: [],
    datasets: [],
  });

  // Months for X-axis
  const monthLabels = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  // Generate years for dropdown (current year and past 5 years)
  const years = Array.from({ length: 6 }, (_, i) => new Date().getFullYear() - i);

  const fetchConsumptionData = async () => {
    setLoading(true);
    setError(null);

    try {
      if (!accessToken || !user) {
        setError("Vui lòng đăng nhập để xem báo cáo.");
        setLoading(false);
        return;
      }

      const periodStart = new Date(selectedYear, 0, 1);
      const periodEnd = new Date(selectedYear, 11, 31, 23, 59, 59);

      console.log(`Tạo báo cáo năng lượng cho năm ${selectedYear}...`);
      
      // Tạo báo cáo năng lượng cho năm được chọn
      const report = await reportAPI.createEnergyReport(
        user.ID,
        periodStart,
        periodEnd,
        accessToken
      );

      console.log('Báo cáo năng lượng đã tạo:', report);
      setReportId(report.ID);

      // Chuyển đổi dữ liệu báo cáo thành dữ liệu chart theo tháng
      // Backend trả về tổng consumption cho cả năm, cần tạo distribution theo tháng
      const monthlyData = distributeEnergyByMonth(report.total_energy_consumption);
      processConsumptionData(monthlyData);
      
    } catch (err) {
      console.error("Lỗi khi tạo báo cáo năng lượng:", err);
      const errorMsg = err.response?.data?.message || err.message || "Không thể tạo báo cáo";
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

  // Hàm phân bổ tổng năng lượng theo 12 tháng (tạm thời dùng pattern giống thực tế)
  const distributeEnergyByMonth = (totalEnergy) => {
    // Pattern phân bổ: mùa đông/hè cao hơn, mùa xuân/thu thấp hơn
    const pattern = [1.2, 1.1, 0.9, 0.8, 0.7, 1.0, 1.3, 1.2, 0.9, 0.8, 1.0, 1.1];
    const sum = pattern.reduce((a, b) => a + b, 0);
    return pattern.map(p => Math.round((totalEnergy * p / sum) * 10) / 10);
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
  }, [selectedYear, accessToken, user]);

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
          {reportId && (
            <span className="report-info" title={`Report ID: ${reportId}`}>
              📄 Báo cáo #{reportId}
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
            <button onClick={fetchConsumptionData}>Retry</button>
          </div>
        ) : (
          <Line data={chartData} options={chartOptions} />
        )}
      </div>
    </div>
  );
}
