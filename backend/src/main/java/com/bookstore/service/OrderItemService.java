package com.bookstore.service;

import com.bookstore.model.OrderItem;
import com.bookstore.repository.OrderItemRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class OrderItemService {

    @Autowired
    private OrderItemRepository orderItemRepository;

    public OrderItem saveOrderItem(OrderItem orderItem) {
        return orderItemRepository.save(orderItem);
    }

    public List<OrderItem> saveOrderItems(List<OrderItem> orderItems) {
        return orderItemRepository.saveAll(orderItems);
    }

    public List<OrderItem> getOrderItemsByOrderId(Long orderId) {
        return orderItemRepository.findByOrderId(orderId);
    }
}