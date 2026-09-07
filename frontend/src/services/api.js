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

  // Read the body text once
  const text = await response.text();

  if (!response.ok) {
    // Try to parse the error as JSON, otherwise use the text
    let errorMessage;
    try {
      const errorData = JSON.parse(text);
      errorMessage = errorData.message || errorData.error || text;
    } catch {
      errorMessage = text || 'An error occurred while fetching data';
    }
    throw new Error(errorMessage);
  }

  // Handle empty responses
  if (!text) return null;
  
  // Try to parse as JSON, return raw text if not JSON
  try {
    return JSON.parse(text);
  } catch {
    return { message: text };
  }
};

export const api = {
  // Auth
  login: (credentials) => request('/auth/login', { method: 'POST', body: JSON.stringify(credentials) }),
  register: (userData) => request('/auth/register', { method: 'POST', body: JSON.stringify(userData) }),

  // Events
  getEvents: () => request('/events', { method: 'GET' }),
  searchEvents: (title) => request(`/events/search?title=${encodeURIComponent(title)}`, { method: 'GET' }),
  getEventById: (id) => request(`/events/${id}`, { method: 'GET' }),
  createEvent: (eventData) => request('/events', { method: 'POST', body: JSON.stringify(eventData) }),
  updateEvent: (id, eventData) => request(`/events/${id}`, { method: 'PUT', body: JSON.stringify(eventData) }),
  deleteEvent: (id) => request(`/events/${id}`, { method: 'DELETE' }),

  // Bookings
  holdSeats: (bookingData) => request('/bookings/hold', { method: 'POST', body: JSON.stringify(bookingData) }),
  getMyBookings: () => request('/bookings/my-bookings', { method: 'GET' }),

  // Venues
  getVenues: () => request('/venues', { method: 'GET' }),
  createVenue: (venueData) => request('/venues', { method: 'POST', body: JSON.stringify(venueData) }),
  updateVenue: (id, venueData) => request(`/venues/${id}`, { method: 'PUT', body: JSON.stringify(venueData) }),
  deleteVenue: (id) => request(`/venues/${id}`, { method: 'DELETE' }),

  // Payments
  processMockPayment: (bookingId) => request(`/payments/${bookingId}/mock`, { method: 'POST' }),
};
