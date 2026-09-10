package com.example.eventbooking.model;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class Review {
    private String userId;
    private String userName;
    private int rating;       // 1-5
    private String comment;
    private LocalDateTime createdAt;
}
