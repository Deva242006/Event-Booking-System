package com.example.eventbooking.service;

import com.example.eventbooking.model.Venue;
import com.example.eventbooking.repository.VenueRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
public class VenueService {

    @Autowired
    private VenueRepository venueRepository;

    public Venue createVenue(Venue venue) {
        return venueRepository.save(venue);
    }

    public List<Venue> getAllVenues() {
        return venueRepository.findAll();
    }

    public Optional<Venue> getVenueById(String id) {
        return venueRepository.findById(id);
    }

    public Venue updateVenue(String id, Venue venueDetails) {
        return venueRepository.findById(id).map(venue -> {
            venue.setName(venueDetails.getName());
            venue.setLocation(venueDetails.getLocation());
            venue.setCapacity(venueDetails.getCapacity());
            venue.setSectionCapacities(venueDetails.getSectionCapacities());
            return venueRepository.save(venue);
        }).orElseThrow(() -> new RuntimeException("Venue not found with id: " + id));
    }

    public void deleteVenue(String id) {
        venueRepository.deleteById(id);
    }
}
