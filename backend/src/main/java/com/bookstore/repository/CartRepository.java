package com.bookstore.repository;

import com.bookstore.model.Cart;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface CartRepository extends JpaRepository<Cart, Long> {
    List<Cart> findByUserUserId(Long userId);
    Cart findByUserUserIdAndBookBookId(Long userId, Long bookId);
    void deleteByUserUserIdAndBookBookId(Long userId, Long bookId);
}