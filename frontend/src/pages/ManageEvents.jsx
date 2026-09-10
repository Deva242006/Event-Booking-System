import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Plus, MapPin, Calendar, Trash2, Edit3, X, Building2, Tag, DollarSign, Users, Clock } from 'lucide-react';

const ManageEvents = ({ user }) => {
  const [activeTab, setActiveTab] = useState('events');
  
  // Events state
  const [events, setEvents] = useState([]);
  const [venues, setVenues] = useState([]);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [loadingVenues, setLoadingVenues] = useState(true);

  // Event form state
  const [showEventForm, setShowEventForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [eventForm, setEventForm] = useState({
    title: '',
    description: '',
    venueId: '',
    dateTime: '',
    category: '',
    ticketCategories: [{ name: 'General', price: 0, totalAvailable: 100 }]
  });
  const [eventError, setEventError] = useState('');
  const [eventSuccess, setEventSuccess] = useState('');
  const [eventSubmitting, setEventSubmitting] = useState(false);

  // Venue form state
  const [showVenueForm, setShowVenueForm] = useState(false);
  const [editingVenue, setEditingVenue] = useState(null);
  const [venueForm, setVenueForm] = useState({
    name: '',
    location: '',
    capacity: 0,
    latitude: '',
    longitude: '',
  });
  const [venueError, setVenueError] = useState('');
  const [venueSuccess, setVenueSuccess] = useState('');
  const [venueSubmitting, setVenueSubmitting] = useState(false);

  useEffect(() => {
    fetchEvents();
    fetchVenues();
  }, []);

  const fetchEvents = async () => {
    setLoadingEvents(true);
    try {
      const data = await api.getEvents();
      setEvents(data || []);
    } catch (err) {
      console.error('Failed to fetch events:', err);
    } finally {
      setLoadingEvents(false);
    }
  };

  const fetchVenues = async () => {
    setLoadingVenues(true);
    try {
      const data = await api.getVenues();
      setVenues(data || []);
    } catch (err) {
      console.error('Failed to fetch venues:', err);
    } finally {
      setLoadingVenues(false);
    }
  };

  // ─── Event Handlers ────────────────────────────
  const resetEventForm = () => {
    setEventForm({
      title: '',
      description: '',
      venueId: '',
      dateTime: '',
      category: '',
      ticketCategories: [{ name: 'General', price: 0, totalAvailable: 100 }]
    });
    setEditingEvent(null);
    setEventError('');
    setEventSuccess('');
  };

  const openCreateEvent = () => {
    resetEventForm();
    setShowEventForm(true);
  };

  const openEditEvent = (event) => {
    setEditingEvent(event);
    setEventForm({
      title: event.title || '',
      description: event.description || '',
      venueId: event.venueId || '',
      dateTime: event.dateTime ? event.dateTime.slice(0, 16) : '',
      category: event.category || '',
      ticketCategories: event.ticketCategories && event.ticketCategories.length > 0
        ? event.ticketCategories.map(c => ({ ...c }))
        : [{ name: 'General', price: 0, totalAvailable: 100 }]
    });
    setEventError('');
    setEventSuccess('');
    setShowEventForm(true);
  };

  const handleEventSubmit = async (e) => {
    e.preventDefault();
    setEventError('');
    setEventSuccess('');
    setEventSubmitting(true);

    try {
      const payload = {
        ...eventForm,
        organizerId: user.email,
        category: eventForm.category || null,
        ticketCategories: eventForm.ticketCategories.map(cat => ({
          name: cat.name,
          price: parseFloat(cat.price),
          totalAvailable: parseInt(cat.totalAvailable, 10)
        }))
      };

      if (editingEvent) {
        await api.updateEvent(editingEvent.id, payload);
        setEventSuccess('Event updated successfully!');
      } else {
        await api.createEvent(payload);
        setEventSuccess('Event created successfully!');
      }
      fetchEvents();
      setTimeout(() => {
        setShowEventForm(false);
        resetEventForm();
      }, 1500);
    } catch (err) {
      setEventError(err.message || 'Failed to save event');
    } finally {
      setEventSubmitting(false);
    }
  };

  const handleDeleteEvent = async (id) => {
    if (!window.confirm('Are you sure you want to delete this event?')) return;
    try {
      await api.deleteEvent(id);
      fetchEvents();
    } catch (err) {
      alert(err.message || 'Failed to delete event');
    }
  };

  const addTicketCategory = () => {
    setEventForm(prev => ({
      ...prev,
      ticketCategories: [...prev.ticketCategories, { name: '', price: 0, totalAvailable: 50 }]
    }));
  };

  const removeTicketCategory = (index) => {
    setEventForm(prev => ({
      ...prev,
      ticketCategories: prev.ticketCategories.filter((_, i) => i !== index)
    }));
  };

  const updateTicketCategory = (index, field, value) => {
    setEventForm(prev => ({
      ...prev,
      ticketCategories: prev.ticketCategories.map((cat, i) =>
        i === index ? { ...cat, [field]: value } : cat
      )
    }));
  };

  // ─── Venue Handlers ────────────────────────────
  const resetVenueForm = () => {
    setVenueForm({ name: '', location: '', capacity: 0, latitude: '', longitude: '' });
    setEditingVenue(null);
    setVenueError('');
    setVenueSuccess('');
  };

  const openCreateVenue = () => {
    resetVenueForm();
    setShowVenueForm(true);
  };

  const openEditVenue = (venue) => {
    setEditingVenue(venue);
    setVenueForm({
      name: venue.name || '',
      location: venue.location || '',
      capacity: venue.capacity || 0,
      latitude: venue.latitude ?? '',
      longitude: venue.longitude ?? '',
    });
    setVenueError('');
    setVenueSuccess('');
    setShowVenueForm(true);
  };

  const handleVenueSubmit = async (e) => {
    e.preventDefault();
    setVenueError('');
    setVenueSuccess('');
    setVenueSubmitting(true);

    try {
      const lat = parseFloat(venueForm.latitude);
      const lng = parseFloat(venueForm.longitude);
      const payload = {
        ...venueForm,
        capacity: parseInt(venueForm.capacity, 10),
        // Build [lng, lat] coordinates array for MongoDB GeoJSON if provided
        ...((!isNaN(lat) && !isNaN(lng) && venueForm.latitude !== '' && venueForm.longitude !== '')
          ? { coordinates: [lng, lat] }
          : {}),
      };

      if (editingVenue) {
        await api.updateVenue(editingVenue.id, payload);
        setVenueSuccess('Venue updated successfully!');
      } else {
        await api.createVenue(payload);
        setVenueSuccess('Venue created successfully!');
      }
      fetchVenues();
      setTimeout(() => {
        setShowVenueForm(false);
        resetVenueForm();
      }, 1500);
    } catch (err) {
      setVenueError(err.message || 'Failed to save venue');
    } finally {
      setVenueSubmitting(false);
    }
  };

  const handleDeleteVenue = async (id) => {
    if (!window.confirm('Are you sure you want to delete this venue?')) return;
    try {
      await api.deleteVenue(id);
      fetchVenues();
    } catch (err) {
      alert(err.message || 'Failed to delete venue');
    }
  };

  // ─── Tab Styles ────────────────────────────────
  const tabStyle = (isActive) => ({
    padding: '0.75rem 1.5rem',
    border: 'none',
    borderBottom: isActive ? '2px solid var(--primary-color)' : '2px solid transparent',
    backgroundColor: 'transparent',
    color: isActive ? 'var(--primary-color)' : 'var(--text-muted)',
    fontWeight: isActive ? '600' : '400',
    fontSize: '1rem',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  });

  return (
    <div className="animate-fade-in" style={{ padding: '2rem 0' }}>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Manage Events & Venues</h1>
        <p style={{ color: 'var(--text-muted)' }}>Create, edit, and delete events and venues</p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid var(--border-color)', marginBottom: '2rem' }}>
        <button style={tabStyle(activeTab === 'events')} onClick={() => setActiveTab('events')}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Calendar size={18} /> Events
          </span>
        </button>
        <button style={tabStyle(activeTab === 'venues')} onClick={() => setActiveTab('venues')}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Building2 size={18} /> Venues
          </span>
        </button>
      </div>

      {/* ═══════════════════ EVENTS TAB ═══════════════════ */}
      {activeTab === 'events' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1.25rem' }}>All Events ({events.length})</h2>
            <button className="btn btn-primary" onClick={openCreateEvent} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Plus size={18} /> Create Event
            </button>
          </div>

          {/* Event Form Modal */}
          {showEventForm && (
            <div style={{
              position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex',
              alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem'
            }}>
              <div className="card" style={{ width: '100%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                  <h3 style={{ fontSize: '1.25rem' }}>{editingEvent ? 'Edit Event' : 'Create New Event'}</h3>
                  <button onClick={() => { setShowEventForm(false); resetEventForm(); }} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                    <X size={24} />
                  </button>
                </div>

                <form onSubmit={handleEventSubmit}>
                  <div className="form-group">
                    <label htmlFor="event-title">Event Title</label>
                    <input id="event-title" type="text" required placeholder="e.g. Tech Conference 2026"
                      value={eventForm.title} onChange={(e) => setEventForm(f => ({ ...f, title: e.target.value }))} />
                  </div>

                  <div className="form-group">
                    <label htmlFor="event-desc">Description</label>
                    <textarea id="event-desc" required placeholder="Describe your event..."
                      value={eventForm.description} onChange={(e) => setEventForm(f => ({ ...f, description: e.target.value }))}
                      style={{ width: '100%', minHeight: '100px', resize: 'vertical' }} />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div className="form-group">
                      <label htmlFor="event-date">Date & Time</label>
                      <input id="event-date" type="datetime-local" required
                        value={eventForm.dateTime} onChange={(e) => setEventForm(f => ({ ...f, dateTime: e.target.value }))} />
                    </div>
                    <div className="form-group">
                      <label htmlFor="event-venue">Venue</label>
                      <select id="event-venue" value={eventForm.venueId}
                        onChange={(e) => setEventForm(f => ({ ...f, venueId: e.target.value }))}
                        style={{ width: '100%' }}>
                        <option value="">-- Select Venue --</option>
                        {venues.map(v => (
                          <option key={v.id} value={v.id}>{v.name} ({v.location})</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="event-category">Category</label>
                    <select id="event-category" value={eventForm.category}
                      onChange={(e) => setEventForm(f => ({ ...f, category: e.target.value }))}
                      style={{ width: '100%' }}>
                      <option value="">-- Select Category --</option>
                      {['Music', 'Tech', 'Sports', 'Art', 'Food', 'Other'].map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>

                  {/* Ticket Categories */}
                  <div style={{ marginBottom: '1.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                      <label style={{ fontSize: '0.875rem', fontWeight: '500', color: 'var(--text-muted)' }}>Ticket Categories</label>
                      <button type="button" onClick={addTicketCategory}
                        style={{ background: 'none', border: '1px solid var(--border-color)', color: 'var(--primary-color)', padding: '0.25rem 0.75rem', borderRadius: '0.375rem', cursor: 'pointer', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <Plus size={14} /> Add Category
                      </button>
                    </div>

                    {eventForm.ticketCategories.map((cat, index) => (
                      <div key={index} style={{
                        display: 'grid', gridTemplateColumns: '1fr 100px 100px auto', gap: '0.5rem',
                        alignItems: 'end', marginBottom: '0.5rem', padding: '0.75rem',
                        border: '1px solid var(--border-color)', borderRadius: '0.5rem', backgroundColor: 'var(--bg-color)'
                      }}>
                        <div>
                          <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Name</label>
                          <input type="text" required placeholder="e.g. VIP" value={cat.name}
                            onChange={(e) => updateTicketCategory(index, 'name', e.target.value)}
                            style={{ padding: '0.5rem' }} />
                        </div>
                        <div>
                          <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Price ($)</label>
                          <input type="number" required min="0" step="0.01" value={cat.price}
                            onChange={(e) => updateTicketCategory(index, 'price', e.target.value)}
                            style={{ padding: '0.5rem' }} />
                        </div>
                        <div>
                          <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Qty</label>
                          <input type="number" required min="1" value={cat.totalAvailable}
                            onChange={(e) => updateTicketCategory(index, 'totalAvailable', e.target.value)}
                            style={{ padding: '0.5rem' }} />
                        </div>
                        {eventForm.ticketCategories.length > 1 && (
                          <button type="button" onClick={() => removeTicketCategory(index)}
                            style={{ background: 'none', border: 'none', color: 'var(--danger-color)', cursor: 'pointer', padding: '0.5rem' }}>
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>

                  {eventError && <div className="error-text" style={{ marginBottom: '1rem', textAlign: 'center' }}>{eventError}</div>}
                  {eventSuccess && <div style={{ color: 'var(--success-color)', fontSize: '0.875rem', marginBottom: '1rem', textAlign: 'center' }}>{eventSuccess}</div>}

                  <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <button type="button" className="btn btn-outline" style={{ flex: 1 }}
                      onClick={() => { setShowEventForm(false); resetEventForm(); }}>
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={eventSubmitting}>
                      {eventSubmitting ? 'Saving...' : editingEvent ? 'Update Event' : 'Create Event'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Events List */}
          {loadingEvents ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>Loading events...</div>
          ) : events.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
              <Calendar size={48} style={{ color: 'var(--text-muted)', marginBottom: '1rem' }} />
              <p style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>No events yet. Create your first event!</p>
              <button className="btn btn-primary" onClick={openCreateEvent}>Create Event</button>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: '1rem' }}>
              {events.map(event => {
                const venue = venues.find(v => v.id === event.venueId);
                const totalTickets = event.ticketCategories?.reduce((s, c) => s + c.totalAvailable, 0) || 0;
                const lowestPrice = event.ticketCategories?.length > 0
                  ? Math.min(...event.ticketCategories.map(c => c.price))
                  : 0;

                return (
                  <div key={event.id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ flex: 1 }}>
                      <h3 style={{ fontSize: '1.1rem', marginBottom: '0.25rem' }}>{event.title}</h3>
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '0.5rem' }}>
                        {event.description?.length > 100 ? event.description.slice(0, 100) + '...' : event.description}
                      </p>
                      <div style={{ display: 'flex', gap: '1.25rem', fontSize: '0.8rem', color: 'var(--text-muted)', flexWrap: 'wrap' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                          <Clock size={14} /> {event.dateTime ? new Date(event.dateTime).toLocaleString() : 'No date'}
                        </span>
                        {venue && (
                          <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                            <MapPin size={14} /> {venue.name}
                          </span>
                        )}
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                          <Tag size={14} /> {event.ticketCategories?.length || 0} categories
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                          <Users size={14} /> {totalTickets} tickets
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                          <DollarSign size={14} /> From ${lowestPrice}
                        </span>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
                      <button className="btn btn-outline" style={{ padding: '0.5rem 0.75rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                        onClick={() => openEditEvent(event)}>
                        <Edit3 size={16} /> Edit
                      </button>
                      <button style={{ padding: '0.5rem 0.75rem', display: 'flex', alignItems: 'center', gap: '0.25rem', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: 'var(--danger-color)', borderRadius: '0.5rem', cursor: 'pointer' }}
                        onClick={() => handleDeleteEvent(event.id)}>
                        <Trash2 size={16} /> Delete
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ═══════════════════ VENUES TAB ═══════════════════ */}
      {activeTab === 'venues' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1.25rem' }}>All Venues ({venues.length})</h2>
            <button className="btn btn-primary" onClick={openCreateVenue} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Plus size={18} /> Create Venue
            </button>
          </div>

          {/* Venue Form Modal */}
          {showVenueForm && (
            <div style={{
              position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex',
              alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem'
            }}>
              <div className="card" style={{ width: '100%', maxWidth: '500px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                  <h3 style={{ fontSize: '1.25rem' }}>{editingVenue ? 'Edit Venue' : 'Create New Venue'}</h3>
                  <button onClick={() => { setShowVenueForm(false); resetVenueForm(); }} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                    <X size={24} />
                  </button>
                </div>

                <form onSubmit={handleVenueSubmit}>
                  <div className="form-group">
                    <label htmlFor="venue-name">Venue Name</label>
                    <input id="venue-name" type="text" required placeholder="e.g. City Convention Center"
                      value={venueForm.name} onChange={(e) => setVenueForm(f => ({ ...f, name: e.target.value }))} />
                  </div>
                  <div className="form-group">
                    <label htmlFor="venue-location">Location</label>
                    <input id="venue-location" type="text" required placeholder="e.g. 123 Main Street, City"
                      value={venueForm.location} onChange={(e) => setVenueForm(f => ({ ...f, location: e.target.value }))} />
                  </div>
                  <div className="form-group">
                    <label htmlFor="venue-capacity">Capacity</label>
                    <input id="venue-capacity" type="number" required min="1" placeholder="e.g. 500"
                      value={venueForm.capacity} onChange={(e) => setVenueForm(f => ({ ...f, capacity: e.target.value }))} />
                  </div>

                  {/* Geolocation coordinates for Nearby Events */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div className="form-group">
                      <label htmlFor="venue-lat">Latitude <span style={{ color: 'var(--text-muted)', fontWeight: 400, fontSize: '0.8rem' }}>(for nearby search)</span></label>
                      <input id="venue-lat" type="number" step="any" placeholder="e.g. 13.0827"
                        value={venueForm.latitude} onChange={(e) => setVenueForm(f => ({ ...f, latitude: e.target.value }))} />
                    </div>
                    <div className="form-group">
                      <label htmlFor="venue-lng">Longitude</label>
                      <input id="venue-lng" type="number" step="any" placeholder="e.g. 80.2707"
                        value={venueForm.longitude} onChange={(e) => setVenueForm(f => ({ ...f, longitude: e.target.value }))} />
                    </div>
                  </div>

                  {venueError && <div className="error-text" style={{ marginBottom: '1rem', textAlign: 'center' }}>{venueError}</div>}
                  {venueSuccess && <div style={{ color: 'var(--success-color)', fontSize: '0.875rem', marginBottom: '1rem', textAlign: 'center' }}>{venueSuccess}</div>}

                  <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <button type="button" className="btn btn-outline" style={{ flex: 1 }}
                      onClick={() => { setShowVenueForm(false); resetVenueForm(); }}>
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={venueSubmitting}>
                      {venueSubmitting ? 'Saving...' : editingVenue ? 'Update Venue' : 'Create Venue'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Venues List */}
          {loadingVenues ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>Loading venues...</div>
          ) : venues.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
              <Building2 size={48} style={{ color: 'var(--text-muted)', marginBottom: '1rem' }} />
              <p style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>No venues yet. Create a venue first before creating events!</p>
              <button className="btn btn-primary" onClick={openCreateVenue}>Create Venue</button>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: '1rem' }}>
              {venues.map(venue => (
                <div key={venue.id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
                  <div>
                    <h3 style={{ fontSize: '1.1rem', marginBottom: '0.25rem' }}>{venue.name}</h3>
                    <div style={{ display: 'flex', gap: '1.25rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <MapPin size={14} /> {venue.location}
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <Users size={14} /> Capacity: {venue.capacity}
                      </span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
                    <button className="btn btn-outline" style={{ padding: '0.5rem 0.75rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                      onClick={() => openEditVenue(venue)}>
                      <Edit3 size={16} /> Edit
                    </button>
                    <button style={{ padding: '0.5rem 0.75rem', display: 'flex', alignItems: 'center', gap: '0.25rem', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: 'var(--danger-color)', borderRadius: '0.5rem', cursor: 'pointer' }}
                      onClick={() => handleDeleteVenue(venue.id)}>
                      <Trash2 size={16} /> Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ManageEvents;
