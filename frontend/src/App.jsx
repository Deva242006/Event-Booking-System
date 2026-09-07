import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import EventDetails from './pages/EventDetails';
import Dashboard from './pages/Dashboard';

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded = jwtDecode(token);
        // Usually, JWTs expire. You could add an expiration check here.
        if (decoded.exp * 1000 < Date.now()) {
          localStorage.removeItem('token');
          setUser(null);
        } else {
          setUser({ id: decoded.sub, email: decoded.sub, name: decoded.name || 'User' }); 
        }
      } catch (error) {
        localStorage.removeItem('token');
      }
    }
  }, []);

  const login = (token, userInfo) => {
    localStorage.setItem('token', token);
    setUser(userInfo);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <Router>
      <div className="app">
        <Navbar user={user} logout={logout} />
        <main className="container animate-fade-in">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={!user ? <Login login={login} /> : <Navigate to="/" />} />
            <Route path="/register" element={!user ? <Register /> : <Navigate to="/" />} />
            <Route path="/events/:id" element={<EventDetails user={user} />} />
            <Route path="/dashboard" element={user ? <Dashboard user={user} /> : <Navigate to="/login" />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
