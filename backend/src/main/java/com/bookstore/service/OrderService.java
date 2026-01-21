package com.bookstore.service;

import com.bookstore.model.Order;
import com.bookstore.repository.OrderRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class OrderService {

    @Autowired
    private OrderRepository orderRepository;

    public List<Order> getOrdersByUserId(Long userId) {
        return orderRepository.findByUserUserId(userId);
    }

    public Order saveOrder(Order order) {
        return orderRepository.save(order);
    }
}