package com.example.eventbooking.service;

import com.example.eventbooking.model.Event;
import com.example.eventbooking.model.Venue;
import com.example.eventbooking.repository.EventRepository;
import com.example.eventbooking.repository.VenueRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class NearbyEventService {

    @Autowired
    private VenueRepository venueRepository;

    @Autowired
    private EventRepository eventRepository;

    /**
     * Calculates distance in kilometers between two geo-coordinates using Haversine formula.
     */
    public static double haversineDistanceKm(double lat1, double lon1, double lat2, double lon2) {
        final int R = 6371; // Radius of the Earth in km
        double latDistance = Math.toRadians(lat2 - lat1);
        double lonDistance = Math.toRadians(lon2 - lon1);
        double a = Math.sin(latDistance / 2) * Math.sin(latDistance / 2)
                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                * Math.sin(lonDistance / 2) * Math.sin(lonDistance / 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }

    /**
     * Find events whose venue is within radiusKm of (latitude, longitude).
     * Returns events enriched with a "distanceKm" field via a wrapper.
     */
    public List<NearbyEventResult> findNearbyEvents(double latitude, double longitude, double radiusKm) {
        // Step 1: find venues within radius
        List<Venue> allVenues = venueRepository.findAll();

        Map<String, VenueDistanceInfo> venueInfoMap = allVenues.stream()
                .filter(v -> v.getLatitude() != null && v.getLongitude() != null)
                .map(v -> {
                    double dist = haversineDistanceKm(latitude, longitude, v.getLatitude(), v.getLongitude());
                    return new Object() {
                        final Venue venue = v;
                        final double distance = Math.round(dist * 10.0) / 10.0;
                    };
                })
                .filter(o -> o.distance <= radiusKm)
                .collect(Collectors.toMap(
                        o -> o.venue.getId(),
                        o -> new VenueDistanceInfo(o.distance, o.venue.getCoordinates()),
                        (existing, replacement) -> existing
                ));

        if (venueInfoMap.isEmpty()) {
            return new ArrayList<>();
        }

        // Step 2: find all events for those venues
        List<Event> allEvents = eventRepository.findAll();
        List<Event> matchingEvents = allEvents.stream()
                .filter(e -> e.getVenueId() != null && venueInfoMap.containsKey(e.getVenueId()))
                .collect(Collectors.toList());

        // Step 3: build result with distance and location
        return matchingEvents.stream()
                .map(event -> {
                    VenueDistanceInfo info = venueInfoMap.getOrDefault(event.getVenueId(), new VenueDistanceInfo(-1.0, null));
                    return new NearbyEventResult(event, info.distance, info.location);
                })
                .sorted((a, b) -> Double.compare(a.getDistanceKm(), b.getDistanceKm()))
                .collect(Collectors.toList());
    }

    private static class VenueDistanceInfo {
        final double distance;
        final double[] location;
        VenueDistanceInfo(double distance, double[] location) {
            this.distance = distance;
            this.location = location;
        }
    }

    // Simple result wrapper
    public static class NearbyEventResult {
        private final Event event;
        private final double distanceKm;
        private final double[] venueCoordinates;

        public NearbyEventResult(Event event, double distanceKm, double[] venueCoordinates) {
            this.event = event;
            this.distanceKm = distanceKm;
            this.venueCoordinates = venueCoordinates;
        }

        public Event getEvent() { return event; }
        public double getDistanceKm() { return distanceKm; }
        public double[] getVenueCoordinates() { return venueCoordinates; }
    }
}
