package com.example.eventbooking.controller;

import com.example.eventbooking.model.Booking;
import com.example.eventbooking.model.BookingStatus;
import com.example.eventbooking.repository.BookingRepository;
import com.example.eventbooking.repository.EventRepository;
import com.example.eventbooking.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

/**
 * Admin-only controller for system-wide statistics and management operations.
 * All endpoints require ADMIN role.
 */
@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    @Autowired
    private EventRepository eventRepository;

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private UserRepository userRepository;

    /**
     * Returns high-level system statistics for the admin dashboard.
     */
    @GetMapping("/stats")
    public ResponseEntity<?> getStats() {
        long totalEvents = eventRepository.count();
        long totalUsers = userRepository.count();
        List<Booking> allBookings = bookingRepository.findAll();

        long totalBookings = allBookings.size();
        long confirmedBookings = allBookings.stream()
                .filter(b -> b.getStatus() == BookingStatus.CONFIRMED)
                .count();
        long pendingBookings = allBookings.stream()
                .filter(b -> b.getStatus() == BookingStatus.PENDING)
                .count();
        long cancelledBookings = allBookings.stream()
                .filter(b -> b.getStatus() == BookingStatus.CANCELLED)
                .count();

        BigDecimal totalRevenue = allBookings.stream()
                .filter(b -> b.getStatus() == BookingStatus.CONFIRMED)
                .map(Booking::getTotalAmount)
                .filter(amt -> amt != null)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return ResponseEntity.ok(Map.of(
                "totalEvents", totalEvents,
                "totalUsers", totalUsers,
                "totalBookings", totalBookings,
                "confirmedBookings", confirmedBookings,
                "pendingBookings", pendingBookings,
                "cancelledBookings", cancelledBookings,
                "totalRevenue", totalRevenue
        ));
    }

    /**
     * Returns all bookings in the system for admin review.
     */
    @GetMapping("/bookings")
    public ResponseEntity<List<Booking>> getAllBookings() {
        return ResponseEntity.ok(bookingRepository.findAll());
    }
}
