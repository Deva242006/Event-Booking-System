package com.example.eventbooking.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Document(collection = "bookings")
public class Booking {
    @Id
    private String id;
    private String eventId;
    private String userId;
    private String ticketCategoryName;
    private int quantity;
    private BigDecimal totalAmount;
    private BookingStatus status;
    private String paymentId;
    private String qrCodeUrl;
    private LocalDateTime bookingTime;
}
