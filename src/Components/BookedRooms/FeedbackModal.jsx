import React, { useState, useEffect } from 'react';
import './FeedbackModal.css';

const FeedbackModal = ({ booking, onClose, onSubmit, viewMode = 'edit' }) => {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Load existing feedback when in view mode
  useEffect(() => {
    if (viewMode === 'view' && booking.feedback && booking.feedback.length > 0) {
      const existingFeedback = booking.feedback[0];
      setRating(existingFeedback.rating || 0);
      setComment(existingFeedback.comment || '');
    }
  }, [viewMode, booking]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (rating === 0) {
      alert('Vui lòng chọn số sao đánh giá');
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit({ rating, comment, booking_id: booking.ID });
      alert('Cảm ơn bạn đã đánh giá!');
      onClose();
    } catch (error) {
      alert('Gửi đánh giá thất bại: ' + (error.response?.data?.message || error.message));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="feedback-modal-overlay" onClick={onClose}>
      <div className="feedback-modal" onClick={e => e.stopPropagation()}>
        <div className="feedback-header">
          <h3>{viewMode === 'view' ? 'Đánh giá của bạn' : 'Đánh giá phòng'}</h3>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>

        <div className="feedback-body">
          <div className="booking-info">
            <p className="room-name">{booking.room?.name || `Room #${booking.room_id}`}</p>
            <p className="booking-date">
              {new Date(booking.start_time).toLocaleDateString('vi-VN')}
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="rating-section">
              <label>Đánh giá của bạn:</label>
              <div className="stars">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    className={`star ${star <= (hoverRating || rating) ? 'active' : ''}`}
                    onClick={() => viewMode === 'edit' && setRating(star)}
                    onMouseEnter={() => viewMode === 'edit' && setHoverRating(star)}
                    onMouseLeave={() => viewMode === 'edit' && setHoverRating(0)}
                    disabled={viewMode === 'view'}
                    style={{ cursor: viewMode === 'view' ? 'default' : 'pointer' }}
                  >
                    ★
                  </button>
                ))}
              </div>
              <p className="rating-text">
                {rating === 0 && 'Chọn số sao'}
                {rating === 1 && 'Rất tệ'}
                {rating === 2 && 'Tệ'}
                {rating === 3 && 'Bình thường'}
                {rating === 4 && 'Tốt'}
                {rating === 5 && 'Rất tốt'}
              </p>
            </div>

            <div className="comment-section">
              <label>Nhận xét của bạn:</label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Chia sẻ trải nghiệm của bạn về phòng này..."
                rows="4"
                disabled={viewMode === 'view'}
                readOnly={viewMode === 'view'}
              />
            </div>

            <div className="feedback-actions">
              <button 
                type="button" 
                className="btn btn-cancel" 
                onClick={onClose}
                disabled={submitting}
              >
                {viewMode === 'view' ? 'Đóng' : 'Hủy'}
              </button>
              {viewMode === 'edit' && (
                <button 
                  type="submit" 
                  className="btn btn-submit"
                  disabled={submitting}
                >
                  {submitting ? 'Đang gửi...' : 'Gửi đánh giá'}
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default FeedbackModal;
