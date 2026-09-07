import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Calendar, User, LogOut } from 'lucide-react';

const Navbar = ({ user, logout }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header style={{ backgroundColor: 'var(--surface-color)' }}>
      <div className="container">
        <nav className="navbar">
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-main)', fontSize: '1.25rem', fontWeight: 'bold' }}>
            <Calendar className="text-primary-color" style={{ color: 'var(--primary-color)' }} />
            <span>EventBook</span>
          </Link>
          
          <div className="nav-links">
            <Link to="/" style={{ color: 'var(--text-muted)' }}>Browse Events</Link>
            
            {user ? (
              <>
                <Link to="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--text-muted)' }}>
                  <User size={18} />
                  Dashboard
                </Link>
                <button onClick={handleLogout} className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', padding: '0.5rem 1rem' }}>
                  <LogOut size={18} />
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" style={{ color: 'var(--text-muted)' }}>Login</Link>
                <Link to="/register" className="btn btn-primary" style={{ padding: '0.5rem 1rem' }}>Sign Up</Link>
              </>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
