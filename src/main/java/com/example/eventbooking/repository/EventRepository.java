package com.example.eventbooking.repository;

import com.example.eventbooking.model.Event;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface EventRepository extends JpaRepository<Event, String> {
    List<Event> findByOrganizerId(String organizerId);
    List<Event> findByVenueId(String venueId);
    List<Event> findByTitleContainingIgnoreCase(String title);
    List<Event> findByCategory(String category);
    List<Event> findByTitleContainingIgnoreCaseAndCategory(String title, String category);

    @Query("SELECT DISTINCT e FROM Event e JOIN e.savedByUserIds u WHERE u = :userId")
    List<Event> findBySavedByUserIdsContaining(@Param("userId") String userId);
}
