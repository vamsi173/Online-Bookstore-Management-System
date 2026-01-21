package com.bookstore.controller;

import com.bookstore.model.*;
import com.bookstore.service.CartService;
import com.bookstore.service.OrderItemService;
import com.bookstore.service.OrderService;
import com.bookstore.service.UserService;
import com.bookstore.service.EmailService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/checkout")
@CrossOrigin(origins = "*")
public class CheckoutController {

    @Autowired
    private CartService cartService;
    
    @Autowired
    private OrderService orderService;
    
    @Autowired
    private OrderItemService orderItemService;
    
    @Autowired
    private UserService userService;
    
    @Autowired
    private EmailService emailService;

    @PostMapping("/process")
    @Transactional
    public ResponseEntity<?> processCheckout(@Valid @RequestBody CheckoutRequest checkoutRequest, org.springframework.validation.BindingResult bindingResult) {
        System.out.println("Received checkout request: " + checkoutRequest.getUserId()); // Debug log
        
        if (bindingResult.hasErrors()) {
            StringBuilder errors = new StringBuilder();
            bindingResult.getAllErrors().forEach(error -> {
                errors.append(error.getDefaultMessage()).append("; ");
            });
            return ResponseEntity.badRequest().body("Validation failed: " + errors.toString());
        }
        
        // Additional validation for payment method and card details
        String paymentMethod = checkoutRequest.getPaymentMethod();
        if ("card".equals(paymentMethod)) {
            if (checkoutRequest.getCardNumber() == null || checkoutRequest.getCardNumber().trim().isEmpty()) {
                return ResponseEntity.badRequest().body("Validation failed: Card number is required for card payment.");
            }
            if (checkoutRequest.getExpiryDate() == null || checkoutRequest.getExpiryDate().trim().isEmpty()) {
                return ResponseEntity.badRequest().body("Validation failed: Expiry date is required for card payment.");
            }
            if (checkoutRequest.getCvv() == null || checkoutRequest.getCvv().trim().isEmpty()) {
                return ResponseEntity.badRequest().body("Validation failed: CVV is required for card payment.");
            }
            
            // Validate card number format (basic validation)
            String cardNumber = checkoutRequest.getCardNumber().replaceAll("\\s+", "");
            if (!cardNumber.matches("^\\d{16}$")) {
                return ResponseEntity.badRequest().body("Validation failed: Card number must be 16 digits.");
            }
            
            // Validate expiry date format
            if (!checkoutRequest.getExpiryDate().matches("^(0[1-9]|1[0-2])\\/?([0-9]{2})$")) {
                return ResponseEntity.badRequest().body("Validation failed: Expiry date must be in MM/YY format.");
            }
            
            // Validate CVV format
            if (!checkoutRequest.getCvv().matches("^\\d{3}$")) {
                return ResponseEntity.badRequest().body("Validation failed: CVV must be 3 digits.");
            }
        }
        
        try {
            System.out.println("Processing checkout request for userId: " + checkoutRequest.getUserId() + ", email: " + checkoutRequest.getEmail());
            
            // Get the authenticated user from security context
            User authenticatedUser = null;
            String authenticatedUsername = null;
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication != null && authentication.isAuthenticated() && !(authentication instanceof AnonymousAuthenticationToken)) {
                authenticatedUsername = authentication.getName(); // This is the email
                authenticatedUser = userService.findByEmail(authenticatedUsername).orElse(null);
            }
            
            // Verify user is authenticated
            if (authenticatedUser == null) {
                System.out.println("No authenticated user found");
                return ResponseEntity.status(401).body("Unauthorized: Please log in to place an order");
            }
            
            // Get user by userId if provided, otherwise fall back to email
            User user;
            if (checkoutRequest.getUserId() != null) {
                // If userId is provided in the request, verify it matches the authenticated user
                user = userService.findById(checkoutRequest.getUserId())
                        .orElseThrow(() -> new RuntimeException("User not found with ID: " + checkoutRequest.getUserId()));
                
                // Verify that the requested user matches the authenticated user
                if (!authenticatedUser.getUserId().equals(user.getUserId())) {
                    System.out.println("Unauthorized access attempt: authenticated user ID " + authenticatedUser.getUserId() + 
                                      " trying to place order for user ID " + user.getUserId());
                    return ResponseEntity.status(403).body("Access denied: You can only place orders for yourself");
                }
                
                System.out.println("Found user by ID: " + user.getEmail() + ", authenticated user matches");
            } else if (checkoutRequest.getEmail() != null) {
                // If email is provided in the request, verify it matches the authenticated user
                user = userService.findByEmail(checkoutRequest.getEmail())
                        .orElseThrow(() -> new RuntimeException("User not found with email: " + checkoutRequest.getEmail()));
                
                // Verify that the requested user matches the authenticated user
                if (!authenticatedUser.getUserId().equals(user.getUserId())) {
                    System.out.println("Unauthorized access attempt: authenticated user ID " + authenticatedUser.getUserId() + 
                                      " trying to place order for user email " + user.getEmail());
                    return ResponseEntity.status(403).body("Access denied: You can only place orders for yourself");
                }
                
                System.out.println("Found user by email: " + user.getEmail() + ", authenticated user matches");
            } else {
                // Neither userId nor email provided in request, use the authenticated user
                user = authenticatedUser;
                System.out.println("Using authenticated user: " + user.getEmail());
            }
            
            // Log for debugging purposes
            System.out.println("Successfully verified user: " + user.getEmail() + ", user ID: " + user.getUserId());
            
            System.out.println("Authentication check passed: authenticated user has permission to place order");
            
            // Determine the email to send the confirmation to - prioritize email from checkout request if provided
            String confirmationEmail = checkoutRequest.getEmail() != null ? checkoutRequest.getEmail() : user.getEmail();
            System.out.println("Using confirmation email: " + confirmationEmail + " (from checkout request: " + checkoutRequest.getEmail() + ", user email: " + user.getEmail() + ")");
            
            // Get cart items for the user
            List<Cart> cartItems = cartService.getCartItemsByUserId(user.getUserId());
            System.out.println("Found " + cartItems.size() + " cart items for user " + user.getUserId());
            
            if (cartItems.isEmpty()) {
                System.out.println("Cart is empty for user " + user.getUserId());
                return ResponseEntity.badRequest().body("Cart is empty");
            }
            
            // Calculate total amount
            double totalAmount = 0.0;
            for (Cart cartItem : cartItems) {
                totalAmount += cartItem.getBook().getPrice() * cartItem.getQuantity();
                System.out.println("Adding item to order: " + cartItem.getBook().getTitle() + ", qty: " + cartItem.getQuantity() + ", price: " + cartItem.getBook().getPrice());
            }
            System.out.println("Calculated total amount: " + totalAmount);
            
            // Create order
            Order order = new Order();
            order.setUser(user);
            order.setTotalAmount(totalAmount);
            order.setOrderStatus("PENDING");
            
            // Save the order
            Order savedOrder = orderService.saveOrder(order);
            System.out.println("Saved order with ID: " + savedOrder.getOrderId());
            
            // Create order items from cart items
            List<OrderItem> orderItems = new ArrayList<>();
            for (Cart cartItem : cartItems) {
                OrderItem orderItem = new OrderItem();
                orderItem.setOrder(savedOrder);
                orderItem.setBook(cartItem.getBook());
                orderItem.setQuantity(cartItem.getQuantity());
                orderItem.setPrice(cartItem.getBook().getPrice());
                
                orderItems.add(orderItem);
            }
            
            // Save all order items
            orderItemService.saveOrderItems(orderItems);
            System.out.println("Saved " + orderItems.size() + " order items");
            
            // Clear the cart after successful checkout
            for (Cart cartItem : cartItems) {
                cartService.removeFromCart(user.getUserId(), cartItem.getBook().getBookId());
                System.out.println("Removed item from cart: " + cartItem.getBook().getBookId());
            }
            
            // Send order confirmation email to both user's registered email and shipping address email
            try {
                emailService.sendOrderConfirmationEmailToBoth(user, savedOrder, orderItems, confirmationEmail);
                System.out.println("Order confirmation email sent successfully to both user: " + user.getEmail() + " and shipping address: " + confirmationEmail);
            } catch (Exception e) {
                System.err.println("Failed to send order confirmation email: " + e.getMessage());
                System.err.println("NOTE: Email delivery may have failed due to Gmail security policies or spam filters.");
                System.err.println("The order has been placed successfully, but the confirmation email might not be received.");
                e.printStackTrace();
                // Continue with response even if email fails
            }
            
            // Create response with order details
            CheckoutResponse response = new CheckoutResponse();
            response.setSuccess(true);
            response.setMessage("Order placed successfully!");
            response.setOrderId(savedOrder.getOrderId());
            response.setTotalAmount(totalAmount);
            response.setOrderDate(new Date());
            
            System.out.println("Order placed successfully! Order ID: " + savedOrder.getOrderId());
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            System.err.println("Runtime exception in checkout: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().body("Error processing checkout: " + e.getMessage());
        } catch (Exception e) {
            System.err.println("Unexpected error in checkout: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body("Internal server error: " + e.getMessage());
        }
    }
    
    // DTOs for checkout request/response
    public static class CheckoutRequest {
        private Long userId;
        
        @Email(message = "Email should be valid")
        private String email;
        
        @NotBlank(message = "First name is required")
        private String firstName;
        
        @NotBlank(message = "Last name is required")
        private String lastName;
        
        @NotBlank(message = "Address is required")
        private String address;
        
        @NotBlank(message = "City is required")
        private String city;
        
        @NotBlank(message = "ZIP code is required")
        private String zipCode;
        
        @NotBlank(message = "Country is required")
        private String country;
        
        @NotBlank(message = "Phone is required")
        @Pattern(regexp = "^\\+?[1-9]\\d{1,14}$", message = "Phone number should be valid")
        private String phone;
        
        @NotBlank(message = "Payment method is required")
        private String paymentMethod;
        
        private String cardNumber;
        private String expiryDate;
        private String cvv;
        
        // getters and setters
        public Long getUserId() { return userId; }
        public void setUserId(Long userId) { this.userId = userId; }
        
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        
        public String getFirstName() { return firstName; }
        public void setFirstName(String firstName) { this.firstName = firstName; }
        
        public String getLastName() { return lastName; }
        public void setLastName(String lastName) { this.lastName = lastName; }
        
        public String getAddress() { return address; }
        public void setAddress(String address) { this.address = address; }
        
        public String getCity() { return city; }
        public void setCity(String city) { this.city = city; }
        
        public String getZipCode() { return zipCode; }
        public void setZipCode(String zipCode) { this.zipCode = zipCode; }
        
        public String getCountry() { return country; }
        public void setCountry(String country) { this.country = country; }
        
        public String getPhone() { return phone; }
        public void setPhone(String phone) { this.phone = phone; }
        
        public String getPaymentMethod() { return paymentMethod; }
        public void setPaymentMethod(String paymentMethod) { this.paymentMethod = paymentMethod; }
        
        public String getCardNumber() { return cardNumber; }
        public void setCardNumber(String cardNumber) { this.cardNumber = cardNumber; }
        
        public String getExpiryDate() { return expiryDate; }
        public void setExpiryDate(String expiryDate) { this.expiryDate = expiryDate; }
        
        public String getCvv() { return cvv; }
        public void setCvv(String cvv) { this.cvv = cvv; }
    }
    
    public static class CheckoutResponse {
        private boolean success;
        private String message;
        private Long orderId;
        private double totalAmount;
        private Date orderDate;
        
        // getters and setters
        public boolean isSuccess() { return success; }
        public void setSuccess(boolean success) { this.success = success; }
        
        public String getMessage() { return message; }
        public void setMessage(String message) { this.message = message; }
        
        public Long getOrderId() { return orderId; }
        public void setOrderId(Long orderId) { this.orderId = orderId; }
        
        public double getTotalAmount() { return totalAmount; }
        public void setTotalAmount(double totalAmount) { this.totalAmount = totalAmount; }
        
        public Date getOrderDate() { return orderDate; }
        public void setOrderDate(Date orderDate) { this.orderDate = orderDate; }
    }
}