package com.bookstore.controller;

import com.bookstore.model.Book;
import com.bookstore.model.Order;
import com.bookstore.model.User;
import com.bookstore.repository.BookRepository;
import com.bookstore.repository.OrderRepository;
import com.bookstore.repository.UserRepository;
import com.bookstore.repository.OrderItemRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.math.BigDecimal;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "*")
public class AdminController {

    @Autowired
    private BookRepository bookRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private OrderRepository orderRepository;
    
    @Autowired
    private OrderItemRepository orderItemRepository;
    
    private static final String UPLOAD_DIR = "uploads/";

    // Get dashboard statistics
    @GetMapping("/dashboard/stats")
    public ResponseEntity<Map<String, Object>> getDashboardStats() {
        Map<String, Object> stats = new HashMap<>();
        
        // Total counts
        stats.put("totalBooks", bookRepository.count());
        stats.put("totalUsers", userRepository.count());
        stats.put("totalOrders", orderRepository.count());
        
        // Total revenue calculation
        List<Order> orders = orderRepository.findAll();
        Double totalRevenue = orders.stream()
                .mapToDouble(order -> order.getTotalAmount() != null ? order.getTotalAmount() : 0.0)
                .sum();
        stats.put("totalRevenue", totalRevenue);
        
        return ResponseEntity.ok(stats);
    }

    // Get recent orders (last 5)
    @GetMapping("/dashboard/recent-orders")
    public ResponseEntity<List<Order>> getRecentOrders() {
        List<Order> orders = orderRepository.findAll();
        // Sort by date descending and take the last 5
        orders.sort((o1, o2) -> {
            LocalDateTime d1 = o1.getCreatedAt() != null ? o1.getCreatedAt() : LocalDateTime.now();
            LocalDateTime d2 = o2.getCreatedAt() != null ? o2.getCreatedAt() : LocalDateTime.now();
            return d2.compareTo(d1);
        });
        if (orders.size() > 5) {
            orders = orders.subList(0, 5);
        }
        return ResponseEntity.ok(orders);
    }

    // Get top selling books
    @GetMapping("/dashboard/top-selling")
    public ResponseEntity<List<Book>> getTopSellingBooks() {
        try {
            // Get all order items to calculate sales
            List<Object[]> topBooksResult = orderItemRepository.findTopSellingBooks();
            
            // Extract book IDs from the results
            List<Long> bookIds = topBooksResult.stream()
                    .map(result -> ((Number) result[0]).longValue())
                    .collect(java.util.stream.Collectors.toList());
            
            // Get the actual book entities
            List<Book> topBooks = bookRepository.findAllById(bookIds);
            
            // Sort the books according to the sales volume
            java.util.Map<Long, Book> bookMap = topBooks.stream()
                    .collect(java.util.stream.Collectors.toMap(Book::getBookId, book -> book));
            
            List<Book> sortedTopBooks = bookIds.stream()
                    .map(bookMap::get)
                    .filter(book -> book != null)
                    .limit(5) // Return top 5
                    .collect(java.util.stream.Collectors.toList());
            
            return ResponseEntity.ok(sortedTopBooks);
        } catch (Exception e) {
            // Fallback to all books if there's an error
            List<Book> books = bookRepository.findAll();
            if (books.size() > 5) {
                books = books.subList(0, 5);
            }
            return ResponseEntity.ok(books);
        }
    }

    // Get performance metrics for last 7 days
    @GetMapping("/dashboard/performance")
    public ResponseEntity<Map<String, Object>> getPerformanceMetrics() {
        Map<String, Object> metrics = new HashMap<>();
        
        LocalDate sevenDaysAgo = LocalDate.now().minus(7, ChronoUnit.DAYS);
        LocalDateTime startOfSevenDays = sevenDaysAgo.atStartOfDay();
        
        List<Order> orders = orderRepository.findAll();
        long ordersLast7Days = orders.stream()
                .filter(order -> {
                    LocalDateTime orderDate = order.getCreatedAt() != null ? order.getCreatedAt() : LocalDateTime.now();
                    return orderDate.isAfter(startOfSevenDays);
                })
                .count();
        
        Double revenueLast7Days = orders.stream()
                .filter(order -> {
                    LocalDateTime orderDate = order.getCreatedAt() != null ? order.getCreatedAt() : LocalDateTime.now();
                    return orderDate.isAfter(startOfSevenDays);
                })
                .mapToDouble(order -> order.getTotalAmount() != null ? order.getTotalAmount() : 0.0)
                .sum();
        
        metrics.put("ordersLast7Days", ordersLast7Days);
        metrics.put("revenueLast7Days", revenueLast7Days);
        metrics.put("avgOrderValue", ordersLast7Days > 0 ? 
            revenueLast7Days / ordersLast7Days : 0.0);
        
        return ResponseEntity.ok(metrics);
    }
    
    @PostMapping("/books/upload-image")
    public ResponseEntity<Map<String, String>> uploadBookImage(@RequestParam("image") MultipartFile file) {
        try {
            // Create upload directory if it doesn't exist
            Path uploadPath = Paths.get(UPLOAD_DIR);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }
            
            // Generate unique filename
            String fileName = System.currentTimeMillis() + "_" + file.getOriginalFilename();
            Path filePath = uploadPath.resolve(fileName);
            
            // Save the file
            file.transferTo(filePath.toFile());
            
            // Return the image URL
            String imageUrl = "/" + UPLOAD_DIR + fileName;
            Map<String, String> response = new HashMap<>();
            response.put("imageUrl", imageUrl);
            
            return ResponseEntity.ok(response);
        } catch (IOException e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to upload image: " + e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }
    
    // Get all statistics for the dashboard
    @GetMapping("/dashboard")
    public ResponseEntity<Map<String, Object>> getFullDashboardData() {
        Map<String, Object> dashboardData = new HashMap<>();
        
        // Add all dashboard components
        dashboardData.put("stats", getDashboardStats().getBody());
        dashboardData.put("recentOrders", getRecentOrders().getBody());
        dashboardData.put("topSelling", getTopSellingBooks().getBody());
        dashboardData.put("performance", getPerformanceMetrics().getBody());
        
        return ResponseEntity.ok(dashboardData);
    }
}