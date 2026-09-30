import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Calendar, User, LogOut, Settings, Navigation, ShieldCheck, Menu, X } from 'lucide-react';

const Navbar = ({ user, logout }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  // Close mobile menu on route change
  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    if (menuOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [menuOpen]);

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

  const mobileLinkStyle = {
    ...linkStyle,
    padding: '0.75rem 1rem',
    borderRadius: '0.5rem',
    width: '100%',
    fontSize: '0.95rem',
    transition: 'all 0.2s ease',
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
        <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.9rem 0' }} ref={menuRef}>
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
          <div className="nav-links-desktop" style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
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

          {/* Mobile Hamburger Button */}
          <button
            className="mobile-menu-btn"
            onClick={() => setMenuOpen(!menuOpen)}
            style={{
              display: 'none', background: 'none', border: '1px solid var(--border-color)',
              color: 'var(--text-main)', padding: '0.4rem', borderRadius: '0.4rem',
              cursor: 'pointer', transition: 'all 0.2s',
            }}
            aria-label="Toggle menu"
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>

          {/* Mobile Menu Overlay */}
          {menuOpen && (
            <div
              className="mobile-menu-overlay"
              style={{
                position: 'fixed', top: '60px', left: 0, right: 0, bottom: 0,
                backgroundColor: 'rgba(0,0,0,0.5)',
                zIndex: 98,
              }}
              onClick={() => setMenuOpen(false)}
            />
          )}

          {/* Mobile Slide Menu */}
          <div
            className="mobile-menu"
            style={{
              position: 'fixed', top: '60px', right: 0, bottom: 0,
              width: '280px', maxWidth: '85vw',
              backgroundColor: 'var(--surface-color)',
              borderLeft: '1px solid var(--border-color)',
              transform: menuOpen ? 'translateX(0)' : 'translateX(100%)',
              transition: 'transform 0.3s ease',
              zIndex: 99,
              padding: '1.5rem 1rem',
              display: 'flex', flexDirection: 'column', gap: '0.25rem',
              overflowY: 'auto',
            }}
          >
            <Link to="/" style={mobileLinkStyle}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >Browse Events</Link>
            <Link to="/nearby" style={mobileLinkStyle}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <Navigation size={16} /> Events Near Me
            </Link>

            <div style={{ height: '1px', background: 'var(--border-color)', margin: '0.5rem 0' }} />

            {user ? (
              <>
                {isAdmin && (
                  <Link to="/admin" style={{ ...mobileLinkStyle, color: '#f59e0b' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(245,158,11,0.1)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <ShieldCheck size={16} /> Admin Panel
                  </Link>
                )}
                <Link to="/manage" style={mobileLinkStyle}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <Settings size={16} /> Manage Events
                </Link>
                <Link to="/dashboard" style={mobileLinkStyle}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >Dashboard</Link>
                <Link to="/profile" style={mobileLinkStyle}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <User size={16} /> {user.name || user.email}
                </Link>

                <div style={{ height: '1px', background: 'var(--border-color)', margin: '0.5rem 0' }} />

                <button
                  onClick={handleLogout}
                  style={{
                    ...mobileLinkStyle,
                    border: '1px solid rgba(239,68,68,0.3)',
                    color: '#ef4444',
                    background: 'rgba(239,68,68,0.07)',
                    cursor: 'pointer',
                    justifyContent: 'center',
                    marginTop: '0.5rem',
                  }}
                >
                  <LogOut size={16} /> Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" style={mobileLinkStyle}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >Login</Link>
                <Link to="/register" className="btn btn-primary" style={{ width: '100%', marginTop: '0.5rem', justifyContent: 'center' }}>
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
