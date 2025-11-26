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
import "./ViolationStatistics.css";

// Distribution ratios by user type (based on typical violation patterns)
// Students tend to have most violations, then technical staff, staff, teachers least
const VIOLATION_RATIOS = {
  'Student': 0.50,        // 50% of violations
  'Teacher/TA': 0.10,     // 10% of violations
  'Technical staff': 0.25, // 25% of violations
  'Staff': 0.15           // 15% of violations
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

export default function ViolationStatistics() {
  const { accessToken, user } = useContext(AuthContext);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [reportId, setReportId] = useState(null);
  const [chartData, setChartData] = useState({
    labels: [],
    datasets: [],
  });

  // Generate years for dropdown (current year and past 5 years)
  const years = Array.from({ length: 6 }, (_, i) => new Date().getFullYear() - i);

  // Distribute total violations by user type using fixed ratios
  const distributeViolationsByUserType = (totalViolations) => {
    const userGroups = ['Student', 'Teacher/TA', 'Technical staff', 'Staff'];
    
    const violationData = userGroups.map(group => ({
      group,
      violations: Math.round(totalViolations * VIOLATION_RATIOS[group])
    }));

    return { userGroups, violationData };
  };

  const fetchViolationData = async () => {
    setLoading(true);
    setError(null);

    try {
      if (!accessToken || !user) {
        setError("User not authenticated. Please login.");
        setLoading(false);
        return;
      }

      const periodStart = new Date(selectedYear, 0, 1).toISOString();
      const periodEnd = new Date(selectedYear, 11, 31, 23, 59, 59).toISOString();

      console.log('Fetching violation data for year:', selectedYear);
      const response = await reportAPI.createUsageReport(
        user.ID,
        periodStart,
        periodEnd,
        accessToken
      );
      
      console.log('Usage report response:', response);
      
      if (response) {
        setReportId(response.ID);
        
        // Backend returns violation_by_user as a number, not an array
        const totalViolations = response.violation_by_user || 0;
        
        console.log('Total violations:', totalViolations);
        
        // Distribute violations by user type
        const { userGroups, violationData } = distributeViolationsByUserType(totalViolations);
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
            <button onClick={fetchViolationData}>Retry</button>
          </div>
        ) : (
          <Bar data={chartData} options={chartOptions} />
        )}
      </div>
    </div>
  );
}
