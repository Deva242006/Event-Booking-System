package com.example.eventbooking.controller;

import com.example.eventbooking.dto.ReviewRequest;
import com.example.eventbooking.model.Booking;
import com.example.eventbooking.model.Event;
import com.example.eventbooking.repository.BookingRepository;
import com.example.eventbooking.service.EventService;
import com.example.eventbooking.service.NearbyEventService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/events")
public class EventController {

    @Autowired
    private EventService eventService;

    @Autowired
    private NearbyEventService nearbyEventService;

    @Autowired
    private BookingRepository bookingRepository;

    @GetMapping
    public List<Event> getAllEvents() {
        return eventService.getAllEvents();
    }

    /**
     * Upcoming events — only future events sorted by dateTime ascending.
     * Publicly accessible.
     */
    @GetMapping("/upcoming")
    public List<Event> getUpcomingEvents() {
        return eventService.getUpcomingEvents();
    }

    /**
     * Enhanced search — supports ?title= and/or ?category=
     */
    @GetMapping("/search")
    public List<Event> searchEvents(
            @RequestParam(required = false) String title,
            @RequestParam(required = false) String category) {
        return eventService.searchEvents(title, category);
    }

    /**
     * Geolocation-based nearby events
     * GET /api/events/nearby?lat=&lng=&radiusKm=
     */
    @GetMapping("/nearby")
    public ResponseEntity<?> getNearbyEvents(
            @RequestParam double lat,
            @RequestParam double lng,
            @RequestParam(defaultValue = "10") double radiusKm) {
        try {
            List<NearbyEventService.NearbyEventResult> results =
                    nearbyEventService.findNearbyEvents(lat, lng, radiusKm);
            return ResponseEntity.ok(results);
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", "Failed to fetch nearby events: " + e.getMessage()));
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<Event> getEventById(@PathVariable String id) {
        return eventService.getEventById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public Event createEvent(@RequestBody Event event) {
        return eventService.createEvent(event);
    }

    @PutMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Event> updateEvent(@PathVariable String id, @RequestBody Event eventDetails) {
        try {
            return ResponseEntity.ok(eventService.updateEvent(id, eventDetails));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> deleteEvent(@PathVariable String id) {
        eventService.deleteEvent(id);
        return ResponseEntity.ok().build();
    }

    /**
     * Admin: get list of all bookings for a specific event (attendees).
     */
    @GetMapping("/{id}/attendees")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getEventAttendees(@PathVariable String id) {
        List<Booking> bookings = bookingRepository.findByEventId(id);
        return ResponseEntity.ok(bookings);
    }

    // ─── Reviews ─────────────────────────────────────────────────────────────

    @PostMapping("/{id}/reviews")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> addReview(
            @PathVariable String id,
            @Valid @RequestBody ReviewRequest request,
            Authentication authentication) {
        try {
            String userEmail = authentication.getName(); // JWT subject = email
            Event event = eventService.addReview(id, userEmail, request);
            return ResponseEntity.ok(event);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // ─── Wishlist ─────────────────────────────────────────────────────────────

    @PostMapping("/{id}/wishlist")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> toggleWishlist(
            @PathVariable String id,
            Authentication authentication) {
        try {
            String userEmail = authentication.getName();
            Event event = eventService.toggleWishlist(id, userEmail);
            return ResponseEntity.ok(event);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/wishlist")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<Event>> getWishlist(Authentication authentication) {
        String userEmail = authentication.getName();
        return ResponseEntity.ok(eventService.getWishlistEvents(userEmail));
    }
}
