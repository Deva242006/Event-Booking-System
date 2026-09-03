package com.example.eventbooking.model;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class TicketCategory {
    private String name; // VIP, General, etc.
    private BigDecimal price;
    private int totalAvailable;
}
