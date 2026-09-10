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
    let errorMessage;
    try {
      const errorData = JSON.parse(text);
      errorMessage = errorData.message || errorData.error || text;
    } catch {
      errorMessage = text || 'An error occurred while fetching data';
    }
    throw new Error(errorMessage);
  }

  if (!text) return null;

  try {
    return JSON.parse(text);
  } catch {
    return { message: text };
  }
};

export const api = {
  // ── Auth ──────────────────────────────────────────────────────────────────
  login: (credentials) => request('/auth/login', { method: 'POST', body: JSON.stringify(credentials) }),
  register: (userData) => request('/auth/register', { method: 'POST', body: JSON.stringify(userData) }),
  /** Get the currently authenticated user's profile */
  getMe: () => request('/auth/me', { method: 'GET' }),

  // ── Events ────────────────────────────────────────────────────────────────
  getEvents: () => request('/events', { method: 'GET' }),
  getUpcomingEvents: () => request('/events/upcoming', { method: 'GET' }),
  searchEvents: (title, category) => {
    const params = new URLSearchParams();
    if (title) params.append('title', title);
    if (category && category !== 'All') params.append('category', category);
    return request(`/events/search?${params.toString()}`, { method: 'GET' });
  },
  getEventById: (id) => request(`/events/${id}`, { method: 'GET' }),
  createEvent: (eventData) => request('/events', { method: 'POST', body: JSON.stringify(eventData) }),
  updateEvent: (id, eventData) => request(`/events/${id}`, { method: 'PUT', body: JSON.stringify(eventData) }),
  deleteEvent: (id) => request(`/events/${id}`, { method: 'DELETE' }),

  // ── Nearby Events ─────────────────────────────────────────────────────────
  getNearbyEvents: (lat, lng, radiusKm = 10) =>
    request(`/events/nearby?lat=${lat}&lng=${lng}&radiusKm=${radiusKm}`, { method: 'GET' }),

  // ── Wishlist ──────────────────────────────────────────────────────────────
  toggleWishlist: (eventId) => request(`/events/${eventId}/wishlist`, { method: 'POST' }),
  getWishlist: () => request('/events/wishlist', { method: 'GET' }),

  // ── Reviews ───────────────────────────────────────────────────────────────
  addReview: (eventId, reviewData) =>
    request(`/events/${eventId}/reviews`, { method: 'POST', body: JSON.stringify(reviewData) }),

  // ── Bookings ──────────────────────────────────────────────────────────────
  holdSeats: (bookingData) => request('/bookings/hold', { method: 'POST', body: JSON.stringify(bookingData) }),
  getMyBookings: () => request('/bookings/my-bookings', { method: 'GET' }),
  getBookingById: (id) => request(`/bookings/${id}`, { method: 'GET' }),
  /** Cancel a PENDING booking and restore seat count */
  cancelBooking: (id) => request(`/bookings/${id}/cancel`, { method: 'DELETE' }),

  // ── Venues ────────────────────────────────────────────────────────────────
  getVenues: () => request('/venues', { method: 'GET' }),
  createVenue: (venueData) => request('/venues', { method: 'POST', body: JSON.stringify(venueData) }),
  updateVenue: (id, venueData) => request(`/venues/${id}`, { method: 'PUT', body: JSON.stringify(venueData) }),
  deleteVenue: (id) => request(`/venues/${id}`, { method: 'DELETE' }),

  // ── Payments ──────────────────────────────────────────────────────────────
  processMockPayment: (bookingId) => request(`/payments/${bookingId}/mock`, { method: 'POST' }),

  // ── Admin ─────────────────────────────────────────────────────────────────
  /** Admin stats: events, users, bookings, revenue */
  getAdminStats: () => request('/admin/stats', { method: 'GET' }),
  /** Admin: all bookings in system */
  getAllBookings: () => request('/admin/bookings', { method: 'GET' }),
  /** Admin: attendees for a specific event */
  getEventAttendees: (eventId) => request(`/events/${eventId}/attendees`, { method: 'GET' }),
};
