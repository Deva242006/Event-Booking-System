package com.example.eventbooking.model;

import jakarta.persistence.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "bookings")
public class Booking {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    private String eventId;
    private String userId;
    private String ticketCategoryName;
    private int quantity;
    private BigDecimal totalAmount;

    @Enumerated(EnumType.STRING)
    private BookingStatus status;

    private String paymentId;

    @Column(columnDefinition = "LONGTEXT")
    private String qrCodeUrl;

    private LocalDateTime bookingTime;
}
