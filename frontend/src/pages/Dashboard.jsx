import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Ticket, CreditCard, Clock, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const Dashboard = ({ user }) => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [paymentProcessing, setPaymentProcessing] = useState(null);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const data = await api.getMyBookings();
      setBookings(data || []);
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
      // Refresh bookings to show updated status
      fetchBookings();
    } catch (error) {
      alert(error.message || 'Payment failed');
    } finally {
      setPaymentProcessing(null);
    }
  };

  if (loading) return <div style={{ textAlign: 'center', padding: '4rem' }}>Loading dashboard...</div>;

  return (
    <div className="animate-fade-in" style={{ padding: '2rem 0' }}>
      <div style={{ marginBottom: '3rem' }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Welcome back, {user.name}</h1>
        <p style={{ color: 'var(--text-muted)' }}>Manage your event bookings and payments</p>
      </div>

      <div className="card">
        <h2 style={{ fontSize: '1.5rem', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Ticket className="text-primary-color" />
          My Bookings
        </h2>

        {bookings.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--text-muted)' }}>
            <p style={{ marginBottom: '1rem' }}>You haven't booked any events yet.</p>
            <Link to="/" className="btn btn-primary">Browse Events</Link>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '1.5rem' }}>
            {bookings.map(booking => (
              <div key={booking.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.5rem', border: '1px solid var(--border-color)', borderRadius: '0.75rem', backgroundColor: 'var(--bg-color)' }}>
                
                <div>
                  <h3 style={{ fontSize: '1.25rem', marginBottom: '0.25rem' }}>
                    Event: {booking.eventId}
                  </h3>
                  <div style={{ display: 'flex', gap: '1rem', color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
                    <span>{booking.ticketCategoryName}</span>
                    <span>•</span>
                    <span>{booking.quantity} {booking.quantity > 1 ? 'Tickets' : 'Ticket'}</span>
                    <span>•</span>
                    <span>Total: ${booking.totalAmount}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                    Booked: {booking.bookingTime ? new Date(booking.bookingTime).toLocaleString() : 'N/A'}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    {booking.status === 'CONFIRMED' ? (
                      <span className="badge badge-success" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <CheckCircle size={12} /> Confirmed
                      </span>
                    ) : booking.status === 'CANCELLED' ? (
                      <span className="badge" style={{ backgroundColor: 'rgba(107, 114, 128, 0.1)', color: '#6b7280', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        Cancelled
                      </span>
                    ) : (
                      <span className="badge" style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger-color)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <Clock size={12} /> Pending Payment
                      </span>
                    )}
                  </div>
                </div>

                <div>
                  {booking.status === 'PENDING' && (
                    <button 
                      onClick={() => handlePayment(booking.id)} 
                      className="btn btn-primary"
                      disabled={paymentProcessing === booking.id}
                      style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                    >
                      <CreditCard size={18} />
                      {paymentProcessing === booking.id ? 'Processing...' : 'Pay Now'}
                    </button>
                  )}
                  {booking.status === 'CONFIRMED' && booking.qrCodeUrl && (
                    <button 
                      className="btn btn-outline" 
                      style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                      onClick={() => {
                        const win = window.open('', '_blank');
                        win.document.write(`<img src="${booking.qrCodeUrl}" alt="Ticket QR Code" style="max-width:300px"/>`);
                      }}
                    >
                      <Ticket size={18} />
                      View Ticket
                    </button>
                  )}
                </div>
                
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
