import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Link } from 'react-router-dom';
import { User, Mail, Shield, Heart, Calendar, Star, ExternalLink } from 'lucide-react';

const Profile = ({ user }) => {
  const [wishlist, setWishlist] = useState([]);
  const [loadingWishlist, setLoadingWishlist] = useState(true);
  const [removingId, setRemovingId] = useState(null);

  useEffect(() => {
    fetchWishlist();
  }, []);

  const fetchWishlist = async () => {
    setLoadingWishlist(true);
    try {
      const data = await api.getWishlist();
      setWishlist(data || []);
    } catch (err) {
      console.error('Failed to load wishlist:', err);
    } finally {
      setLoadingWishlist(false);
    }
  };

  const handleRemoveFromWishlist = async (eventId) => {
    setRemovingId(eventId);
    try {
      await api.toggleWishlist(eventId);
      setWishlist(prev => prev.filter(e => e.id !== eventId));
    } catch (err) {
      console.error('Failed to toggle wishlist:', err);
    } finally {
      setRemovingId(null);
    }
  };

  const getAverageRating = (reviews) => {
    if (!reviews?.length) return null;
    return (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1);
  };

  const roleBadgeStyle = (role) => {
    const isAdmin = role === 'ROLE_ADMIN';
    return {
      display: 'inline-flex', alignItems: 'center', gap: '0.35rem',
      padding: '0.3rem 0.8rem', borderRadius: '999px', fontSize: '0.8rem', fontWeight: '600',
      background: isAdmin ? 'rgba(245,158,11,0.15)' : 'rgba(99,102,241,0.15)',
      color: isAdmin ? '#f59e0b' : '#6366f1',
      border: `1px solid ${isAdmin ? 'rgba(245,158,11,0.3)' : 'rgba(99,102,241,0.3)'}`,
    };
  };

  return (
    <div className="animate-fade-in" style={{ padding: '2rem 0', maxWidth: '900px', margin: '0 auto' }}>
      {/* Profile Header Card */}
      <div className="card" style={{ marginBottom: '2rem', background: 'linear-gradient(135deg, rgba(99,102,241,0.15) 0%, rgba(139,92,246,0.1) 100%)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
          {/* Avatar */}
          <div style={{
            width: '80px', height: '80px', borderRadius: '50%',
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '2rem', fontWeight: '700', color: '#fff', flexShrink: 0,
          }}>
            {user.name ? user.name[0].toUpperCase() : '?'}
          </div>

          {/* Info */}
          <div style={{ flex: 1 }}>
            <h1 style={{ fontSize: '1.75rem', marginBottom: '0.35rem' }}>{user.name}</h1>
            <div style={{ display: 'flex', gap: '1.25rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                <Mail size={15} /> {user.email}
              </span>
              <span style={roleBadgeStyle(user.role)}>
                <Shield size={13} />
                {user.role === 'ROLE_ADMIN' ? 'Administrator' : 'Member'}
              </span>
            </div>
            {user.id && (
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                ID: {user.id}
              </p>
            )}
          </div>

          {/* Quick links */}
          <div style={{ display: 'flex', gap: '0.75rem', flexShrink: 0 }}>
            <Link to="/dashboard" className="btn btn-primary" style={{ padding: '0.5rem 1.1rem', fontSize: '0.875rem' }}>
              My Bookings
            </Link>
          </div>
        </div>
      </div>

      {/* Saved Events / Wishlist */}
      <div className="card">
        <h2 style={{ fontSize: '1.2rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Heart size={20} style={{ color: '#f43f5e' }} fill="#f43f5e" />
          Saved Events ({loadingWishlist ? '…' : wishlist.length})
        </h2>

        {loadingWishlist ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>Loading your saved events…</div>
        ) : wishlist.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--text-muted)' }}>
            <Heart size={48} style={{ marginBottom: '1rem', opacity: 0.3 }} />
            <p style={{ marginBottom: '1rem' }}>You haven't saved any events yet.</p>
            <Link to="/" className="btn btn-primary">Browse Events</Link>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '1rem' }}>
            {wishlist.map(event => {
              const avgRating = getAverageRating(event.reviews);
              const lowestPrice = event.ticketCategories?.length > 0
                ? Math.min(...event.ticketCategories.map(c => c.price))
                : null;

              return (
                <div key={event.id} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  gap: '1rem', padding: '1rem 1.25rem',
                  border: '1px solid var(--border-color)', borderRadius: '0.75rem',
                  background: 'var(--bg-color)', flexWrap: 'wrap',
                }}>
                  <div style={{ flex: 1, minWidth: '180px' }}>
                    <h3 style={{ fontSize: '1rem', marginBottom: '0.3rem' }}>{event.title}</h3>
                    <div style={{ display: 'flex', gap: '1rem', fontSize: '0.8rem', color: 'var(--text-muted)', flexWrap: 'wrap' }}>
                      {event.dateTime && (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                          <Calendar size={12} /> {new Date(event.dateTime).toLocaleDateString()}
                        </span>
                      )}
                      {event.category && (
                        <span style={{ color: 'var(--primary-color)', fontWeight: '500' }}>{event.category}</span>
                      )}
                      {avgRating && (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', color: '#eab308' }}>
                          <Star size={11} fill="#eab308" /> {avgRating}
                        </span>
                      )}
                      {lowestPrice !== null && (
                        <span style={{ color: 'var(--primary-color)', fontWeight: '600' }}>
                          {lowestPrice === 0 ? 'Free' : `From $${lowestPrice}`}
                        </span>
                      )}
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
                    <Link
                      to={`/events/${event.id}`}
                      className="btn btn-outline"
                      style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
                    >
                      <ExternalLink size={13} /> View
                    </Link>
                    <button
                      onClick={() => handleRemoveFromWishlist(event.id)}
                      disabled={removingId === event.id}
                      style={{
                        padding: '0.4rem 0.8rem', borderRadius: '0.5rem', fontSize: '0.8rem',
                        display: 'flex', alignItems: 'center', gap: '0.3rem',
                        background: 'rgba(244,63,94,0.1)', border: '1px solid rgba(244,63,94,0.3)',
                        color: '#f43f5e', cursor: 'pointer',
                      }}
                    >
                      <Heart size={13} fill="#f43f5e" />
                      {removingId === event.id ? 'Removing…' : 'Unsave'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
