import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Link, Navigate } from 'react-router-dom';
import {
  ShieldCheck, Users, Calendar, Ticket, DollarSign,
  CheckCircle, Clock, XCircle, TrendingUp, ArrowRight,
} from 'lucide-react';

const StatCard = ({ icon, label, value, color, sub }) => (
  <div className="card" style={{ textAlign: 'center', padding: '1.5rem 1.25rem' }}>
    <div style={{ fontSize: '2.25rem', marginBottom: '0.5rem' }}>{icon}</div>
    <div style={{ fontSize: '2rem', fontWeight: '800', color, marginBottom: '0.2rem' }}>{value}</div>
    <div style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-main)', marginBottom: '0.1rem' }}>{label}</div>
    {sub && <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{sub}</div>}
  </div>
);

const AdminPanel = ({ user }) => {
  const [stats, setStats] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [events, setEvents] = useState([]);
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingBookings, setLoadingBookings] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  const isAdmin = user?.role === 'ROLE_ADMIN';
  if (!isAdmin) return <Navigate to="/" />;

  useEffect(() => {
    api.getAdminStats()
      .then(setStats)
      .catch(console.error)
      .finally(() => setLoadingStats(false));

    api.getAllBookings()
      .then(data => setBookings(data || []))
      .catch(console.error)
      .finally(() => setLoadingBookings(false));

    api.getEvents()
      .then(data => setEvents(data || []))
      .catch(console.error);
  }, []);

  const tabStyle = (active) => ({
    padding: '0.65rem 1.25rem', border: 'none', cursor: 'pointer',
    borderBottom: active ? '2px solid var(--primary-color)' : '2px solid transparent',
    backgroundColor: 'transparent', fontFamily: 'inherit',
    color: active ? 'var(--primary-color)' : 'var(--text-muted)',
    fontWeight: active ? '600' : '400', fontSize: '0.95rem', transition: 'all 0.2s',
  });

  const statusIcon = (status) => ({
    CONFIRMED: <CheckCircle size={14} style={{ color: '#10b981' }} />,
    PENDING: <Clock size={14} style={{ color: '#f59e0b' }} />,
    CANCELLED: <XCircle size={14} style={{ color: '#64748b' }} />,
  }[status] || null);

  return (
    <div className="animate-fade-in" style={{ padding: '2rem 0' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2.5rem' }}>
        <div style={{
          width: '52px', height: '52px', borderRadius: '12px',
          background: 'linear-gradient(135deg, #f59e0b, #ef4444)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}>
          <ShieldCheck size={26} style={{ color: '#fff' }} />
        </div>
        <div>
          <h1 style={{ fontSize: '1.75rem', marginBottom: '0.2rem' }}>Admin Panel</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            System overview and management — logged in as <strong>{user.name}</strong>
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid var(--border-color)', marginBottom: '2rem' }}>
        <button style={tabStyle(activeTab === 'overview')} onClick={() => setActiveTab('overview')}>📊 Overview</button>
        <button style={tabStyle(activeTab === 'bookings')} onClick={() => setActiveTab('bookings')}>🎟️ All Bookings</button>
        <button style={tabStyle(activeTab === 'events')} onClick={() => setActiveTab('events')}>📅 All Events</button>
      </div>

      {/* ── OVERVIEW TAB ── */}
      {activeTab === 'overview' && (
        loadingStats ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>Loading stats…</div>
        ) : stats ? (
          <div>
            {/* Stats Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem', marginBottom: '2.5rem' }}>
              <StatCard icon="🗓️" label="Total Events" value={stats.totalEvents} color="#6366f1" />
              <StatCard icon="👥" label="Total Users" value={stats.totalUsers} color="#3b82f6" />
              <StatCard icon="🎟️" label="Total Bookings" value={stats.totalBookings} color="#8b5cf6" />
              <StatCard icon="✅" label="Confirmed" value={stats.confirmedBookings} color="#10b981" />
              <StatCard icon="⏳" label="Pending" value={stats.pendingBookings} color="#f59e0b" />
              <StatCard icon="❌" label="Cancelled" value={stats.cancelledBookings} color="#ef4444" />
              <StatCard
                icon="💰"
                label="Total Revenue"
                value={`$${Number(stats.totalRevenue || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
                color="#10b981"
                sub="From confirmed bookings"
              />
            </div>

            {/* Conversion Rate */}
            {stats.totalBookings > 0 && (
              <div className="card" style={{ marginBottom: '2rem' }}>
                <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <TrendingUp size={18} style={{ color: 'var(--primary-color)' }} /> Booking Conversion
                </h3>
                <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
                  {['Confirmed', 'Pending', 'Cancelled'].map((label, i) => {
                    const counts = [stats.confirmedBookings, stats.pendingBookings, stats.cancelledBookings];
                    const pct = ((counts[i] / stats.totalBookings) * 100).toFixed(1);
                    const colors = ['#10b981', '#f59e0b', '#ef4444'];
                    return (
                      <div key={label}>
                        <div style={{ fontSize: '1.5rem', fontWeight: '700', color: colors[i] }}>{pct}%</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{label}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Quick Actions */}
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <button onClick={() => setActiveTab('bookings')} className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                View All Bookings <ArrowRight size={16} />
              </button>
              <Link to="/manage" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                Manage Events <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        ) : (
          <div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '3rem' }}>Failed to load stats.</div>
        )
      )}

      {/* ── ALL BOOKINGS TAB ── */}
      {activeTab === 'bookings' && (
        loadingBookings ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>Loading bookings…</div>
        ) : (
          <div>
            <h2 style={{ fontSize: '1.15rem', marginBottom: '1.25rem' }}>All Bookings ({bookings.length})</h2>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                    {['Booking ID', 'Event ID', 'User ID', 'Category', 'Qty', 'Total', 'Status', 'Date'].map(h => (
                      <th key={h} style={{ padding: '0.6rem 0.75rem', textAlign: 'left', color: 'var(--text-muted)', fontWeight: '600', whiteSpace: 'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {bookings.map(b => (
                    <tr key={b.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                      <td style={{ padding: '0.6rem 0.75rem', fontFamily: 'monospace', fontSize: '0.75rem', color: 'var(--text-muted)' }}>{b.id?.slice(-8)}…</td>
                      <td style={{ padding: '0.6rem 0.75rem', fontFamily: 'monospace', fontSize: '0.75rem', color: 'var(--text-muted)' }}>{b.eventId?.slice(-8)}…</td>
                      <td style={{ padding: '0.6rem 0.75rem', fontFamily: 'monospace', fontSize: '0.75rem', color: 'var(--text-muted)' }}>{b.userId?.slice(-8)}…</td>
                      <td style={{ padding: '0.6rem 0.75rem' }}>{b.ticketCategoryName}</td>
                      <td style={{ padding: '0.6rem 0.75rem', textAlign: 'center' }}>{b.quantity}</td>
                      <td style={{ padding: '0.6rem 0.75rem', color: '#10b981', fontWeight: '600' }}>${b.totalAmount}</td>
                      <td style={{ padding: '0.6rem 0.75rem' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                          {statusIcon(b.status)} {b.status}
                        </span>
                      </td>
                      <td style={{ padding: '0.6rem 0.75rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                        {b.bookingTime ? new Date(b.bookingTime).toLocaleDateString() : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {bookings.length === 0 && (
                <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>No bookings yet.</div>
              )}
            </div>
          </div>
        )
      )}

      {/* ── ALL EVENTS TAB ── */}
      {activeTab === 'events' && (
        <div>
          <h2 style={{ fontSize: '1.15rem', marginBottom: '1.25rem' }}>All Events ({events.length})</h2>
          <div style={{ display: 'grid', gap: '0.75rem' }}>
            {events.map(event => {
              const totalTickets = event.ticketCategories?.reduce((s, c) => s + c.totalAvailable, 0) || 0;
              return (
                <div key={event.id} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '1rem 1.25rem', border: '1px solid var(--border-color)',
                  borderRadius: '0.75rem', background: 'var(--bg-color)', gap: '1rem', flexWrap: 'wrap',
                }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: '600', marginBottom: '0.2rem' }}>{event.title}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                      {event.category && <span style={{ color: 'var(--primary-color)' }}>{event.category}</span>}
                      {event.dateTime && <span><Calendar size={12} style={{ display: 'inline', marginRight: '0.2rem' }} />{new Date(event.dateTime).toLocaleDateString()}</span>}
                      <span><Ticket size={12} style={{ display: 'inline', marginRight: '0.2rem' }} />{totalTickets} tickets left</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <Link to={`/events/${event.id}`} className="btn btn-outline" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}>
                      View
                    </Link>
                  </div>
                </div>
              );
            })}
            {events.length === 0 && (
              <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>No events yet.</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
