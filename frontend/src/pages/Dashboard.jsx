import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Ticket, CreditCard, Clock, CheckCircle, XCircle, Calendar, Tag, DollarSign } from 'lucide-react';
import { Link } from 'react-router-dom';

const StatusBadge = ({ status }) => {
  const styles = {
    CONFIRMED: { bg: 'rgba(16,185,129,0.12)', color: '#10b981', icon: <CheckCircle size={13} /> },
    PENDING:   { bg: 'rgba(239,68,68,0.12)',  color: '#ef4444', icon: <Clock size={13} /> },
    CANCELLED: { bg: 'rgba(100,116,139,0.12)', color: '#64748b', icon: <XCircle size={13} /> },
  };
  const s = styles[status] || styles.PENDING;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
      background: s.bg, color: s.color, borderRadius: '999px',
      padding: '0.25rem 0.7rem', fontSize: '0.75rem', fontWeight: '600',
    }}>
      {s.icon} {status}
    </span>
  );
};

const Dashboard = ({ user }) => {
  const [bookings, setBookings] = useState([]);
  const [events, setEvents] = useState({});   // eventId → event object (name cache)
  const [loading, setLoading] = useState(true);
  const [paymentProcessing, setPaymentProcessing] = useState(null);
  const [cancelling, setCancelling] = useState(null);
  const [qrModal, setQrModal] = useState(null); // booking object for QR modal

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const data = await api.getMyBookings();
      const list = data || [];
      setBookings(list);

      // Resolve unique event names
      const uniqueEventIds = [...new Set(list.map(b => b.eventId).filter(Boolean))];
      const eventMap = {};
      await Promise.all(
        uniqueEventIds.map(async (eid) => {
          try {
            const ev = await api.getEventById(eid);
            if (ev) eventMap[eid] = ev;
          } catch (_) { /* ignore */ }
        })
      );
      setEvents(eventMap);
    } catch (error) {
      console.error('Failed to fetch bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async (bookingId) => {
    setPaymentProcessing(bookingId);
    try {
      await api.processMockPayment(bookingId);
      fetchBookings();
    } catch (error) {
      alert(error.message || 'Payment failed');
    } finally {
      setPaymentProcessing(null);
    }
  };

  const handleCancel = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking? Seats will be restored.')) return;
    setCancelling(bookingId);
    try {
      await api.cancelBooking(bookingId);
      fetchBookings();
    } catch (error) {
      alert(error.message || 'Failed to cancel booking');
    } finally {
      setCancelling(null);
    }
  };

  if (loading) return (
    <div style={{ textAlign: 'center', padding: '5rem', color: 'var(--text-muted)' }}>
      <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>⏳</div>
      Loading your dashboard...
    </div>
  );

  const confirmed = bookings.filter(b => b.status === 'CONFIRMED').length;
  const pending   = bookings.filter(b => b.status === 'PENDING').length;

  return (
    <div className="animate-fade-in" style={{ padding: '2rem 0' }}>
      {/* Header */}
      <div style={{ marginBottom: '2.5rem' }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '0.4rem' }}>Welcome back, {user.name} 👋</h1>
        <p style={{ color: 'var(--text-muted)' }}>Manage your event bookings and tickets</p>
      </div>

      {/* Stats Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem', marginBottom: '2.5rem' }}>
        {[
          { label: 'Total Bookings', value: bookings.length, icon: '🎟️', color: '#6366f1' },
          { label: 'Confirmed', value: confirmed, icon: '✅', color: '#10b981' },
          { label: 'Pending Payment', value: pending, icon: '⏳', color: '#f59e0b' },
        ].map(stat => (
          <div key={stat.label} className="card" style={{ textAlign: 'center', padding: '1.25rem' }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{stat.icon}</div>
            <div style={{ fontSize: '1.75rem', fontWeight: '700', color: stat.color }}>{stat.value}</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Bookings List */}
      <div className="card">
        <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Ticket size={20} style={{ color: 'var(--primary-color)' }} />
          My Bookings
        </h2>

        {bookings.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--text-muted)' }}>
            <Ticket size={48} style={{ marginBottom: '1rem', opacity: 0.4 }} />
            <p style={{ marginBottom: '1rem' }}>You haven't booked any events yet.</p>
            <Link to="/" className="btn btn-primary">Browse Events</Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {bookings.map(booking => {
              const eventObj = events[booking.eventId];
              return (
                <div key={booking.id} style={{
                  padding: '1.25rem 1.5rem',
                  border: '1px solid var(--border-color)',
                  borderRadius: '0.75rem',
                  backgroundColor: 'var(--bg-color)',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem',
                  flexWrap: 'wrap',
                }}>
                  <div style={{ flex: 1, minWidth: '200px' }}>
                    {/* Event name (resolved) */}
                    <h3 style={{ fontSize: '1.1rem', marginBottom: '0.4rem' }}>
                      {eventObj
                        ? <Link to={`/events/${booking.eventId}`} style={{ color: 'var(--text-main)' }}>{eventObj.title}</Link>
                        : <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Event ID: {booking.eventId}</span>
                      }
                    </h3>

                    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', color: 'var(--text-muted)', fontSize: '0.82rem', marginBottom: '0.5rem' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <Tag size={12} /> {booking.ticketCategoryName}
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <Ticket size={12} /> {booking.quantity} {booking.quantity > 1 ? 'tickets' : 'ticket'}
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <DollarSign size={12} /> ${booking.totalAmount}
                      </span>
                    </div>

                    {eventObj?.dateTime && (
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <Calendar size={12} /> {new Date(eventObj.dateTime).toLocaleString()}
                      </div>
                    )}

                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.6rem' }}>
                      Booked: {booking.bookingTime ? new Date(booking.bookingTime).toLocaleString() : 'N/A'}
                    </div>

                    <StatusBadge status={booking.status} />
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'flex-end' }}>
                    {booking.status === 'PENDING' && (
                      <>
                        <button
                          onClick={() => handlePayment(booking.id)}
                          className="btn btn-primary"
                          disabled={paymentProcessing === booking.id}
                          style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.875rem', padding: '0.5rem 1rem' }}
                        >
                          <CreditCard size={16} />
                          {paymentProcessing === booking.id ? 'Processing...' : 'Pay Now'}
                        </button>
                        <button
                          onClick={() => handleCancel(booking.id)}
                          disabled={cancelling === booking.id}
                          style={{
                            display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem',
                            padding: '0.4rem 0.9rem', borderRadius: '0.5rem', border: '1px solid rgba(239,68,68,0.3)',
                            color: '#ef4444', background: 'rgba(239,68,68,0.07)', cursor: 'pointer',
                          }}
                        >
                          <XCircle size={14} />
                          {cancelling === booking.id ? 'Cancelling...' : 'Cancel'}
                        </button>
                      </>
                    )}

                    {booking.status === 'CONFIRMED' && booking.qrCodeUrl && (
                      <button
                        className="btn btn-outline"
                        style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.875rem', padding: '0.5rem 1rem' }}
                        onClick={() => setQrModal(booking)}
                      >
                        <Ticket size={16} /> View Ticket
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* QR Code Modal */}
      {qrModal && (
        <div
          onClick={() => setQrModal(null)}
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 2000, padding: '1rem',
          }}
        >
          <div
            className="card"
            onClick={e => e.stopPropagation()}
            style={{ maxWidth: '400px', width: '100%', textAlign: 'center' }}
          >
            <h3 style={{ marginBottom: '0.5rem', fontSize: '1.2rem' }}>🎟️ Your Ticket</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
              {events[qrModal.eventId]?.title || qrModal.eventId} · {qrModal.ticketCategoryName} · {qrModal.quantity} seat{qrModal.quantity > 1 ? 's' : ''}
            </p>
            <img
              src={qrModal.qrCodeUrl}
              alt="Ticket QR Code"
              style={{ maxWidth: '220px', margin: '0 auto 1.25rem', display: 'block', borderRadius: '0.5rem' }}
            />
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
              Present this QR code at the event entrance
            </p>
            <button className="btn btn-primary" style={{ width: '100%' }} onClick={() => setQrModal(null)}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
