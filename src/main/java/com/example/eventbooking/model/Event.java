package com.example.eventbooking.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
@Entity
@Table(name = "events")
public class Event {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    private String title;

    @Column(length = 4000)
    private String description;

    private String venueId;
    private String organizerId;
    private LocalDateTime dateTime;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "event_ticket_categories", joinColumns = @JoinColumn(name = "event_id"))
    private List<TicketCategory> ticketCategories = new ArrayList<>();

    // New fields
    private String category;         // e.g. Music, Tech, Sports, Art, Food, Other
    private String imageUrl;         // banner image URL

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "event_reviews", joinColumns = @JoinColumn(name = "event_id"))
    private List<Review> reviews = new ArrayList<>();

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "event_saved_users", joinColumns = @JoinColumn(name = "event_id"))
    @Column(name = "user_id")
    private List<String> savedByUserIds = new ArrayList<>();  // for wishlist

    // Computed helper (not stored) — average rating
    @Transient
    public Double getAverageRating() {
        if (reviews == null || reviews.isEmpty()) return null;
        return reviews.stream().mapToInt(Review::getRating).average().orElse(0);
    }
}
