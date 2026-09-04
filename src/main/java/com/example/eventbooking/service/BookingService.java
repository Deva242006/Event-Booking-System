package com.example.eventbooking.service;

import com.example.eventbooking.dto.BookingRequest;
import com.example.eventbooking.model.Booking;
import com.example.eventbooking.model.BookingStatus;
import com.example.eventbooking.model.Event;
import com.example.eventbooking.model.TicketCategory;
import com.example.eventbooking.repository.BookingRepository;
import com.example.eventbooking.repository.EventRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class BookingService {

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private EventRepository eventRepository;

    @Transactional
    public Booking holdSeats(String userId, BookingRequest request) {
        Event event = eventRepository.findById(request.getEventId())
                .orElseThrow(() -> new RuntimeException("Event not found"));

        TicketCategory selectedCategory = event.getTicketCategories().stream()
                .filter(cat -> cat.getName().equalsIgnoreCase(request.getTicketCategoryName()))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Ticket category not found"));

        if (selectedCategory.getTotalAvailable() < request.getQuantity()) {
            throw new RuntimeException("Not enough seats available");
        }

        // Decrement available seats (Optimistic locking should ideally be used here in production)
        selectedCategory.setTotalAvailable(selectedCategory.getTotalAvailable() - request.getQuantity());
        eventRepository.save(event);

        Booking booking = new Booking();
        booking.setEventId(event.getId());
        booking.setUserId(userId);
        booking.setTicketCategoryName(selectedCategory.getName());
        booking.setQuantity(request.getQuantity());
        booking.setTotalAmount(selectedCategory.getPrice().multiply(BigDecimal.valueOf(request.getQuantity())));
        booking.setStatus(BookingStatus.PENDING);
        booking.setBookingTime(LocalDateTime.now());

        return bookingRepository.save(booking);
    }

    public List<Booking> getBookingsByUser(String userId) {
        return bookingRepository.findByUserId(userId);
    }
    
    public Optional<Booking> getBookingById(String id) {
        return bookingRepository.findById(id);
    }
}
