package com.example.eventbooking.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
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
}
