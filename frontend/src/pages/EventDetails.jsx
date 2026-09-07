import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { Calendar, MapPin, Users, DollarSign, CheckCircle } from 'lucide-react';

const EventDetails = ({ user }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [seats, setSeats] = useState(1);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchEventDetails();
  }, [id]);

  const fetchEventDetails = async () => {
    try {
      const data = await api.getEventById(id);
      setEvent(data);
    } catch (error) {
      console.error('Failed to fetch event:', error);
      setError('Event not found');
    } finally {
      setLoading(false);
    }
  };

  const handleBooking = async (e) => {
    e.preventDefault();
    if (!user) {
      navigate('/login');
      return;
    }

    setBookingLoading(true);
    setError('');
    
    try {
      await api.holdSeats({ eventId: id, seats });
      setSuccess('Seats held successfully! Go to dashboard to pay.');
      // Refresh event to show updated available seats
      fetchEventDetails();
    } catch (err) {
      setError(err.message || 'Failed to hold seats');
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) return <div style={{ textAlign: 'center', padding: '4rem' }}>Loading event details...</div>;
  if (!event) return <div style={{ textAlign: 'center', padding: '4rem' }}>Event not found.</div>;

  return (
    <div className="animate-fade-in" style={{ padding: '2rem 0' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '2rem', alignItems: 'start' }}>
        
        {/* Main Details */}
        <div>
          <div style={{ height: '400px', backgroundColor: 'var(--border-color)', borderRadius: '1rem', marginBottom: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Calendar size={80} style={{ color: 'var(--text-muted)' }} />
          </div>
          
          <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>{event.title}</h1>
          
          <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)' }}>
              <Calendar size={20} className="text-primary-color" />
              <span>{new Date(event.dateTime).toLocaleString()}</span>
            </div>
            {event.venue && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)' }}>
                <MapPin size={20} className="text-primary-color" />
                <span>{event.venue.name} ({event.venue.location})</span>
              </div>
            )}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)' }}>
              <Users size={20} className="text-primary-color" />
              <span>{event.availableSeats} / {event.totalSeats} seats available</span>
            </div>
          </div>
          
          <div className="card" style={{ marginBottom: '2rem' }}>
            <h3 style={{ marginBottom: '1rem', fontSize: '1.25rem' }}>About this Event</h3>
            <p style={{ color: 'var(--text-muted)', lineHeight: '1.8' }}>{event.description}</p>
          </div>
        </div>

        {/* Booking Card */}
        <div className="card" style={{ position: 'sticky', top: '2rem' }}>
          <h3 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
            Book Tickets
          </h3>
          
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
            <span style={{ color: 'var(--text-muted)' }}>Price per ticket</span>
            <span style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--primary-color)' }}>
              ${event.price}
            </span>
          </div>

          {success ? (
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
                <label htmlFor="seats">Number of Seats</label>
                <select 
                  id="seats" 
                  value={seats} 
                  onChange={(e) => setSeats(Number(e.target.value))}
                  style={{ width: '100%' }}
                >
                  {[...Array(Math.min(10, event.availableSeats)).keys()].map(n => (
                    <option key={n + 1} value={n + 1}>{n + 1}</option>
                  ))}
                </select>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
                <span>Total</span>
                <span style={{ fontWeight: 'bold' }}>${(event.price * seats).toFixed(2)}</span>
              </div>
              
              {error && <div className="error-text" style={{ marginBottom: '1rem' }}>{error}</div>}
              
              <button 
                type="submit" 
                className="btn btn-primary" 
                style={{ width: '100%' }} 
                disabled={bookingLoading || event.availableSeats === 0}
              >
                {event.availableSeats === 0 ? 'Sold Out' : bookingLoading ? 'Processing...' : 'Hold Seats'}
              </button>
            </form>
          )}
        </div>
        
      </div>
    </div>
  );
};

export default EventDetails;
