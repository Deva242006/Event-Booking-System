import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, ExternalLink, Mail, Heart, MapPin, Ticket, Shield } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const linkStyle = {
    color: 'var(--text-muted)',
    fontSize: '0.85rem',
    textDecoration: 'none',
    transition: 'color 0.2s ease',
    display: 'flex',
    alignItems: 'center',
    gap: '0.35rem',
  };

  return (
    <footer style={{
      borderTop: '1px solid var(--border-color)',
      backgroundColor: 'var(--surface-color)',
      marginTop: '4rem',
    }}>
      <div className="container" style={{ padding: '3rem 1.5rem 1.5rem' }}>
        {/* Top Section */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '2rem',
          marginBottom: '2.5rem',
        }}>
          {/* Brand */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
              <Calendar size={20} style={{ color: 'var(--primary-color)' }} />
              <span style={{
                fontSize: '1.15rem', fontWeight: '700',
                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              }}>
                EventBook
              </span>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', lineHeight: 1.6, maxWidth: '280px' }}>
              Discover and book the best events happening around you. From tech conferences to music festivals — all in one place.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 style={{ fontSize: '0.85rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-main)', marginBottom: '1rem' }}>
              Quick Links
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              <Link to="/" style={linkStyle}><Ticket size={14} /> Browse Events</Link>
              <Link to="/nearby" style={linkStyle}><MapPin size={14} /> Events Near Me</Link>
              <Link to="/dashboard" style={linkStyle}><Calendar size={14} /> My Bookings</Link>
              <Link to="/profile" style={linkStyle}><Shield size={14} /> My Profile</Link>
            </div>
          </div>

          {/* Resources */}
          <div>
            <h4 style={{ fontSize: '0.85rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-main)', marginBottom: '1rem' }}>
              For Organizers
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              <Link to="/manage" style={linkStyle}>Create an Event</Link>
              <Link to="/manage" style={linkStyle}>Manage Venues</Link>
              <Link to="/register" style={linkStyle}>Become an Organizer</Link>
            </div>
          </div>

          {/* Connect */}
          <div>
            <h4 style={{ fontSize: '0.85rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-main)', marginBottom: '1rem' }}>
              Connect
            </h4>
            <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem' }}>
              {[
                { Icon: ExternalLink, href: 'https://github.com/Deva242006/Event-Booking-System', label: 'GitHub' },
                { Icon: ExternalLink, href: '#', label: 'Twitter' },
                { Icon: Mail, href: 'mailto:support@eventbook.com', label: 'Email' },
              ].map(({ Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  title={label}
                  style={{
                    width: '36px', height: '36px', borderRadius: '0.5rem',
                    background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'var(--primary-color)', transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = 'rgba(99,102,241,0.2)';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = 'rgba(99,102,241,0.1)';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  <Icon size={16} />
                </a>
              ))}
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
              support@eventbook.com
            </p>
          </div>
        </div>

        {/* Bottom Bar */}
        <div style={{
          borderTop: '1px solid var(--border-color)',
          paddingTop: '1.25rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '0.75rem',
        }}>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
            © {currentYear} EventBook. All rights reserved.
          </p>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            Made with <Heart size={12} fill="#f43f5e" color="#f43f5e" /> by Deva
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
