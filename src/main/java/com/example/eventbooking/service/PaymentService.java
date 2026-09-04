package com.example.eventbooking.service;

import com.example.eventbooking.model.Booking;
import com.example.eventbooking.model.BookingStatus;
import com.example.eventbooking.repository.BookingRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
public class PaymentService {

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private QrCodeService qrCodeService;

    public Booking processMockPayment(String bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        if (booking.getStatus() != BookingStatus.PENDING) {
            throw new RuntimeException("Booking is not in PENDING state");
        }

        // Mock payment processing
        booking.setPaymentId("mock_txn_" + UUID.randomUUID().toString());
        booking.setStatus(BookingStatus.CONFIRMED);

        // Generate QR code for the ticket
        String ticketData = "TicketID: " + booking.getId() + "\nEventID: " + booking.getEventId() + "\nUser: " + booking.getUserId();
        String qrCodeUrl = qrCodeService.generateQrCodeBase64(ticketData);
        booking.setQrCodeUrl(qrCodeUrl);

        return bookingRepository.save(booking);
    }
}
