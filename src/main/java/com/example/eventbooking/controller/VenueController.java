package com.example.eventbooking.controller;

import com.example.eventbooking.model.Venue;
import com.example.eventbooking.service.VenueService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.geo.GeoResults;
import org.springframework.data.geo.Metrics;
import org.springframework.data.geo.Point;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.NearQuery;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/venues")
public class VenueController {

    @Autowired
    private VenueService venueService;

    @Autowired
    private MongoTemplate mongoTemplate;

    @GetMapping
    public List<Venue> getAllVenues() {
        return venueService.getAllVenues();
    }

    /**
     * Returns venues near [lat, lng] within radiusKm, sorted by distance.
     * Each result includes the venue data plus a distanceKm field.
     */
    @GetMapping("/nearby")
    public ResponseEntity<?> getNearbyVenues(
            @RequestParam double lat,
            @RequestParam double lng,
            @RequestParam(defaultValue = "10") double radiusKm) {
        try {
            Point userLocation = new Point(lng, lat); // GeoJSON: [lng, lat]
            NearQuery nearQuery = NearQuery.near(userLocation, Metrics.KILOMETERS)
                    .maxDistance(radiusKm)
                    .spherical(true);

            GeoResults<Venue> geoResults = mongoTemplate.geoNear(nearQuery, Venue.class);

            List<Map<String, Object>> results = geoResults.getContent().stream()
                    .map(r -> {
                        Map<String, Object> entry = new LinkedHashMap<>();
                        Venue v = r.getContent();
                        entry.put("id", v.getId());
                        entry.put("name", v.getName());
                        entry.put("location", v.getLocation());
                        entry.put("capacity", v.getCapacity());
                        entry.put("coordinates", v.getCoordinates());
                        entry.put("distanceKm", Math.round(r.getDistance().getValue() * 10.0) / 10.0);
                        return entry;
                    })
                    .collect(Collectors.toList());

            return ResponseEntity.ok(results);
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", "Failed to fetch nearby venues: " + e.getMessage()));
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<Venue> getVenueById(@PathVariable String id) {
        return venueService.getVenueById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public Venue createVenue(@RequestBody Venue venue) {
        return venueService.createVenue(venue);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Venue> updateVenue(@PathVariable String id, @RequestBody Venue venueDetails) {
        try {
            return ResponseEntity.ok(venueService.updateVenue(id, venueDetails));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteVenue(@PathVariable String id) {
        venueService.deleteVenue(id);
        return ResponseEntity.ok().build();
    }
}
