package com.example.eventbooking.dto;

import com.example.eventbooking.model.Role;
import lombok.Data;

@Data
public class RegisterRequest {
    private String name;
    private String email;
    private String password;
    private Role role;
}
