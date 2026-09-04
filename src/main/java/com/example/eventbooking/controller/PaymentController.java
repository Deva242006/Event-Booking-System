package com.example.eventbooking.controller;

import com.example.eventbooking.model.Booking;
import com.example.eventbooking.service.PaymentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/payments")
public class PaymentController {

    @Autowired
    private PaymentService paymentService;

    @PostMapping("/{bookingId}/mock")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<?> processMockPayment(@PathVariable String bookingId) {
        try {
            Booking confirmedBooking = paymentService.processMockPayment(bookingId);
            return ResponseEntity.ok(confirmedBooking);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
