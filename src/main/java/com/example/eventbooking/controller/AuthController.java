package com.example.eventbooking.controller;

import com.example.eventbooking.dto.AuthRequest;
import com.example.eventbooking.dto.AuthResponse;
import com.example.eventbooking.dto.RegisterRequest;
import com.example.eventbooking.model.Role;
import com.example.eventbooking.model.User;
import com.example.eventbooking.repository.UserRepository;
import com.example.eventbooking.security.JwtUtils;
import com.example.eventbooking.security.UserDetailsImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    AuthenticationManager authenticationManager;

    @Autowired
    UserRepository userRepository;

    @Autowired
    PasswordEncoder encoder;

    @Autowired
    JwtUtils jwtUtils;

    @PostMapping("/login")
    public ResponseEntity<?> authenticateUser(@RequestBody AuthRequest loginRequest) {

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequest.getEmail(), loginRequest.getPassword()));

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = jwtUtils.generateJwtToken(authentication);

        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();

        return ResponseEntity.ok(new AuthResponse(
                jwt,
                userDetails.getId(),           // ← BUG FIX: include MongoDB _id
                userDetails.getName(),
                userDetails.getEmail(),
                userDetails.getAuthorities().iterator().next().getAuthority()
        ));
    }

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@RequestBody RegisterRequest signUpRequest) {
        if (userRepository.existsByEmail(signUpRequest.getEmail())) {
            return ResponseEntity.badRequest().body(Map.of("message", "Error: Email is already in use!"));
        }

        User user = new User();
        user.setName(signUpRequest.getName());
        user.setEmail(signUpRequest.getEmail());
        user.setPassword(encoder.encode(signUpRequest.getPassword()));

        if (signUpRequest.getRole() != null) {
            user.setRole(signUpRequest.getRole());
        } else {
            user.setRole(Role.USER);
        }

        userRepository.save(user);

        return ResponseEntity.ok(Map.of("message", "User registered successfully!"));
    }

    /**
     * Returns the currently authenticated user's profile info.
     * Used by the frontend Profile page.
     */
    @GetMapping("/me")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> getCurrentUser(Authentication authentication) {
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        return ResponseEntity.ok(Map.of(
                "id", userDetails.getId(),
                "name", userDetails.getName(),
                "email", userDetails.getEmail(),
                "role", userDetails.getAuthorities().iterator().next().getAuthority()
        ));
    }
}
