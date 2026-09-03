package com.example.eventbooking.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;
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
}
