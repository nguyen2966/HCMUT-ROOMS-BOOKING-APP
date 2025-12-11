import { useState, useEffect, useCallback } from 'react';
import 'react-datepicker/dist/react-datepicker.css';
import "./BookedRooms.css";
import { useAuth } from '../../Context/AuthContext';
import axiosClient from '../../config/axiosClient';
import FeedbackModal from './FeedbackModal';

const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleString('en-GB', {
    hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric'
  });
};

function RoomCard({ room, onClick }) {
  let statusClass = '';
  let statusLabel = '';

  if (room.uiStatus === 'available') {
    statusClass = ''; 
    statusLabel = 'Check-in Ready';
  } else if (room.uiStatus === 'inuse') {
    statusClass = 'inuse-status';
    statusLabel = 'In Use';
  } else {
    statusClass = 'maintaining-status'; 
    statusLabel = 'Checked Out';
  }

  return (
    <div className={`ls-room-card`} onClick={() => onClick(room)}>
      <div
        className="room-thumb" 
        style={{ 
          backgroundImage: room.img ? `url(${room.img})` : 'none',
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }} 
      />
      
      <div className="room-info">
        <div className="room-info-top">
          <div className="info-left">
            <div className="room-id">{room.room?.name || `Room #${room.room_id}`}</div>
          </div>
          
          <div className="room-status">
            <span className={`status-pill ${statusClass}`}>
              {statusLabel}
            </span>
          </div>
        </div>

        <div className="room-tags" style={{flexDirection: 'column', gap: '4px', alignItems: 'flex-start'}}>
            <div className="tag" style={{fontSize: '12px', background: '#f9f9f9'}}>
              📅 {formatDate(room.start_time)}
            </div>
        </div>
      </div>
    </div>
  )
}

const BookedRooms = () => {
  const { user, accessToken } = useAuth(); 
  const [rooms, setRooms] = useState([]);
  const [selected, setSelected] = useState(null);
  const [showQR, setShowQR] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedbackBooking, setFeedbackBooking] = useState(null);
  const [viewMode, setViewMode] = useState('edit');

  // Wrap fetchBookings in useCallback to stabilize it
  const fetchBookings = useCallback(async () => {
    if (!accessToken || !user) return;
    
    setLoading(true);
    try {
      const res = await axiosClient.get('/booking');
      console.log("Fetched bookings:", res.data);

      if (res.data && res.data.metaData && res.data.metaData.bookingList) {
        const allBookings = res.data.metaData.bookingList;
        
        const myBookings = allBookings
          .filter(b => b.booking_user === user?.ID) 
          .map(b => {
            let uiStatus = 'available';
            if (b.checkout_time) {
                uiStatus = 'checkedout';
            } else if (b.checkin_time) {
                uiStatus = 'inuse';
            }
            const imgUrl = b.room?.room_image?.[0]?.image_url || null;
            const hasFeedback = b.feedback && b.feedback.length > 0;
            return { ...b, uiStatus, img: imgUrl, hasFeedback };
          });

        setRooms(myBookings.reverse());
      }
    } catch (err) {
      console.error("Failed to fetch bookings:", err);
    } finally {
      setLoading(false);
    }
  }, [accessToken, user]);

  // Fetch on mount and when dependencies change
  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  function handleCardClick(room) {
    setSelected(room);
    setShowQR(false);
  }

  function closePanel() {
    setSelected(null);
    setShowQR(false);
  }

  const handleCheckIn = async () => {
    if (!selected) return;
    try {
      await axiosClient.get(`/checkin/${selected.ID}`);
      alert("Check-in thành công!");
      fetchBookings(); 
      closePanel();
    } catch (error) {
      alert("Check-in thất bại: " + (error.response?.data?.message || error.message));
    }
  };

  const handleCheckOut = async () => {
    if (!selected) return;
    try {
      await axiosClient.get(`/checkout/${selected.ID}`);
      alert("Check-out thành công!");
      fetchBookings(); 
      closePanel();
    } catch (error) {
      alert("Check-out thất bại: " + (error.response?.data?.message || error.message));
    }
  };

  const handleOpenFeedback = (booking) => {
    setFeedbackBooking(booking);
    setViewMode('edit');
    setShowFeedbackModal(true);
  };

  const handleViewFeedback = (booking) => {
    setFeedbackBooking(booking);
    setViewMode('view');
    setShowFeedbackModal(true);
  };

  const handleSubmitFeedback = async (feedbackData) => {
    try {
      await axiosClient.post('/feedback', feedbackData);
      // Refresh bookings to update feedback status
      fetchBookings();
    } catch (error) {
      throw error;
    }
  };

  const handleQRBack = async () => {
    setShowQR(false);
    if (selected && selected.uiStatus === 'available') {
      await handleCheckIn();
    }
  };
  return (
    <div className="rooms-page learning-spaces">
      <main className="rooms-main">
        <h2 className="page-title">Your Booking History</h2>
        
        {loading ? (
            <p>Loading your bookings...</p>
        ) : rooms.length === 0 ? (
            <p>You have no bookings yet.</p>
        ) : (
            <div className="rooms-grid">
            {rooms.map(r => (
                <RoomCard key={r.ID} room={r} onClick={handleCardClick} />
            ))}
            </div>
        )}
      </main>

      {selected && (
        <div className="room-panel-overlay" onClick={closePanel}>
          <div className="room-panel room-panel-vertical" onClick={e => e.stopPropagation()}>
            {!showQR && (
              <div className="rp-vertical">
                <h3>{selected.room?.name || `Room #${selected.room_id}`}</h3>
                
                <p className="status-text">
                  {selected.uiStatus === 'available' && <span style={{color:'#1aa84b', fontWeight:'bold'}}>Available to Check-In</span>}
                  {selected.uiStatus === 'inuse' && <span style={{color:'#e67e22', fontWeight:'bold'}}>In Use</span>}
                  {selected.uiStatus === 'checkedout' && <span style={{color:'#999', fontWeight:'bold'}}>Finished</span>}
                </p>
                
                <div 
                  className="panel-thumb" 
                  style={{ 
                    backgroundImage: selected.img ? `url(${selected.img})` : 'none',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    height: '180px',
                    width: '100%'
                  }}
                />

                <div className="dates">
                  {selected.checkin_time && <div><strong>Check-In Date:</strong> <span style={{color: 'green'}}>{formatDate(selected.checkin_time)}</span></div>}
                  {selected.checkout_time && <div><strong>Check-Out Date:</strong> <span style={{color: 'red'}}>{formatDate(selected.checkout_time)}</span></div>}
                </div>

                <div className="panel-actions-vertical">
                  {selected.uiStatus === 'available' && (
                      <button className="btn btn-green" onClick={handleCheckIn}>Check-In Now</button>
                  )}
                  
                  {selected.uiStatus === 'inuse' && (
                      <button className="btn btn-red" onClick={handleCheckOut}>Check-Out Now</button>
                  )}

                  {selected.uiStatus === 'checkedout' && !selected.hasFeedback && (
                      <button className="btn btn-primary" onClick={() => handleOpenFeedback(selected)}>
                        ⭐ Đánh giá phòng
                      </button>
                  )}

                  {selected.uiStatus === 'checkedout' && selected.hasFeedback && (
                      <button className="btn btn-primary" onClick={() => handleViewFeedback(selected)} style={{background: '#4caf50', borderColor: '#4caf50'}}>
                        👁️ Xem đánh giá
                      </button>
                  )}

                  {selected.uiStatus === 'available' && (
                      <button className="btn btn-dark" onClick={() => setShowQR(true)}>Show QR Code</button>
                  )}
                </div>
              </div>
            )}

            {showQR && (
              <div className="rp-vertical">
                <h3 style={{textAlign:'center'}}>{selected.room?.name}</h3>
                <p className="status-text" style={{textAlign:'center'}}>Scan at the door</p>
                
                <div className="qr-area">
                  <div className="qr-center">
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(selected.ID)}`}
                      alt="qr"
                    />
                  </div>
                  <div style={{ marginTop: 12 }}>
                    <button className="btn btn-dark" onClick={handleQRBack}>Back</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {showFeedbackModal && feedbackBooking && (
        <FeedbackModal
          booking={feedbackBooking}
          viewMode={viewMode}
          onClose={() => {
            setShowFeedbackModal(false);
            setFeedbackBooking(null);
            setViewMode('edit');
          }}
          onSubmit={handleSubmitFeedback}
        />
      )}
    </div>
  )
}

export default BookedRooms;