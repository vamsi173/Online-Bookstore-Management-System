package com.bookstore.repository;

import com.bookstore.model.OrderItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderItemRepository extends JpaRepository<OrderItem, Long> {
    
    @Query("SELECT oi FROM OrderItem oi WHERE oi.order.orderId = :orderId")
    List<OrderItem> findByOrderId(@Param("orderId") Long orderId);
    
    @Query("SELECT oi FROM OrderItem oi WHERE oi.order.user.userId = :userId")
    List<OrderItem> findByUserId(@Param("userId") Long userId);
    
    @Query("SELECT SUM(oi.quantity) FROM OrderItem oi WHERE oi.book.bookId = :bookId")
    Integer getTotalQuantitySoldByBookId(@Param("bookId") Long bookId);
    
    @Query("SELECT oi.book.bookId, SUM(oi.quantity) FROM OrderItem oi GROUP BY oi.book.bookId ORDER BY SUM(oi.quantity) DESC")
    List<Object[]> findTopSellingBooks();
}