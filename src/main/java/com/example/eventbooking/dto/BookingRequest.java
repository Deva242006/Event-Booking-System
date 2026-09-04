package com.example.eventbooking.dto;

import lombok.Data;

@Data
public class BookingRequest {
    private String eventId;
    private String ticketCategoryName;
    private int quantity;
}
