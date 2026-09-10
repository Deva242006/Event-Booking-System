package com.example.eventbooking.service;

import com.example.eventbooking.dto.ReviewRequest;
import com.example.eventbooking.model.Event;
import com.example.eventbooking.model.Review;
import com.example.eventbooking.model.User;
import com.example.eventbooking.repository.EventRepository;
import com.example.eventbooking.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class EventService {

    @Autowired
    private EventRepository eventRepository;

    @Autowired
    private UserRepository userRepository;

    public Event createEvent(Event event) {
        if (event.getReviews() == null) event.setReviews(new ArrayList<>());
        if (event.getSavedByUserIds() == null) event.setSavedByUserIds(new ArrayList<>());
        return eventRepository.save(event);
    }

    public List<Event> getAllEvents() {
        return eventRepository.findAll();
    }

    /**
     * Returns only events whose dateTime is in the future, sorted ascending.
     */
    public List<Event> getUpcomingEvents() {
        LocalDateTime now = LocalDateTime.now();
        return eventRepository.findAll().stream()
                .filter(e -> e.getDateTime() != null && e.getDateTime().isAfter(now))
                .sorted(Comparator.comparing(Event::getDateTime))
                .collect(Collectors.toList());
    }

    /**
     * Enhanced search: filter by title and/or category.
     */
    public List<Event> searchEvents(String title, String category) {
        boolean hasTitle = title != null && !title.trim().isEmpty();
        boolean hasCategory = category != null && !category.trim().isEmpty() && !category.equalsIgnoreCase("All");

        if (hasTitle && hasCategory) {
            return eventRepository.findByTitleContainingIgnoreCaseAndCategory(title, category);
        } else if (hasTitle) {
            return eventRepository.findByTitleContainingIgnoreCase(title);
        } else if (hasCategory) {
            return eventRepository.findByCategory(category);
        } else {
            return eventRepository.findAll();
        }
    }

    // Backward-compatible overload
    public List<Event> searchEvents(String title) {
        return searchEvents(title, null);
    }

    public Optional<Event> getEventById(String id) {
        return eventRepository.findById(id);
    }

    public List<Event> getEventsByOrganizerId(String organizerId) {
        return eventRepository.findByOrganizerId(organizerId);
    }

    public Event updateEvent(String id, Event eventDetails) {
        return eventRepository.findById(id).map(event -> {
            event.setTitle(eventDetails.getTitle());
            event.setDescription(eventDetails.getDescription());
            event.setVenueId(eventDetails.getVenueId());
            event.setDateTime(eventDetails.getDateTime());
            event.setTicketCategories(eventDetails.getTicketCategories());
            if (eventDetails.getCategory() != null) event.setCategory(eventDetails.getCategory());
            if (eventDetails.getImageUrl() != null) event.setImageUrl(eventDetails.getImageUrl());
            return eventRepository.save(event);
        }).orElseThrow(() -> new RuntimeException("Event not found with id: " + id));
    }

    public void deleteEvent(String id) {
        eventRepository.deleteById(id);
    }

    // ─── Reviews ─────────────────────────────────────────────────────────────

    /**
     * BUG FIX: The JWT subject is the user's email (set in JwtUtils via userPrincipal.getUsername()
     * which returns email). We must use findByEmail, NOT findById.
     */
    public Event addReview(String eventId, String userEmail, ReviewRequest reviewRequest) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new RuntimeException("Event not found"));

        // Prevent duplicate reviews from same user (match by email)
        boolean alreadyReviewed = event.getReviews().stream()
                .anyMatch(r -> r.getUserId().equals(userEmail));
        if (alreadyReviewed) {
            throw new RuntimeException("You have already reviewed this event");
        }

        // BUG FIX: look up user by email, not by ID
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Review review = new Review();
        review.setUserId(userEmail);        // store email as userId for consistent lookup
        review.setUserName(user.getName());
        review.setRating(reviewRequest.getRating());
        review.setComment(reviewRequest.getComment());
        review.setCreatedAt(LocalDateTime.now());

        event.getReviews().add(review);
        return eventRepository.save(event);
    }

    // ─── Wishlist ─────────────────────────────────────────────────────────────

    /**
     * Toggle wishlist for a user. userId here is the email (JWT subject).
     */
    public Event toggleWishlist(String eventId, String userId) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new RuntimeException("Event not found"));

        List<String> saved = event.getSavedByUserIds();
        if (saved == null) {
            saved = new ArrayList<>();
            event.setSavedByUserIds(saved);
        }

        if (saved.contains(userId)) {
            saved.remove(userId);
        } else {
            saved.add(userId);
        }

        return eventRepository.save(event);
    }

    public List<Event> getWishlistEvents(String userId) {
        return eventRepository.findBySavedByUserIdsContaining(userId);
    }
}
