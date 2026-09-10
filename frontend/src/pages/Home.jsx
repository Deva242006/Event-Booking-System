import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Link, useNavigate } from 'react-router-dom';
import { Calendar, MapPin, Search, DollarSign, Navigation, Tag, Star, Heart } from 'lucide-react';

const CATEGORIES = ['All', 'Music', 'Tech', 'Sports', 'Art', 'Food', 'Other'];

const CATEGORY_COLORS = {
  Music: { bg: 'rgba(168,85,247,0.15)', color: '#a855f7', border: 'rgba(168,85,247,0.3)' },
  Tech:  { bg: 'rgba(59,130,246,0.15)',  color: '#3b82f6', border: 'rgba(59,130,246,0.3)' },
  Sports:{ bg: 'rgba(34,197,94,0.15)',   color: '#22c55e', border: 'rgba(34,197,94,0.3)' },
  Art:   { bg: 'rgba(251,146,60,0.15)',  color: '#fb923c', border: 'rgba(251,146,60,0.3)' },
  Food:  { bg: 'rgba(234,179,8,0.15)',   color: '#eab308', border: 'rgba(234,179,8,0.3)'  },
  Other: { bg: 'rgba(148,163,184,0.15)', color: '#94a3b8', border: 'rgba(148,163,184,0.3)'},
};

const CARD_GRADIENTS = [
  'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
  'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
  'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
  'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
  'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)',
];

const Home = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [loading, setLoading] = useState(true);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState('');

  useEffect(() => {
    fetchEvents();
  }, [activeCategory]);

  const fetchEvents = async (query = '') => {
    setLoading(true);
    try {
      const data = await api.searchEvents(query || search, activeCategory);
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

  const handleCategoryChange = (cat) => {
    setActiveCategory(cat);
    setSearch('');
  };

  const handleUseMyLocation = () => {
    setLocationError('');
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser.');
      return;
    }
    setLocationLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocationLoading(false);
        navigate(`/nearby?lat=${pos.coords.latitude}&lng=${pos.coords.longitude}`);
      },
      () => {
        setLocationLoading(false);
        setLocationError('Unable to get your location. Please allow location access and try again.');
      }
    );
  };

  const getLowestPrice = (ticketCategories) => {
    if (!ticketCategories || ticketCategories.length === 0) return null;
    return Math.min(...ticketCategories.map(cat => cat.price));
  };

  const getTotalAvailable = (ticketCategories) => {
    if (!ticketCategories || ticketCategories.length === 0) return 0;
    return ticketCategories.reduce((sum, cat) => sum + cat.totalAvailable, 0);
  };

  const getAverageRating = (reviews) => {
    if (!reviews || reviews.length === 0) return null;
    return (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1);
  };

  const catColor = (cat) => CATEGORY_COLORS[cat] || CATEGORY_COLORS['Other'];

  return (
    <div className="animate-fade-in">
      {/* Hero Section */}
      <div style={{ textAlign: 'center', marginBottom: '3rem', paddingTop: '2rem' }}>
        <h1 style={{ fontSize: '3rem', marginBottom: '1rem', color: 'var(--text-main)' }}>
          Find Your Next Experience
        </h1>
        <p style={{ fontSize: '1.25rem', color: 'var(--text-muted)', maxWidth: '600px', margin: '0 auto 2rem' }}>
          Discover and book the best events happening around you. From tech conferences to music festivals.
        </p>

        {/* Search Bar */}
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '0.5rem', maxWidth: '560px', margin: '0 auto 1rem' }}>
          <div style={{ position: 'relative', flexGrow: 1 }}>
            <Search style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} size={20} />
            <input
              type="text"
              placeholder="Search events by title..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ width: '100%', paddingLeft: '3rem' }}
            />
          </div>
          <button type="submit" className="btn btn-primary">Search</button>
        </form>

        {/* Near Me Button */}
        <div style={{ display: 'flex', justifyContent: 'center', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
          <button
            id="use-my-location-btn"
            onClick={handleUseMyLocation}
            disabled={locationLoading}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.5rem',
              padding: '0.6rem 1.25rem', borderRadius: '999px',
              border: '1px solid var(--primary-color)', color: 'var(--primary-color)',
              background: 'rgba(99,102,241,0.08)', cursor: 'pointer',
              fontSize: '0.9rem', fontWeight: '500', transition: 'all 0.2s ease',
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(99,102,241,0.18)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(99,102,241,0.08)'}
          >
            <Navigation size={16} />
            {locationLoading ? 'Getting location...' : 'Events Near Me'}
          </button>
          {locationError && <p style={{ color: 'var(--danger-color)', fontSize: '0.85rem' }}>{locationError}</p>}
        </div>
      </div>

      {/* Category Filter Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '2rem', justifyContent: 'center' }}>
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            id={`category-tab-${cat.toLowerCase()}`}
            onClick={() => handleCategoryChange(cat)}
            style={{
              padding: '0.45rem 1.1rem',
              borderRadius: '999px',
              border: activeCategory === cat
                ? `1.5px solid var(--primary-color)`
                : '1.5px solid var(--border-color)',
              background: activeCategory === cat ? 'var(--primary-color)' : 'transparent',
              color: activeCategory === cat ? '#fff' : 'var(--text-muted)',
              cursor: 'pointer', fontSize: '0.875rem', fontWeight: '500',
              display: 'flex', alignItems: 'center', gap: '0.35rem',
              transition: 'all 0.2s ease',
            }}
          >
            {cat !== 'All' && <Tag size={13} />}
            {cat}
          </button>
        ))}
      </div>

      {/* Events Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>Loading events...</div>
      ) : events.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
          No events found. Try a different search or category.
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '2rem' }}>
          {events.map((event, idx) => {
            const lowestPrice = getLowestPrice(event.ticketCategories);
            const totalAvailable = getTotalAvailable(event.ticketCategories);
            const avgRating = getAverageRating(event.reviews);
            const gradient = CARD_GRADIENTS[idx % CARD_GRADIENTS.length];
            const cc = event.category ? catColor(event.category) : null;

            return (
              <div key={event.id} className="card card-hover" style={{ display: 'flex', flexDirection: 'column', padding: 0, overflow: 'hidden', position: 'relative' }}>
                {/* Sold Out Overlay */}
                {totalAvailable === 0 && event.ticketCategories?.length > 0 && (
                  <div style={{
                    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.55)', zIndex: 2,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    borderRadius: '1rem',
                    pointerEvents: 'none',
                  }}>
                    <span style={{
                      background: '#ef4444', color: '#fff', fontWeight: '700',
                      fontSize: '1.1rem', padding: '0.5rem 1.5rem', borderRadius: '999px',
                      letterSpacing: '0.05em', textTransform: 'uppercase',
                    }}>Sold Out</span>
                  </div>
                )}
                {/* Card Banner */}
                <div style={{ height: '180px', background: gradient, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                  <Calendar size={52} style={{ color: 'rgba(255,255,255,0.5)' }} />
                  {/* Category badge */}
                  {event.category && (
                    <span style={{
                      position: 'absolute', top: '1rem', left: '1rem',
                      padding: '0.25rem 0.75rem', borderRadius: '999px', fontSize: '0.75rem',
                      fontWeight: '600', background: cc.bg, color: cc.color, border: `1px solid ${cc.border}`,
                      backdropFilter: 'blur(4px)',
                    }}>
                      {event.category}
                    </span>
                  )}
                  {/* Rating badge */}
                  {avgRating && (
                    <span style={{
                      position: 'absolute', top: '1rem', right: '1rem',
                      padding: '0.25rem 0.6rem', borderRadius: '999px', fontSize: '0.75rem',
                      fontWeight: '600', background: 'rgba(234,179,8,0.2)', color: '#eab308',
                      border: '1px solid rgba(234,179,8,0.4)', display: 'flex', alignItems: 'center', gap: '0.25rem'
                    }}>
                      <Star size={11} fill="#eab308" /> {avgRating}
                    </span>
                  )}
                </div>

                {/* Card Body */}
                <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                  <h3 style={{ fontSize: '1.15rem', marginBottom: '0.5rem' }}>{event.title}</h3>
                  <p style={{ color: 'var(--text-muted)', marginBottom: '1rem', flexGrow: 1, fontSize: '0.9rem', lineHeight: 1.5 }}>
                    {event.description?.length > 90 ? event.description.slice(0, 90) + '…' : event.description}
                  </p>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', marginBottom: '1.25rem', fontSize: '0.8rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)' }}>
                      <Calendar size={14} />
                      {event.dateTime ? new Date(event.dateTime).toLocaleString() : 'Date TBD'}
                    </div>
                    {totalAvailable > 0 && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)' }}>
                        <DollarSign size={14} />
                        {totalAvailable} tickets available
                      </div>
                    )}
                    {event.reviews?.length > 0 && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#eab308' }}>
                        <Star size={13} fill="#eab308" />
                        {avgRating} · {event.reviews.length} review{event.reviews.length !== 1 ? 's' : ''}
                      </div>
                    )}
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
                    <span style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--primary-color)' }}>
                      {lowestPrice !== null ? (lowestPrice === 0 ? 'Free' : `From $${lowestPrice}`) : 'TBD'}
                    </span>
                    <Link to={`/events/${event.id}`} className="btn btn-outline" style={{ padding: '0.45rem 1rem', fontSize: '0.875rem' }}>
                      {totalAvailable === 0 && event.ticketCategories?.length > 0 ? 'View Details' : 'View Details'}
                    </Link>
                  </div>
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
