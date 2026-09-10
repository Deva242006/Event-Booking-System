package com.example.eventbooking.service;

import com.example.eventbooking.model.Event;
import com.example.eventbooking.model.Venue;
import com.example.eventbooking.repository.EventRepository;
import com.example.eventbooking.repository.VenueRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.geo.GeoResults;
import org.springframework.data.geo.Metrics;
import org.springframework.data.geo.Point;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.NearQuery;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class NearbyEventService {

    @Autowired
    private MongoTemplate mongoTemplate;

    @Autowired
    private VenueRepository venueRepository;

    @Autowired
    private EventRepository eventRepository;

    /**
     * Find events whose venue is within radiusKm of (latitude, longitude).
     * Returns events enriched with a "distanceKm" field via a wrapper.
     */
    public List<NearbyEventResult> findNearbyEvents(double latitude, double longitude, double radiusKm) {
        // Step 1: find venues within radius using MongoDB $geoNear
        Point userLocation = new Point(longitude, latitude); // GeoJSON: [lng, lat]
        NearQuery nearQuery = NearQuery.near(userLocation, Metrics.KILOMETERS)
                .maxDistance(radiusKm)
                .spherical(true);

        GeoResults<Venue> venueResults = mongoTemplate.geoNear(nearQuery, Venue.class);

        // Step 2: collect venueId -> distance and location mapping
        Map<String, VenueDistanceInfo> venueInfoMap = venueResults.getContent().stream()
                .collect(Collectors.toMap(
                        r -> r.getContent().getId(),
                        r -> new VenueDistanceInfo(r.getDistance().getValue(), r.getContent().getCoordinates())
                ));

        if (venueInfoMap.isEmpty()) {
            return new ArrayList<>();
        }

        // Step 3: find all events for those venues
        Query eventQuery = new Query(Criteria.where("venueId").in(venueInfoMap.keySet()));
        List<Event> events = mongoTemplate.find(eventQuery, Event.class);

        // Step 4: build result with distance and location
        return events.stream()
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
