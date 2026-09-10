package com.example.eventbooking.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
@Document(collection = "events")
public class Event {
    @Id
    private String id;
    private String title;
    private String description;
    private String venueId;
    private String organizerId;
    private LocalDateTime dateTime;
    private List<TicketCategory> ticketCategories;

    // New fields
    private String category;         // e.g. Music, Tech, Sports, Art, Food, Other
    private String imageUrl;         // banner image URL
    private List<Review> reviews = new ArrayList<>();
    private List<String> savedByUserIds = new ArrayList<>();  // for wishlist

    // Computed helper (not stored) — average rating
    public Double getAverageRating() {
        if (reviews == null || reviews.isEmpty()) return null;
        return reviews.stream().mapToInt(Review::getRating).average().orElse(0);
    }
}
