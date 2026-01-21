package com.bookstore.service;

import com.bookstore.model.Cart;
import com.bookstore.repository.CartRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CartService {

    @Autowired
    private CartRepository cartRepository;

    public List<Cart> getCartItemsByUserId(Long userId) {
        return cartRepository.findByUserUserId(userId);
    }

    public Cart addToCart(Cart cart) {
        return cartRepository.save(cart);
    }

    public void removeFromCart(Long userId, Long bookId) {
        cartRepository.deleteByUserUserIdAndBookBookId(userId, bookId);
    }

    public Cart getCartItem(Long userId, Long bookId) {
        return cartRepository.findByUserUserIdAndBookBookId(userId, bookId);
    }
    
    public Cart updateCartItemQuantity(Long userId, Long bookId, Integer quantity) {
        Cart cartItem = getCartItem(userId, bookId);
        if (cartItem != null) {
            cartItem.setQuantity(quantity);
            return cartRepository.save(cartItem);
        }
        return null;
    }
}