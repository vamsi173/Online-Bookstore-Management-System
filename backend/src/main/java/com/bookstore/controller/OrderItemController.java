package com.bookstore.controller;

import com.bookstore.model.OrderItem;
import com.bookstore.repository.OrderItemRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/order-items")
@CrossOrigin(origins = "*")
public class OrderItemController {

    @Autowired
    private OrderItemRepository orderItemRepository;

    @GetMapping
    public ResponseEntity<List<OrderItem>> getAllOrderItems() {
        List<OrderItem> orderItems = orderItemRepository.findAll();
        return ResponseEntity.ok(orderItems);
    }

    @GetMapping("/order/{orderId}")
    public ResponseEntity<List<OrderItem>> getOrderItemsByOrderId(@PathVariable Long orderId) {
        List<OrderItem> orderItems = orderItemRepository.findByOrderId(orderId);
        return ResponseEntity.ok(orderItems);
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<OrderItem>> getOrderItemsByUserId(@PathVariable Long userId) {
        List<OrderItem> orderItems = orderItemRepository.findByUserId(userId);
        return ResponseEntity.ok(orderItems);
    }
}