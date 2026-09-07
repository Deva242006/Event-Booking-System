import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Link } from 'react-router-dom';
import { Calendar, MapPin, Search, DollarSign } from 'lucide-react';

const Home = () => {
  const [events, setEvents] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async (query = '') => {
    setLoading(true);
    try {
      const data = query ? await api.searchEvents(query) : await api.getEvents();
      setEvents(data || []);
    } catch (error) {
      console.error('Failed to fetch events:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchEvents(search);
  };

  const getLowestPrice = (ticketCategories) => {
    if (!ticketCategories || ticketCategories.length === 0) return null;
    return Math.min(...ticketCategories.map(cat => cat.price));
  };

  const getTotalAvailable = (ticketCategories) => {
    if (!ticketCategories || ticketCategories.length === 0) return 0;
    return ticketCategories.reduce((sum, cat) => sum + cat.totalAvailable, 0);
  };

  return (
    <div className="animate-fade-in">
      <div style={{ textAlign: 'center', marginBottom: '3rem', paddingTop: '2rem' }}>
        <h1 style={{ fontSize: '3rem', marginBottom: '1rem', color: 'var(--text-main)' }}>Find Your Next Experience</h1>
        <p style={{ fontSize: '1.25rem', color: 'var(--text-muted)', maxWidth: '600px', margin: '0 auto 2rem' }}>
          Discover and book the best events happening around you. From tech conferences to music festivals.
        </p>
        
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '0.5rem', maxWidth: '500px', margin: '0 auto' }}>
          <div style={{ position: 'relative', flexGrow: 1 }}>
            <Search style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} size={20} />
            <input 
              type="text" 
              placeholder="Search for events..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ width: '100%', paddingLeft: '3rem' }}
            />
          </div>
          <button type="submit" className="btn btn-primary">Search</button>
        </form>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>Loading events...</div>
      ) : events.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>No events found. Try a different search.</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '2rem' }}>
          {events.map(event => {
            const lowestPrice = getLowestPrice(event.ticketCategories);
            const totalAvailable = getTotalAvailable(event.ticketCategories);

            return (
              <div key={event.id} className="card card-hover" style={{ display: 'flex', flexDirection: 'column' }}>
                <div style={{ height: '200px', backgroundColor: 'var(--border-color)', borderRadius: '0.5rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                  <Calendar size={48} style={{ color: 'var(--text-muted)' }} />
                </div>
                <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>{event.title}</h3>
                <p style={{ color: 'var(--text-muted)', marginBottom: '1rem', flexGrow: 1 }}>{event.description}</p>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.5rem', fontSize: '0.875rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)' }}>
                    <Calendar size={16} />
                    {event.dateTime ? new Date(event.dateTime).toLocaleString() : 'Date TBD'}
                  </div>
                  {totalAvailable > 0 && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)' }}>
                      <DollarSign size={16} />
                      {totalAvailable} tickets available
                    </div>
                  )}
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
                  <span style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--primary-color)' }}>
                    {lowestPrice !== null ? `From $${lowestPrice}` : 'Free'}
                  </span>
                  <Link to={`/events/${event.id}`} className="btn btn-outline" style={{ padding: '0.5rem 1rem' }}>
                    Details
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Home;
