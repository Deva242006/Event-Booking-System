package com.example.eventbooking.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class AuthResponse {
    private String token;
    private String id;      // MongoDB _id — needed for wishlist & review ownership checks
    private String name;
    private String email;
    private String role;
}
