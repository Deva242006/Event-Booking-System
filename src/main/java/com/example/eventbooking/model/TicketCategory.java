package com.example.eventbooking.model;

import jakarta.persistence.Embeddable;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Embeddable
public class TicketCategory {
    private String name; // VIP, General, etc.
    private BigDecimal price;
    private int totalAvailable;
}
