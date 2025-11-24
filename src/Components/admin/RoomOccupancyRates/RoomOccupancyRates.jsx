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
import "./RoomOccupancyRates.css";

// Distribution ratios for room types
const ROOM_TYPE_RATIOS = {
  'Laboratory': 0.50,    // Labs are most used - 50%
  'Classroom': 0.35,     // Classrooms - 35%
  'Library': 0.15        // Libraries least used - 15%
};

// Building usage variation factors (some buildings busier than others)
const BUILDING_FACTORS = {
  'BK.B1': 1.2,  // 20% above average
  'BK.B2': 0.9,  // 10% below average
  'BK.B3': 1.1,  // 10% above average
  'BK.B6': 0.8   // 20% below average
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

export default function RoomOccupancyRates() {
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

  // Distribute overall occupancy rate by building and room type
  const distributeOccupancyByBuildingAndType = (overallRate) => {
    const buildings = ['BK.B1', 'BK.B2', 'BK.B3', 'BK.B6'];
    const roomTypes = [
      { name: 'Laboratory', color: 'rgb(251, 146, 60)', bgColor: 'rgba(251, 146, 60, 0.8)' },
      { name: 'Classroom', color: 'rgb(52, 211, 153)', bgColor: 'rgba(52, 211, 153, 0.8)' },
      { name: 'Library', color: 'rgb(168, 85, 247)', bgColor: 'rgba(168, 85, 247, 0.8)' }
    ];

    const occupancyData = buildings.map(building => {
      const buildingFactor = BUILDING_FACTORS[building];
      const buildingOccupancy = {};
      
      roomTypes.forEach(type => {
        // Calculate occupancy for this room type in this building
        // Overall rate * room type ratio * building factor
        buildingOccupancy[type.name] = Math.round(
          overallRate * ROOM_TYPE_RATIOS[type.name] * buildingFactor
        );
      });
      
      return {
        building,
        ...buildingOccupancy
      };
    });

    return { buildings, roomTypes, occupancyData };
  };

  const fetchOccupancyData = async () => {
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

      console.log('Fetching occupancy data for year:', selectedYear);
      const response = await reportAPI.createUsageReport(
        user.ID,
        periodStart,
        periodEnd,
        accessToken
      );
      
      console.log('Usage report response:', response);
      
      if (response && response.room_usage_rate !== undefined) {
        setReportId(response.ID);
        
        // Get overall room usage rate from report
        const overallRate = response.room_usage_rate;
        
        console.log('Overall room usage rate:', overallRate);
        
        // Distribute rate by building and room type
        const { buildings, roomTypes, occupancyData } = distributeOccupancyByBuildingAndType(overallRate);
        processOccupancyData(buildings, roomTypes, occupancyData);
      } else {
        setError("No occupancy data available for this year");
        setChartData({
          labels: [],
          datasets: [],
        });
      }
    } catch (err) {
      console.error("Error fetching occupancy data:", err);
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

  const processOccupancyData = (buildings, roomTypes, occupancyData) => {
    const datasets = roomTypes.map(type => ({
      label: type.name,
      data: occupancyData.map(item => item[type.name] || 0),
      backgroundColor: type.bgColor,
      borderColor: type.color,
      borderWidth: 1,
    }));

    setChartData({
      labels: buildings,
      datasets: datasets,
    });
  };

  // Initial fetch and refetch on dependency changes
  React.useEffect(() => {
    fetchOccupancyData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedYear, accessToken, user]);

  const chartOptions = {
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
          usePointStyle: false,
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
        borderColor: "rgba(34, 117, 207, 0.5)",
        borderWidth: 1,
        callbacks: {
          label: function (context) {
            return `${context.dataset.label}: ${context.parsed.y}%`;
          },
        },
      },
    },
    scales: {
      x: {
        stacked: true,
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
        stacked: true,
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
    <div className="room-occupancy-rates">
      <div className="content-header">
        <h2>OCCUPANCY RATE OF ROOM IN BUILDING</h2>
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
            <button onClick={fetchOccupancyData}>Retry</button>
          </div>
        ) : (
          <Bar data={chartData} options={chartOptions} />
        )}
      </div>
    </div>
  );
}
