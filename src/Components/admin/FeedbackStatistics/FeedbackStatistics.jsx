import React, { useState, useContext, useEffect } from "react";
import { Bar, Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import axios from "axios";
import { AuthContext } from "../../../Context/AuthContext";
import "./FeedbackStatistics.css";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

export default function FeedbackStatistics() {
  const { accessToken } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [useSampleData, setUseSampleData] = useState(true);
  
  const [stats, setStats] = useState({
    totalFeedbacks: 0,
    averageRating: 0,
    ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
    recentFeedbacks: []
  });

  const [ratingChartData, setRatingChartData] = useState({
    labels: [],
    datasets: [],
  });

  const [pieChartData, setPieChartData] = useState({
    labels: [],
    datasets: [],
  });

  // Sample data for demo
  const generateSampleData = () => {
    return {
      totalFeedbacks: 147,
      averageRating: 4.2,
      ratingDistribution: { 
        1: 5,   // 5 feedback 1 sao
        2: 12,  // 12 feedback 2 sao
        3: 28,  // 28 feedback 3 sao
        4: 62,  // 62 feedback 4 sao
        5: 40   // 40 feedback 5 sao
      },
      recentFeedbacks: [
        {
          id: 1,
          rating: 5,
          comment: "Phòng rất sạch sẽ và thoáng mát, thiết bị đầy đủ!",
          created_at: new Date(Date.now() - 2 * 60 * 60 * 1000),
          booking: {
            room: { name: "Phòng H1-101" },
            booking_user: { full_name: "Nguyễn Văn A" }
          }
        },
        {
          id: 2,
          rating: 4,
          comment: "Phòng đẹp nhưng máy lạnh hơi yếu",
          created_at: new Date(Date.now() - 5 * 60 * 60 * 1000),
          booking: {
            room: { name: "Phòng H2-205" },
            booking_user: { full_name: "Trần Thị B" }
          }
        },
        {
          id: 3,
          rating: 5,
          comment: "Hoàn hảo! Sẽ đặt lại lần sau",
          created_at: new Date(Date.now() - 8 * 60 * 60 * 1000),
          booking: {
            room: { name: "Phòng H3-301" },
            booking_user: { full_name: "Lê Văn C" }
          }
        },
        {
          id: 4,
          rating: 3,
          comment: "Bình thường, không có gì đặc biệt",
          created_at: new Date(Date.now() - 12 * 60 * 60 * 1000),
          booking: {
            room: { name: "Phòng H1-102" },
            booking_user: { full_name: "Phạm Thị D" }
          }
        },
        {
          id: 5,
          rating: 4,
          comment: "Tốt, chỉ cần cải thiện ánh sáng thôi",
          created_at: new Date(Date.now() - 24 * 60 * 60 * 1000),
          booking: {
            room: { name: "Phòng H2-201" },
            booking_user: { full_name: "Hoàng Văn E" }
          }
        }
      ]
    };
  };

  const fetchFeedbackData = async () => {
    setLoading(true);
    setError(null);

    try {
      if (useSampleData) {
        const sampleStats = generateSampleData();
        setStats(sampleStats);
        processChartData(sampleStats);
        setLoading(false);
        return;
      }

      // Fetch real data from API
      const bookingsRes = await axios.get('http://localhost:3069/booking', {
        headers: { Authorization: `Bearer ${accessToken}` }
      });

      const allBookings = bookingsRes.data.metaData.bookingList;
      
      // Extract all feedbacks
      const allFeedbacks = [];
      allBookings.forEach(booking => {
        if (booking.feedback && booking.feedback.length > 0) {
          booking.feedback.forEach(fb => {
            allFeedbacks.push({
              ...fb,
              booking: {
                room: booking.room,
                booking_user: booking.user
              }
            });
          });
        }
      });

      // Calculate statistics
      const totalFeedbacks = allFeedbacks.length;
      const averageRating = totalFeedbacks > 0 
        ? allFeedbacks.reduce((sum, fb) => sum + fb.rating, 0) / totalFeedbacks 
        : 0;

      const ratingDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
      allFeedbacks.forEach(fb => {
        if (fb.rating >= 1 && fb.rating <= 5) {
          ratingDistribution[fb.rating]++;
        }
      });

      // Sort by created_at and get recent 5
      const recentFeedbacks = allFeedbacks
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .slice(0, 5);

      const realStats = {
        totalFeedbacks,
        averageRating: Math.round(averageRating * 10) / 10,
        ratingDistribution,
        recentFeedbacks
      };

      setStats(realStats);
      processChartData(realStats);

    } catch (err) {
      console.error("Error fetching feedback data:", err);
      setError("Không thể tải dữ liệu feedback");
      
      // Fallback to sample data on error
      const sampleStats = generateSampleData();
      setStats(sampleStats);
      processChartData(sampleStats);
    } finally {
      setLoading(false);
    }
  };

  const processChartData = (statsData) => {
    // Bar chart for rating distribution
    setRatingChartData({
      labels: ['⭐ 1 sao', '⭐ 2 sao', '⭐ 3 sao', '⭐ 4 sao', '⭐ 5 sao'],
      datasets: [
        {
          label: 'Số lượng đánh giá',
          data: [
            statsData.ratingDistribution[1],
            statsData.ratingDistribution[2],
            statsData.ratingDistribution[3],
            statsData.ratingDistribution[4],
            statsData.ratingDistribution[5]
          ],
          backgroundColor: [
            'rgba(244, 67, 54, 0.8)',   // Red - 1 star
            'rgba(255, 152, 0, 0.8)',    // Orange - 2 stars
            'rgba(255, 193, 7, 0.8)',    // Yellow - 3 stars
            'rgba(156, 204, 101, 0.8)',  // Light Green - 4 stars
            'rgba(76, 175, 80, 0.8)'     // Green - 5 stars
          ],
          borderColor: [
            'rgb(244, 67, 54)',
            'rgb(255, 152, 0)',
            'rgb(255, 193, 7)',
            'rgb(156, 204, 101)',
            'rgb(76, 175, 80)'
          ],
          borderWidth: 2,
        },
      ],
    });

    // Doughnut chart for satisfaction percentage
    const positive = statsData.ratingDistribution[4] + statsData.ratingDistribution[5];
    const neutral = statsData.ratingDistribution[3];
    const negative = statsData.ratingDistribution[1] + statsData.ratingDistribution[2];

    setPieChartData({
      labels: ['Tích cực (4-5⭐)', 'Trung lập (3⭐)', 'Tiêu cực (1-2⭐)'],
      datasets: [
        {
          data: [positive, neutral, negative],
          backgroundColor: [
            'rgba(76, 175, 80, 0.8)',
            'rgba(255, 193, 7, 0.8)',
            'rgba(244, 67, 54, 0.8)'
          ],
          borderColor: [
            'rgb(76, 175, 80)',
            'rgb(255, 193, 7)',
            'rgb(244, 67, 54)'
          ],
          borderWidth: 2,
        },
      ],
    });
  };

  useEffect(() => {
    fetchFeedbackData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [useSampleData, accessToken]);

  const barChartOptions = {
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
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        padding: 12,
        titleColor: "#fff",
        bodyColor: "#fff",
        callbacks: {
          label: function (context) {
            return `Số lượng: ${context.parsed.y}`;
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 10,
        },
      },
    },
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          padding: 15,
          font: {
            size: 12,
          },
        },
      },
      tooltip: {
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        padding: 12,
        callbacks: {
          label: function (context) {
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = ((context.parsed / total) * 100).toFixed(1);
            return `${context.label}: ${context.parsed} (${percentage}%)`;
          },
        },
      },
    },
  };

  const formatTimeAgo = (date) => {
    const now = new Date();
    const past = new Date(date);
    const diffMs = now - past;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffHours < 1) return 'Vừa xong';
    if (diffHours < 24) return `${diffHours} giờ trước`;
    if (diffDays < 7) return `${diffDays} ngày trước`;
    return past.toLocaleDateString('vi-VN');
  };

  const renderStars = (rating) => {
    return '⭐'.repeat(rating);
  };

  return (
    <div className="feedback-statistics">
      <div className="content-header">
        <h2>FEEDBACK & RATING STATISTICS</h2>
        <div className="header-controls">
          <button 
            className={`data-toggle-btn ${useSampleData ? 'sample' : 'real'}`}
            onClick={() => setUseSampleData(!useSampleData)}
            title="Toggle between real and sample data"
          >
            {useSampleData ? '📊 Sample Data' : '🔗 Real Data'}
          </button>
        </div>
      </div>

      {loading ? (
        <div className="loading-state">
          <p>Loading feedback data...</p>
        </div>
      ) : error ? (
        <div className="error-state">
          <p>Error: {error}</p>
          <button onClick={fetchFeedbackData}>Retry</button>
        </div>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="stats-cards">
            <div className="stat-card">
              <div className="stat-icon">📝</div>
              <div className="stat-value">{stats.totalFeedbacks}</div>
              <div className="stat-label">Tổng đánh giá</div>
            </div>
            <div className="stat-card highlight">
              <div className="stat-icon">⭐</div>
              <div className="stat-value">{stats.averageRating.toFixed(1)}</div>
              <div className="stat-label">Điểm trung bình</div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">👍</div>
              <div className="stat-value">
                {Math.round(((stats.ratingDistribution[4] + stats.ratingDistribution[5]) / stats.totalFeedbacks) * 100)}%
              </div>
              <div className="stat-label">Hài lòng</div>
            </div>
          </div>

          {/* Charts */}
          <div className="charts-row">
            <div className="chart-box">
              <h3>Phân bố đánh giá</h3>
              <div className="chart-container-bar">
                <Bar data={ratingChartData} options={barChartOptions} />
              </div>
            </div>

            <div className="chart-box">
              <h3>Tỷ lệ hài lòng</h3>
              <div className="chart-container-doughnut">
                <Doughnut data={pieChartData} options={doughnutOptions} />
              </div>
            </div>
          </div>

          {/* Recent Feedbacks */}
          <div className="recent-feedbacks">
            <h3>Đánh giá gần đây</h3>
            <div className="feedback-list">
              {stats.recentFeedbacks.map((fb) => (
                <div key={fb.id || fb.ID} className="feedback-item">
                  <div className="feedback-header">
                    <div className="feedback-user">
                      <strong>{fb.booking?.booking_user?.full_name || fb.booking?.user?.full_name || 'Anonymous'}</strong>
                      <span className="feedback-room">
                        {fb.booking?.room?.name || 'Unknown Room'}
                      </span>
                    </div>
                    <div className="feedback-meta">
                      <span className="feedback-rating">{renderStars(fb.rating)}</span>
                      <span className="feedback-time">{formatTimeAgo(fb.created_at)}</span>
                    </div>
                  </div>
                  {fb.comment && (
                    <div className="feedback-comment">
                      "{fb.comment}"
                    </div>
                  )}
                </div>
              ))}

              {stats.recentFeedbacks.length === 0 && (
                <div className="no-feedback">
                  <p>Chưa có đánh giá nào</p>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
