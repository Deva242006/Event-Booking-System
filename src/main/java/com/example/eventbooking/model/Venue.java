package com.example.eventbooking.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.GeoSpatialIndexType;
import org.springframework.data.mongodb.core.index.GeoSpatialIndexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.Map;

@Data
@Document(collection = "venues")
public class Venue {
    @Id
    private String id;
    private String name;
    private String location;
    private int capacity;
    private Map<String, Integer> sectionCapacities;

    // Geospatial coordinates [longitude, latitude] — GeoJSON Point format required by MongoDB $near
    @GeoSpatialIndexed(type = GeoSpatialIndexType.GEO_2DSPHERE)
    private double[] coordinates; // [longitude, latitude]

    // Convenience setters for lat/lng
    public void setLatLng(double latitude, double longitude) {
        this.coordinates = new double[]{longitude, latitude};
    }

    public Double getLatitude() {
        return (coordinates != null && coordinates.length >= 2) ? coordinates[1] : null;
    }

    public Double getLongitude() {
        return (coordinates != null && coordinates.length >= 2) ? coordinates[0] : null;
    }
}
