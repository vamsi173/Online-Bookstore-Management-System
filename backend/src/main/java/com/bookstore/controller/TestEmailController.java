package com.bookstore.controller;

import com.bookstore.service.EmailService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/test-email")
// Note: This endpoint will require proper authentication like other endpoints
@CrossOrigin(origins = "*")
public class TestEmailController {

    @Autowired
    private EmailService emailService;

    @GetMapping("/send")
    public ResponseEntity<String> sendTestEmail(@RequestParam String toEmail) {
        try {
            // Create a dummy user and order for testing
            com.bookstore.model.User user = new com.bookstore.model.User();
            user.setName("Test User");
            user.setEmail(toEmail);
            
            com.bookstore.model.Order order = new com.bookstore.model.Order();
            order.setOrderId(999L); // Dummy order ID
            order.setTotalAmount(99.99);
            
            java.util.List<com.bookstore.model.OrderItem> orderItems = new java.util.ArrayList<>();
            
            System.out.println("Attempting to send test email to: " + toEmail);
            
            // Send test email
            emailService.sendOrderConfirmationEmail(user, order, orderItems);
            
            return ResponseEntity.ok("Test email sent successfully to: " + toEmail + 
                                   ". Check your inbox and spam folder. " +
                                   "Also check your SendGrid dashboard for delivery status.");
        } catch (Exception e) {
            System.err.println("Error sending test email: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().body("Failed to send test email: " + e.getMessage());
        }
    }
}