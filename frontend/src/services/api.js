const API_BASE_URL = 'http://localhost:8080/api';

const request = async (endpoint, options = {}) => {
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorData = await response.text();
    throw new Error(errorData || 'An error occurred while fetching data');
  }

  // Handle empty responses
  const text = await response.text();
  return text ? JSON.parse(text) : null;
};

export const api = {
  // Auth
  login: (credentials) => request('/auth/login', { method: 'POST', body: JSON.stringify(credentials) }),
  register: (userData) => request('/auth/register', { method: 'POST', body: JSON.stringify(userData) }),

  // Events
  getEvents: () => request('/events', { method: 'GET' }),
  searchEvents: (title) => request(`/events/search?title=${title}`, { method: 'GET' }),
  getEventById: (id) => request(`/events/${id}`, { method: 'GET' }),

  // Bookings
  holdSeats: (bookingData) => request('/bookings/hold', { method: 'POST', body: JSON.stringify(bookingData) }),
  getMyBookings: () => request('/bookings/my-bookings', { method: 'GET' }),

  // Venues
  getVenues: () => request('/venues', { method: 'GET' }),

  // Payments
  processMockPayment: (bookingId) => request(`/payments/${bookingId}/mock`, { method: 'POST' }),
};
