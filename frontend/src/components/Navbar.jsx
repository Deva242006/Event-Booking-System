import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Calendar, User, LogOut, Settings, Navigation, ShieldCheck, Menu, X } from 'lucide-react';

const Navbar = ({ user, logout }) => {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setMenuOpen(false);
  };

  const isAdmin = user?.role === 'ROLE_ADMIN';

  const linkStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '0.3rem',
    color: 'var(--text-muted)',
    fontSize: '0.9rem',
    fontWeight: '500',
    transition: 'color 0.2s ease',
    textDecoration: 'none',
  };

  return (
    <header style={{
      backgroundColor: 'var(--surface-color)',
      borderBottom: '1px solid var(--border-color)',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      backdropFilter: 'blur(12px)',
    }}>
      <div className="container">
        <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.9rem 0' }}>
          {/* Logo */}
          <Link to="/" style={{
            display: 'flex', alignItems: 'center', gap: '0.5rem',
            color: 'var(--text-main)', fontSize: '1.2rem', fontWeight: '700', textDecoration: 'none',
          }}>
            <Calendar style={{ color: 'var(--primary-color)' }} size={22} />
            <span style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              EventBook
            </span>
          </Link>

          {/* Desktop Nav Links */}
          <div className="nav-links" style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
            <Link to="/" style={linkStyle}>Browse Events</Link>
            <Link to="/nearby" style={{ ...linkStyle }}>
              <Navigation size={15} /> Near Me
            </Link>

            {user ? (
              <>
                {isAdmin && (
                  <Link to="/admin" style={{ ...linkStyle, color: '#f59e0b' }}>
                    <ShieldCheck size={16} /> Admin
                  </Link>
                )}
                <Link to="/manage" style={linkStyle}>
                  <Settings size={16} /> Manage
                </Link>
                <Link to="/profile" style={linkStyle}>
                  <User size={16} />
                  <span style={{ maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {user.name || user.email}
                  </span>
                </Link>
                <Link to="/dashboard" style={linkStyle}>Dashboard</Link>
                <button
                  id="logout-btn"
                  onClick={handleLogout}
                  className="btn btn-outline"
                  style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', padding: '0.45rem 0.9rem', fontSize: '0.875rem' }}
                >
                  <LogOut size={16} /> Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" style={linkStyle}>Login</Link>
                <Link to="/register" className="btn btn-primary" style={{ padding: '0.5rem 1.1rem', fontSize: '0.875rem' }}>
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
