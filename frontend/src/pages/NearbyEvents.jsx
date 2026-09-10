import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { api } from '../services/api';
import { MapPin, Navigation, Calendar, DollarSign, Star, Sliders } from 'lucide-react';

const CARD_GRADIENTS = [
  'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
  'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
  'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
  'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
  'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)',
];

const NearbyEvents = () => {
  const [searchParams] = useSearchParams();
  const mapContainerRef = useRef(null);
  const leafletMapRef = useRef(null);
  const markersRef = useRef([]);
  const mapInitializedRef = useRef(false);

  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [radiusKm, setRadiusKm] = useState(10);
  const [userCoords, setUserCoords] = useState(null);
  const [selectedEventId, setSelectedEventId] = useState(null);
  const [mapReady, setMapReady] = useState(false);

  // Parse lat/lng from URL params or prompt geolocation
  useEffect(() => {
    const lat = parseFloat(searchParams.get('lat'));
    const lng = parseFloat(searchParams.get('lng'));
    if (!isNaN(lat) && !isNaN(lng)) {
      setUserCoords({ lat, lng });
    } else {
      requestLocation();
    }
  }, []);

  const requestLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser.');
      return;
    }
    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLoading(false);
      },
      () => {
        setError('Location access denied. Please allow location and refresh.');
        setLoading(false);
      }
    );
  };

  // Load Leaflet dynamically (no npm install needed)
  // Callback ref: called when the map div mounts into the DOM
  const mapRef = useCallback((node) => {
    if (!node || mapInitializedRef.current) return;
    mapContainerRef.current = node;
    mapInitializedRef.current = true;

    const loadLeaflet = async () => {
      // Inject Leaflet CSS
      if (!document.getElementById('leaflet-css')) {
        const link = document.createElement('link');
        link.id = 'leaflet-css';
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        document.head.appendChild(link);
      }

      // Inject Leaflet JS
      if (!window.L) {
        await new Promise((resolve, reject) => {
          const script = document.createElement('script');
          script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
          script.onload = resolve;
          script.onerror = reject;
          document.head.appendChild(script);
        });
      }

      const L = window.L;
      const map = L.map(node, { zoomControl: true }).setView([20, 78], 5);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map);

      leafletMapRef.current = map;
      setMapReady(true);
    };

    loadLeaflet().catch(() => setError('Failed to load map. Check your internet connection.'));
  }, []);


  // Fetch nearby events when coords or radius change
  useEffect(() => {
    if (!userCoords) return;
    fetchNearby();
  }, [userCoords, radiusKm]);

  // Update map when results arrive
  useEffect(() => {
    if (!mapReady || !leafletMapRef.current || !userCoords) return;
    updateMap();
  }, [mapReady, results, userCoords, selectedEventId]);

  const fetchNearby = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await api.getNearbyEvents(userCoords.lat, userCoords.lng, radiusKm);
      setResults(data || []);
    } catch (err) {
      setError(err.message || 'Failed to fetch nearby events.');
    } finally {
      setLoading(false);
    }
  };

  const updateMap = () => {
    const L = window.L;
    const map = leafletMapRef.current;

    // Clear old markers
    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];

    // User location marker
    const userIcon = L.divIcon({
      html: `<div style="width:16px;height:16px;border-radius:50%;background:#3b82f6;border:3px solid white;box-shadow:0 0 0 2px #3b82f6;"></div>`,
      className: '', iconAnchor: [8, 8],
    });
    const userMarker = L.marker([userCoords.lat, userCoords.lng], { icon: userIcon })
      .addTo(map)
      .bindPopup('<b>📍 You are here</b>');
    markersRef.current.push(userMarker);

    // Draw radius circle
    const existingCircle = map._radiusCircle;
    if (existingCircle) existingCircle.remove();
    map._radiusCircle = L.circle([userCoords.lat, userCoords.lng], {
      radius: radiusKm * 1000,
      color: '#6366f1', fillColor: '#6366f1', fillOpacity: 0.07, weight: 1.5,
    }).addTo(map);

    // Event markers — venueCoordinates is [longitude, latitude]
    const bounds = [[userCoords.lat, userCoords.lng]];
    results.forEach((result, idx) => {
      const { event, distanceKm, venueCoordinates } = result;
      if (!venueCoordinates || venueCoordinates.length < 2) return;
      const [lng, lat] = venueCoordinates;
      const isSelected = event.id === selectedEventId;
      const color = isSelected ? '#f59e0b' : '#6366f1';

      const icon = L.divIcon({
        html: `<div style="
          width:${isSelected ? 36 : 30}px;height:${isSelected ? 36 : 30}px;
          border-radius:50% 50% 50% 0;transform:rotate(-45deg);
          background:${color};border:2px solid white;
          box-shadow:0 2px 8px rgba(0,0,0,0.3);cursor:pointer;
        "></div>`,
        className: '', iconAnchor: [isSelected ? 18 : 15, isSelected ? 36 : 30],
      });

      const marker = L.marker([lat, lng], { icon })
        .addTo(map)
        .bindPopup(`
          <div style="min-width:160px;">
            <b>${event.title}</b><br/>
            <span style="color:#64748b;font-size:0.8rem;">📍 ${distanceKm.toFixed(1)} km away</span>
          </div>
        `)
        .on('click', () => setSelectedEventId(event.id));

      markersRef.current.push(marker);
      bounds.push([lat, lng]);
    });

    if (bounds.length > 1) {
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 });
    } else {
      map.setView([userCoords.lat, userCoords.lng], 12);
    }
  };

  const getLowestPrice = (cats) => {
    if (!cats || cats.length === 0) return null;
    return Math.min(...cats.map(c => c.price));
  };

  const getAverageRating = (reviews) => {
    if (!reviews || reviews.length === 0) return null;
    return (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1);
  };

  return (
    <div className="animate-fade-in" style={{ padding: '1.5rem 0' }}>
      {/* Header */}
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <Navigation size={28} style={{ color: 'var(--primary-color)' }} />
          Events Near Me
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
          {userCoords
            ? `Searching within ${radiusKm} km of your location`
            : 'Waiting for your location...'}
        </p>
      </div>

      {/* Radius Slider */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem',
        padding: '0.85rem 1.25rem', background: 'var(--surface-color)',
        borderRadius: '0.75rem', border: '1px solid var(--border-color)',
      }}>
        <Sliders size={18} style={{ color: 'var(--primary-color)', flexShrink: 0 }} />
        <label style={{ fontSize: '0.875rem', color: 'var(--text-muted)', flexShrink: 0 }}>
          Radius: <strong style={{ color: 'var(--text-main)' }}>{radiusKm} km</strong>
        </label>
        <input
          id="radius-slider"
          type="range" min="1" max="100" value={radiusKm}
          onChange={e => setRadiusKm(Number(e.target.value))}
          style={{ flexGrow: 1, accentColor: 'var(--primary-color)', cursor: 'pointer' }}
        />
        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', flexShrink: 0 }}>1–100 km</span>
      </div>

      {error && (
        <div style={{ padding: '1rem', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '0.5rem', color: 'var(--danger-color)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
          ⚠️ {error}
        </div>
      )}

      {/* Split Layout: Map + Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '1.5rem', alignItems: 'start' }}>

        {/* Leaflet Map */}
        <div style={{ position: 'sticky', top: '1.5rem' }}>
          <div
            ref={mapRef}
            id="nearby-map"
            style={{
              height: '520px', borderRadius: '1rem', overflow: 'hidden',
              border: '1px solid var(--border-color)',
              background: 'var(--surface-color)',
            }}
          />
          {!mapReady && (
            <div style={{
              position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
              borderRadius: '1rem', background: 'var(--surface-color)', color: 'var(--text-muted)', fontSize: '0.9rem',
            }}>
              Loading map...
            </div>
          )}
        </div>

        {/* Event Cards List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '520px', overflowY: 'auto', paddingRight: '0.25rem' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>Searching nearby events...</div>
          ) : results.length === 0 && !error ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
              <MapPin size={40} style={{ marginBottom: '1rem', opacity: 0.4 }} />
              <p>No events found within {radiusKm} km.</p>
              <p style={{ fontSize: '0.85rem', marginTop: '0.5rem' }}>Try increasing the radius.</p>
            </div>
          ) : (
            results.map((result, idx) => {
              const { event, distanceKm } = result;
              const lowestPrice = getLowestPrice(event.ticketCategories);
              const avgRating = getAverageRating(event.reviews);
              const isSelected = event.id === selectedEventId;

              return (
                <div
                  key={event.id}
                  id={`nearby-card-${event.id}`}
                  onClick={() => setSelectedEventId(event.id)}
                  style={{
                    background: 'var(--surface-color)',
                    border: isSelected
                      ? '2px solid var(--primary-color)'
                      : '1px solid var(--border-color)',
                    borderRadius: '0.75rem',
                    padding: '1rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    boxShadow: isSelected ? '0 0 0 3px rgba(99,102,241,0.15)' : 'none',
                  }}
                >
                  {/* Distance badge */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: '600', lineHeight: 1.3 }}>{event.title}</h3>
                    <span style={{
                      fontSize: '0.75rem', fontWeight: '600', padding: '0.2rem 0.6rem',
                      borderRadius: '999px', background: 'rgba(99,102,241,0.12)',
                      color: 'var(--primary-color)', whiteSpace: 'nowrap', marginLeft: '0.5rem', flexShrink: 0,
                    }}>
                      📍 {distanceKm.toFixed(1)} km
                    </span>
                  </div>

                  <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '0.6rem', lineHeight: 1.4 }}>
                    {event.description?.length > 70 ? event.description.slice(0, 70) + '…' : event.description}
                  </p>

                  <div style={{ display: 'flex', gap: '0.75rem', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <Calendar size={12} />
                      {event.dateTime ? new Date(event.dateTime).toLocaleDateString() : 'Date TBD'}
                    </span>
                    {avgRating && (
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#eab308' }}>
                        <Star size={12} fill="#eab308" /> {avgRating}
                      </span>
                    )}
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: '700', color: 'var(--primary-color)', fontSize: '1rem' }}>
                      {lowestPrice !== null ? `From $${lowestPrice}` : 'Free'}
                    </span>
                    <Link
                      to={`/events/${event.id}`}
                      className="btn btn-outline"
                      style={{ padding: '0.35rem 0.85rem', fontSize: '0.8rem' }}
                      onClick={e => e.stopPropagation()}
                    >
                      Book
                    </Link>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default NearbyEvents;
