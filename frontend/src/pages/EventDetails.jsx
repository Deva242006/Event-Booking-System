import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { Calendar, MapPin, CheckCircle, Star, Heart, Send, Share2, Copy, Clock, Users } from 'lucide-react';

const StarRating = ({ value, onChange, readOnly = false }) => (
  <div style={{ display: 'flex', gap: '0.25rem' }}>
    {[1, 2, 3, 4, 5].map(star => (
      <button
        key={star}
        type="button"
        onClick={() => !readOnly && onChange && onChange(star)}
        style={{
          background: 'none', border: 'none', cursor: readOnly ? 'default' : 'pointer',
          padding: '0.1rem', lineHeight: 1,
        }}
      >
        <Star
          size={readOnly ? 14 : 22}
          fill={star <= value ? '#eab308' : 'none'}
          color={star <= value ? '#eab308' : 'var(--border-color)'}
          style={{ transition: 'all 0.15s ease' }}
        />
      </button>
    ))}
  </div>
);

// ── Countdown Timer Component ──────────────────────────────────────────────────
const CountdownTimer = ({ dateTime }) => {
  const [timeLeft, setTimeLeft] = useState(null);

  useEffect(() => {
    if (!dateTime) return;
    const target = new Date(dateTime).getTime();

    const calculate = () => {
      const now = Date.now();
      const diff = target - now;
      if (diff <= 0) {
        setTimeLeft(null);
        return;
      }
      setTimeLeft({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((diff % (1000 * 60)) / 1000),
      });
    };

    calculate();
    const interval = setInterval(calculate, 1000);
    return () => clearInterval(interval);
  }, [dateTime]);

  if (!timeLeft) return null;

  const units = [
    { label: 'Days', value: timeLeft.days },
    { label: 'Hours', value: timeLeft.hours },
    { label: 'Min', value: timeLeft.minutes },
    { label: 'Sec', value: timeLeft.seconds },
  ];

  return (
    <div style={{
      display: 'flex', gap: '0.6rem', justifyContent: 'center',
      padding: '1rem', borderRadius: '0.75rem',
      background: 'linear-gradient(135deg, rgba(99,102,241,0.15), rgba(139,92,246,0.1))',
      border: '1px solid rgba(99,102,241,0.2)',
      marginBottom: '1.5rem',
    }}>
      <Clock size={16} style={{ color: 'var(--primary-color)', marginTop: '0.2rem' }} />
      <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', alignSelf: 'center', marginRight: '0.25rem' }}>
        Starts in
      </span>
      {units.map(u => (
        <div key={u.label} style={{ textAlign: 'center', minWidth: '42px' }}>
          <div style={{
            fontSize: '1.25rem', fontWeight: '700', color: 'var(--primary-color)',
            background: 'rgba(99,102,241,0.1)', borderRadius: '0.5rem', padding: '0.25rem 0.4rem',
          }}>
            {String(u.value).padStart(2, '0')}
          </div>
          <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: '0.2rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            {u.label}
          </div>
        </div>
      ))}
    </div>
  );
};

const EventDetails = ({ user }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [venue, setVenue] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Wishlist
  const [wishlisted, setWishlisted] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);

  // Share
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [copied, setCopied] = useState(false);

  // Review form
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewError, setReviewError] = useState('');
  const [reviewSuccess, setReviewSuccess] = useState('');
  const [reviewSubmitting, setReviewSubmitting] = useState(false);

  useEffect(() => {
    fetchEventDetails();
  }, [id]);

  // BUG FIX: Consistently use user.email for wishlist state (backend stores email)
  useEffect(() => {
    if (event && user) {
      setWishlisted(event.savedByUserIds?.includes(user.email) || false);
    }
  }, [event, user]);

  const fetchEventDetails = async () => {
    try {
      const data = await api.getEventById(id);
      setEvent(data);
      if (data?.ticketCategories?.length > 0) {
        setSelectedCategory(data.ticketCategories[0].name);
      }
      if (data?.venueId) {
        try {
          const venues = await api.getVenues();
          const found = venues?.find(v => v.id === data.venueId);
          setVenue(found || null);
        } catch (_) { /* venue lookup is non-critical */ }
      }
    } catch (error) {
      console.error('Failed to fetch event:', error);
      setError('Event not found');
    } finally {
      setLoading(false);
    }
  };

  const handleBooking = async (e) => {
    e.preventDefault();
    if (!user) { navigate('/login'); return; }
    if (!selectedCategory) { setError('Please select a ticket category'); return; }
    setBookingLoading(true);
    setError('');
    try {
      await api.holdSeats({ eventId: id, ticketCategoryName: selectedCategory, quantity });
      setSuccess('Seats held! Go to dashboard to complete payment.');
      fetchEventDetails();
    } catch (err) {
      setError(err.message || 'Failed to hold seats');
    } finally {
      setBookingLoading(false);
    }
  };

  const handleWishlist = async () => {
    if (!user) { navigate('/login'); return; }
    setWishlistLoading(true);
    try {
      const updated = await api.toggleWishlist(id);
      // BUG FIX: use user.email consistently (backend stores email in savedByUserIds)
      setWishlisted(updated.savedByUserIds?.includes(user.email) || false);
      setEvent(updated);
    } catch (err) {
      console.error('Wishlist toggle failed:', err);
    } finally {
      setWishlistLoading(false);
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!user) { navigate('/login'); return; }
    if (!reviewComment.trim()) { setReviewError('Please write a comment.'); return; }
    setReviewSubmitting(true);
    setReviewError('');
    setReviewSuccess('');
    try {
      const updated = await api.addReview(id, { rating: reviewRating, comment: reviewComment });
      setEvent(updated);
      setReviewSuccess('Review submitted! Thank you.');
      setReviewComment('');
      setReviewRating(5);
    } catch (err) {
      setReviewError(err.message || 'Failed to submit review.');
    } finally {
      setReviewSubmitting(false);
    }
  };

  // ── Share Event ──────────────────────────────────────────────────────────────
  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShareTwitter = () => {
    const url = encodeURIComponent(window.location.href);
    const text = encodeURIComponent(`Check out "${event?.title}" on EventBook! 🎉`);
    window.open(`https://twitter.com/intent/tweet?url=${url}&text=${text}`, '_blank');
  };

  const handleShareWhatsApp = () => {
    const url = encodeURIComponent(window.location.href);
    const text = encodeURIComponent(`Check out "${event?.title}" on EventBook! 🎉 ${window.location.href}`);
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  const getSelectedCategoryData = () =>
    event?.ticketCategories?.find(cat => cat.name === selectedCategory);

  const getAverageRating = () => {
    if (!event?.reviews?.length) return null;
    return (event.reviews.reduce((s, r) => s + r.rating, 0) / event.reviews.length).toFixed(1);
  };

  const getTotalAvailable = () => {
    if (!event?.ticketCategories?.length) return 0;
    return event.ticketCategories.reduce((sum, cat) => sum + cat.totalAvailable, 0);
  };

  const userAlreadyReviewed = () =>
    user && event?.reviews?.some(r => r.userId === user.email);

  if (loading) return (
    <div style={{ textAlign: 'center', padding: '4rem' }}>
      <div className="skeleton-pulse" style={{ width: '200px', height: '24px', margin: '0 auto 1rem', borderRadius: '0.5rem', background: 'var(--surface-color)' }} />
      <div style={{ color: 'var(--text-muted)' }}>Loading event details...</div>
    </div>
  );
  if (!event) return <div style={{ textAlign: 'center', padding: '4rem' }}>Event not found.</div>;

  const categoryData = getSelectedCategoryData();
  const avgRating = getAverageRating();
  const totalAvailable = getTotalAvailable();
  const isPastEvent = event.dateTime && new Date(event.dateTime) < new Date();

  return (
    <div className="animate-fade-in" style={{ padding: '2rem 0' }}>
      <div className="event-details-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '2rem', alignItems: 'start' }}>

        {/* ── Left: Main Details ─────────────────────────── */}
        <div>
          {/* Banner */}
          <div style={{
            height: '360px', borderRadius: '1rem', marginBottom: '2rem', overflow: 'hidden', position: 'relative',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Calendar size={80} style={{ color: 'rgba(255,255,255,0.3)' }} />

            {/* Category badge */}
            {event.category && (
              <span style={{
                position: 'absolute', top: '1.25rem', left: '1.25rem',
                padding: '0.35rem 0.9rem', borderRadius: '999px', fontSize: '0.8rem',
                fontWeight: '600', background: 'rgba(255,255,255,0.2)',
                color: '#fff', backdropFilter: 'blur(6px)', border: '1px solid rgba(255,255,255,0.3)',
              }}>
                {event.category}
              </span>
            )}

            {/* Past event badge */}
            {isPastEvent && (
              <span style={{
                position: 'absolute', bottom: '1.25rem', right: '1.25rem',
                padding: '0.35rem 0.9rem', borderRadius: '999px', fontSize: '0.8rem',
                fontWeight: '600', background: 'rgba(239,68,68,0.85)',
                color: '#fff', backdropFilter: 'blur(6px)',
              }}>
                Event Ended
              </span>
            )}

            {/* Wishlist button */}
            <button
              id="wishlist-btn"
              onClick={handleWishlist}
              disabled={wishlistLoading}
              style={{
                position: 'absolute', top: '1.25rem', right: '1.25rem',
                width: '42px', height: '42px', borderRadius: '50%',
                background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(6px)',
                border: '1px solid rgba(255,255,255,0.3)', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all 0.2s ease',
              }}
              title={wishlisted ? 'Remove from wishlist' : 'Save to wishlist'}
            >
              <Heart
                size={20}
                fill={wishlisted ? '#f43f5e' : 'none'}
                color={wishlisted ? '#f43f5e' : '#fff'}
              />
            </button>

            {/* Rating pill */}
            {avgRating && (
              <div style={{
                position: 'absolute', bottom: '1.25rem', left: '1.25rem',
                display: 'flex', alignItems: 'center', gap: '0.35rem',
                padding: '0.35rem 0.9rem', borderRadius: '999px',
                background: 'rgba(0,0,0,0.4)', color: '#eab308', fontSize: '0.9rem', fontWeight: '600',
              }}>
                <Star size={15} fill="#eab308" /> {avgRating} · {event.reviews.length} reviews
              </div>
            )}
          </div>

          {/* Title + Share */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', marginBottom: '0.75rem' }}>
            <h1 style={{ fontSize: '2.2rem' }}>{event.title}</h1>
            <div style={{ position: 'relative' }}>
              <button
                id="share-event-btn"
                onClick={() => setShowShareMenu(!showShareMenu)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.4rem',
                  padding: '0.5rem 1rem', borderRadius: '999px',
                  border: '1px solid var(--border-color)', background: 'var(--surface-color)',
                  color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.85rem', fontWeight: '500',
                  transition: 'all 0.2s ease', whiteSpace: 'nowrap',
                }}
              >
                <Share2 size={15} /> Share
              </button>
              {showShareMenu && (
                <div style={{
                  position: 'absolute', top: '110%', right: 0, zIndex: 50,
                  background: 'var(--surface-color)', border: '1px solid var(--border-color)',
                  borderRadius: '0.75rem', padding: '0.5rem', minWidth: '180px',
                  boxShadow: '0 8px 30px rgba(0,0,0,0.4)',
                }}>
                  <button onClick={handleCopyLink} style={{
                    display: 'flex', alignItems: 'center', gap: '0.5rem', width: '100%',
                    padding: '0.6rem 0.75rem', border: 'none', background: 'transparent',
                    color: copied ? '#10b981' : 'var(--text-main)', cursor: 'pointer', borderRadius: '0.4rem',
                    fontSize: '0.85rem', transition: 'background 0.15s',
                  }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <Copy size={14} /> {copied ? 'Copied!' : 'Copy Link'}
                  </button>
                  <button onClick={handleShareTwitter} style={{
                    display: 'flex', alignItems: 'center', gap: '0.5rem', width: '100%',
                    padding: '0.6rem 0.75rem', border: 'none', background: 'transparent',
                    color: 'var(--text-main)', cursor: 'pointer', borderRadius: '0.4rem',
                    fontSize: '0.85rem', transition: 'background 0.15s',
                  }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    𝕏 Share on X
                  </button>
                  <button onClick={handleShareWhatsApp} style={{
                    display: 'flex', alignItems: 'center', gap: '0.5rem', width: '100%',
                    padding: '0.6rem 0.75rem', border: 'none', background: 'transparent',
                    color: 'var(--text-main)', cursor: 'pointer', borderRadius: '0.4rem',
                    fontSize: '0.85rem', transition: 'background 0.15s',
                  }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    💬 WhatsApp
                  </button>
                </div>
              )}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)' }}>
              <Calendar size={18} style={{ color: 'var(--primary-color)' }} />
              <span>{new Date(event.dateTime).toLocaleString()}</span>
            </div>
            {(venue || event.venueId) && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)' }}>
                <MapPin size={18} style={{ color: 'var(--primary-color)' }} />
                <span>
                  {venue ? `${venue.name}${venue.location ? ` · ${venue.location}` : ''}` : `Venue: ${event.venueId}`}
                </span>
              </div>
            )}
            {totalAvailable > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)' }}>
                <Users size={18} style={{ color: 'var(--primary-color)' }} />
                <span>{totalAvailable} seats available</span>
              </div>
            )}
          </div>

          {/* Countdown Timer */}
          {!isPastEvent && event.dateTime && (
            <CountdownTimer dateTime={event.dateTime} />
          )}

          <div className="card" style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ marginBottom: '0.75rem', fontSize: '1.15rem' }}>About this Event</h3>
            <p style={{ color: 'var(--text-muted)', lineHeight: '1.8' }}>{event.description}</p>
          </div>

          {/* Ticket Categories */}
          {event.ticketCategories?.length > 0 && (
            <div className="card" style={{ marginBottom: '1.5rem' }}>
              <h3 style={{ marginBottom: '1rem', fontSize: '1.15rem' }}>Ticket Categories</h3>
              <div style={{ display: 'grid', gap: '0.6rem' }}>
                {event.ticketCategories.map(cat => {
                  const pctSold = cat.totalAvailable <= 0 ? 100 : 0; // We don't have original count, so just show availability
                  return (
                    <div key={cat.name} style={{
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      padding: '0.85rem 1rem', border: '1px solid var(--border-color)',
                      borderRadius: '0.5rem', background: 'var(--bg-color)',
                    }}>
                      <div style={{ flex: 1 }}>
                        <strong>{cat.name}</strong>
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '0.25rem' }}>
                          {cat.totalAvailable > 0 ? (
                            <span style={{ color: cat.totalAvailable < 10 ? '#f59e0b' : 'var(--text-muted)' }}>
                              {cat.totalAvailable} available {cat.totalAvailable < 10 && '🔥'}
                            </span>
                          ) : (
                            <span style={{ color: '#ef4444' }}>Sold Out</span>
                          )}
                        </div>
                      </div>
                      <span style={{ fontWeight: 'bold', color: 'var(--primary-color)', fontSize: '1.15rem' }}>${cat.price}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── Reviews Section ───────────────────────────── */}
          <div className="card">
            <h3 style={{ fontSize: '1.15rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Star size={18} style={{ color: '#eab308' }} />
              Reviews {event.reviews?.length > 0 ? `(${event.reviews.length})` : ''}
            </h3>

            {/* Existing reviews */}
            {event.reviews?.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
                {event.reviews.map((r, i) => (
                  <div key={i} style={{
                    padding: '1rem', borderRadius: '0.6rem',
                    background: 'var(--bg-color)', border: '1px solid var(--border-color)',
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                      <strong style={{ fontSize: '0.9rem' }}>{r.userName || 'Anonymous'}</strong>
                      <StarRating value={r.rating} readOnly />
                    </div>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', lineHeight: 1.5 }}>{r.comment}</p>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.35rem', display: 'block' }}>
                      {r.createdAt ? new Date(r.createdAt).toLocaleDateString() : ''}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '1.25rem' }}>
                No reviews yet. Be the first to review this event!
              </p>
            )}

            {/* Write a review */}
            {user && !userAlreadyReviewed() && (
              <form onSubmit={handleReviewSubmit} style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1.25rem' }}>
                <h4 style={{ fontSize: '1rem', marginBottom: '0.75rem' }}>Write a Review</h4>
                <div style={{ marginBottom: '0.75rem' }}>
                  <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.4rem' }}>Your Rating</label>
                  <StarRating value={reviewRating} onChange={setReviewRating} />
                </div>
                <div className="form-group" style={{ marginBottom: '0.75rem' }}>
                  <textarea
                    id="review-comment"
                    placeholder="Share your experience..."
                    value={reviewComment}
                    onChange={e => setReviewComment(e.target.value)}
                    required
                    style={{ width: '100%', minHeight: '90px', resize: 'vertical' }}
                  />
                </div>
                {reviewError && <p style={{ color: 'var(--danger-color)', fontSize: '0.85rem', marginBottom: '0.5rem' }}>{reviewError}</p>}
                {reviewSuccess && <p style={{ color: 'var(--success-color)', fontSize: '0.85rem', marginBottom: '0.5rem' }}>{reviewSuccess}</p>}
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={reviewSubmitting}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                >
                  <Send size={15} />
                  {reviewSubmitting ? 'Submitting...' : 'Submit Review'}
                </button>
              </form>
            )}
            {user && userAlreadyReviewed() && (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
                ✅ You have already reviewed this event.
              </p>
            )}
            {!user && (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
                <a href="/login" style={{ color: 'var(--primary-color)' }}>Log in</a> to leave a review.
              </p>
            )}
          </div>
        </div>

        {/* ── Right: Booking Card ─────────────────────────── */}
        <div className="card" style={{ position: 'sticky', top: '5rem' }}>
          <h3 style={{ fontSize: '1.4rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
            Book Tickets
          </h3>

          {isPastEvent ? (
            <div style={{ textAlign: 'center', padding: '2rem 0', color: 'var(--text-muted)' }}>
              <Clock size={48} style={{ marginBottom: '1rem', opacity: 0.4 }} />
              <p>This event has already ended.</p>
            </div>
          ) : success ? (
            <div style={{ textAlign: 'center', padding: '2rem 0' }}>
              <CheckCircle size={48} style={{ color: 'var(--success-color)', margin: '0 auto 1rem' }} />
              <p style={{ color: 'var(--success-color)', marginBottom: '1.5rem' }}>{success}</p>
              <button onClick={() => navigate('/dashboard')} className="btn btn-primary" style={{ width: '100%' }}>
                Go to Dashboard
              </button>
            </div>
          ) : (
            <form onSubmit={handleBooking}>
              <div className="form-group">
                <label htmlFor="ticket-category">Ticket Category</label>
                <select
                  id="ticket-category"
                  value={selectedCategory}
                  onChange={e => setSelectedCategory(e.target.value)}
                  style={{ width: '100%' }}
                >
                  {event.ticketCategories?.map(cat => (
                    <option key={cat.name} value={cat.name}>
                      {cat.name} - ${cat.price} ({cat.totalAvailable} left)
                    </option>
                  ))}
                </select>
              </div>

              {categoryData && (
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Price per ticket</span>
                  <span style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--primary-color)' }}>
                    ${categoryData.price}
                  </span>
                </div>
              )}

              <div className="form-group">
                <label htmlFor="ticket-quantity">Number of Tickets</label>
                <select
                  id="ticket-quantity"
                  value={quantity}
                  onChange={e => setQuantity(Number(e.target.value))}
                  style={{ width: '100%' }}
                >
                  {categoryData && [...Array(Math.min(10, categoryData.totalAvailable)).keys()].map(n => (
                    <option key={n + 1} value={n + 1}>{n + 1}</option>
                  ))}
                </select>
              </div>

              {categoryData && (
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
                  <span>Total</span>
                  <span style={{ fontWeight: 'bold', fontSize: '1.2rem' }}>${(categoryData.price * quantity).toFixed(2)}</span>
                </div>
              )}

              {error && <div className="error-text" style={{ marginBottom: '1rem' }}>{error}</div>}

              <button
                type="submit"
                className="btn btn-primary"
                style={{ width: '100%' }}
                disabled={bookingLoading || !categoryData || categoryData.totalAvailable === 0}
              >
                {!categoryData || categoryData.totalAvailable === 0
                  ? 'Sold Out'
                  : bookingLoading ? 'Processing...' : 'Hold Seats'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default EventDetails;
