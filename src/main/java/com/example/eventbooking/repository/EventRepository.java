package com.example.eventbooking.repository;

import com.example.eventbooking.model.Event;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface EventRepository extends MongoRepository<Event, String> {
    List<Event> findByOrganizerId(String organizerId);
    List<Event> findByVenueId(String venueId);
    List<Event> findByTitleContainingIgnoreCase(String title);
    List<Event> findByCategory(String category);
    List<Event> findByTitleContainingIgnoreCaseAndCategory(String title, String category);
    List<Event> findBySavedByUserIdsContaining(String userId);
}
