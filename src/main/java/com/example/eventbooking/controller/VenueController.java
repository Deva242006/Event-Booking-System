package com.example.eventbooking.controller;

import com.example.eventbooking.model.Venue;
import com.example.eventbooking.service.VenueService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/venues")
public class VenueController {

    @Autowired
    private VenueService venueService;

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
            List<Venue> venues = venueService.getAllVenues();

            List<Map<String, Object>> results = venues.stream()
                    .filter(v -> v.getLatitude() != null && v.getLongitude() != null)
                    .map(v -> {
                        double distance = haversineDistanceKm(lat, lng, v.getLatitude(), v.getLongitude());
                        Map<String, Object> entry = new LinkedHashMap<>();
                        entry.put("id", v.getId());
                        entry.put("name", v.getName());
                        entry.put("location", v.getLocation());
                        entry.put("capacity", v.getCapacity());
                        entry.put("coordinates", v.getCoordinates());
                        entry.put("distanceKm", Math.round(distance * 10.0) / 10.0);
                        return entry;
                    })
                    .filter(e -> ((Double) e.get("distanceKm")) <= radiusKm)
                    .sorted(Comparator.comparingDouble(e -> (Double) e.get("distanceKm")))
                    .collect(Collectors.toList());

            return ResponseEntity.ok(results);
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", "Failed to fetch nearby venues: " + e.getMessage()));
        }
    }

    private static double haversineDistanceKm(double lat1, double lon1, double lat2, double lon2) {
        final int R = 6371; // Earth radius in km
        double dLat = Math.toRadians(lat2 - lat1);
        double dLon = Math.toRadians(lon2 - lon1);
        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2)
                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                * Math.sin(dLon / 2) * Math.sin(dLon / 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
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
