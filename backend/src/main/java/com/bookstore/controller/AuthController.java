package com.bookstore.controller;

import com.bookstore.model.Role;
import com.bookstore.model.User;
import com.bookstore.repository.UserRepository;
import com.bookstore.security.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private UserDetailsService userDetailsService;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> loginRequest) {
        String email = loginRequest.get("email");
        String password = loginRequest.get("password");

        try {
            // Authenticate user
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(email, password)
            );

            final UserDetails userDetails = userDetailsService.loadUserByUsername(email);
            Optional<User> userOpt = userRepository.findByEmail(email);
            
            if (userOpt.isPresent()) {
                User user = userOpt.get();
                String role = user.getRole().name();
                final String token = jwtUtil.generateToken(userDetails, role);
                
                Map<String, String> response = new HashMap<>();
                response.put("token", token);
                response.put("role", role);
                response.put("message", "Login successful");
                response.put("userId", user.getUserId().toString());
                response.put("name", user.getName());
                response.put("email", user.getEmail());
                return ResponseEntity.ok(response);
            } else {
                return ResponseEntity.badRequest().body(Map.of("message", "User not found"));
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", "Invalid credentials"));
        }
    }

    @PostMapping("/admin/login")
    public ResponseEntity<?> adminLogin(@RequestBody Map<String, String> loginRequest) {
        String email = loginRequest.get("email");
        String password = loginRequest.get("password");

        // Check if it's a known admin credential
        if (("vamsi@admin.com".equals(email) || "admin@admin.com".equals(email)) && "vamsi@123".equals(password)) {
            // Create or update admin user
            Optional<User> adminOpt = userRepository.findByEmail(email);
            User admin;
            if (!adminOpt.isPresent()) {
                admin = new User();
                admin.setName("Admin");
                admin.setEmail(email);
                admin.setPassword(passwordEncoder.encode(password));
                admin.setRole(Role.ADMIN);
                userRepository.save(admin);
            } else {
                admin = adminOpt.get();
                // Ensure admin role is set
                if (admin.getRole() != Role.ADMIN) {
                    admin.setRole(Role.ADMIN);
                    userRepository.save(admin);
                }
            }

            // Generate token for admin
            String token = jwtUtil.generateToken(
                new org.springframework.security.core.userdetails.User(
                    email, password, java.util.Collections.emptyList()
                ), 
                "ADMIN"
            );

            Map<String, String> response = new HashMap<>();
            response.put("token", token);
            response.put("role", "ADMIN");
            response.put("message", "Admin login successful");
            response.put("userId", admin.getUserId().toString());
            response.put("name", admin.getName());
            response.put("email", admin.getEmail());
            return ResponseEntity.ok(response);
        }

        return ResponseEntity.badRequest().body(Map.of("message", "Invalid admin credentials"));
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody Map<String, String> registerRequest) {
        try {
            String name = registerRequest.get("name");
            String email = registerRequest.get("email");
            String password = registerRequest.get("password");

            if (userRepository.existsByEmail(email)) {
                return ResponseEntity.badRequest().body(Map.of("message", "Email already exists"));
            }

            User user = new User();
            user.setName(name);
            user.setEmail(email);
            user.setPassword(passwordEncoder.encode(password));
            user.setRole(Role.USER);

            userRepository.save(user);

            Map<String, String> response = new HashMap<>();
            response.put("message", "User registered successfully");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", "Registration failed"));
        }
    }
}