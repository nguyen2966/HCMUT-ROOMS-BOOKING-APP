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
  const [reportId, setReportId] = useState(null);
  const [useSampleData, setUseSampleData] = useState(true);
  const [chartData, setChartData] = useState({
    labels: [],
    datasets: [],
  });

  // Months for X-axis
  const monthLabels = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  // Generate years for dropdown (current year and past 5 years)
  const years = Array.from({ length: 6 }, (_, i) => new Date().getFullYear() - i);

  // Sample data for demo/testing
  const generateSampleData = () => {
    return [65, 42, 78, 62, 52, 75, 82, 78, 45, 38, 70, 28];
  };

  // Distribute yearly cost forecast by month based on energy usage patterns
  const distributeCostByMonth = (yearlyForecast) => {
    // Pattern: high in winter/summer (AC usage), low in spring/fall
    // Similar to energy consumption pattern but with cost perspective
    const monthlyRatios = [1.1, 0.7, 1.4, 1.1, 0.9, 1.3, 1.4, 1.3, 0.7, 0.6, 1.2, 0.4];
    const totalRatio = monthlyRatios.reduce((sum, r) => sum + r, 0);
    
    return monthlyRatios.map(ratio => 
      Math.round((yearlyForecast * ratio / totalRatio) * 10) / 10
    );
  };

  const fetchCostData = async () => {
    setLoading(true);
    setError(null);

    try {
      // Use sample data if toggled
      if (useSampleData) {
        const sampleData = generateSampleData();
        processCostData(sampleData);
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

      console.log('Fetching operational cost data for year:', selectedYear);
      const report = await reportAPI.createEnergyReport(
        user.ID,
        periodStart,
        periodEnd,
        accessToken
      );

      console.log('Energy report response:', report);
      
      if (report) {
        setReportId(report.ID);
        
        // Backend returns cost_forecast as yearly total
        const yearlyForecast = report.cost_forecast || 0;
        
        console.log('Yearly cost forecast:', yearlyForecast);
        
        // Distribute by month
        const monthlyCosts = distributeCostByMonth(yearlyForecast);
        processCostData(monthlyCosts);
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
            <button onClick={fetchCostData}>Retry</button>
          </div>
        ) : (
          <Line data={chartData} options={chartOptions} />
        )}
      </div>
    </div>
  );
}
