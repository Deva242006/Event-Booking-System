package com.example.eventbooking.model;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Embeddable
public class Review {
    private String userId;
    private String userName;
    private int rating;       // 1-5
    @Column(length = 1000)
    private String comment;
    private LocalDateTime createdAt;
}
