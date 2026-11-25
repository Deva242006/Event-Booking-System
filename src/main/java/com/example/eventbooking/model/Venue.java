package com.example.eventbooking.model;

import jakarta.persistence.*;
import lombok.Data;

import java.util.Map;

@Data
@Entity
@Table(name = "venues")
public class Venue {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;
    
    private String name;
    private String location;
    private int capacity;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "venue_section_capacities", joinColumns = @JoinColumn(name = "venue_id"))
    @MapKeyColumn(name = "section_name")
    @Column(name = "section_capacity")
    private Map<String, Integer> sectionCapacities;

    private Double latitude;
    private Double longitude;

    // Geospatial coordinates [longitude, latitude] — preserved for JSON API compatibility
    public double[] getCoordinates() {
        if (longitude != null && latitude != null) {
            return new double[]{longitude, latitude};
        }
        return null;
    }

    public void setCoordinates(double[] coordinates) {
        if (coordinates != null && coordinates.length >= 2) {
            this.longitude = coordinates[0];
            this.latitude = coordinates[1];
        }
    }

    // Convenience setters for lat/lng
    public void setLatLng(double latitude, double longitude) {
        this.latitude = latitude;
        this.longitude = longitude;
    }

    public Double getLatitude() {
        return latitude;
    }

    public Double getLongitude() {
        return longitude;
    }
}
