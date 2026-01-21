package com.bookstore.controller;

import com.bookstore.model.Book;
import com.bookstore.model.Cart;
import com.bookstore.model.User;
import com.bookstore.service.CartService;
import com.bookstore.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/cart")
@CrossOrigin(origins = "*")
public class CartController {

    @Autowired
    private CartService cartService;
    
    @Autowired
    private UserService userService;

    @GetMapping("/{userId}")
    public ResponseEntity<List<Cart>> getCartItems(@PathVariable Long userId) {
        List<Cart> cartItems = cartService.getCartItemsByUserId(userId);
        return ResponseEntity.ok(cartItems);
    }

    @PostMapping
    public ResponseEntity<Cart> addToCart(@RequestBody Cart cart) {
        // Get user by ID if provided, otherwise try by email
        User user;
        if (cart.getUser().getUserId() != null) {
            Optional<User> userOpt = userService.findById(cart.getUser().getUserId());
            if (!userOpt.isPresent()) {
                return ResponseEntity.badRequest().build();
            }
            user = userOpt.get();
        } else if (cart.getUser().getEmail() != null) {
            Optional<User> userOpt = userService.findByEmail(cart.getUser().getEmail());
            if (!userOpt.isPresent()) {
                return ResponseEntity.badRequest().build();
            }
            user = userOpt.get();
        } else {
            return ResponseEntity.badRequest().build();
        }
        
        // Set the user from database to ensure we're using the correct user entity
        cart.setUser(user);
        
        // Check if item already exists in cart
        Cart existingCartItem = cartService.getCartItem(user.getUserId(), cart.getBook().getBookId());
        if (existingCartItem != null) {
            // Update quantity instead of creating new entry
            existingCartItem.setQuantity(existingCartItem.getQuantity() + cart.getQuantity());
            Cart updatedCart = cartService.addToCart(existingCartItem);
            return ResponseEntity.ok(updatedCart);
        }
        
        Cart savedCart = cartService.addToCart(cart);
        return ResponseEntity.ok(savedCart);
    }

    @PutMapping("/{userId}/item/{bookId}")
    public ResponseEntity<Cart> updateCartItem(@PathVariable Long userId, @PathVariable Long bookId, @RequestBody Cart updatedCart) {
        // Try to update existing item first
        Cart updated = cartService.updateCartItemQuantity(userId, bookId, updatedCart.getQuantity());
        
        // If item doesn't exist, create it
        if (updated == null) {
            // Get user and book
            Optional<User> userOpt = userService.findById(userId);
            if (!userOpt.isPresent()) {
                return ResponseEntity.badRequest().build();
            }
            
            User user = userOpt.get();
            
            // Create new cart item
            Cart newCartItem = new Cart();
            newCartItem.setUser(user);
            newCartItem.setBook(new Book());
            newCartItem.getBook().setBookId(bookId);
            newCartItem.setQuantity(updatedCart.getQuantity());
            
            updated = cartService.addToCart(newCartItem);
        }
        
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{userId}/item/{bookId}")
    public ResponseEntity<Void> removeFromCart(@PathVariable Long userId, @PathVariable Long bookId) {
        cartService.removeFromCart(userId, bookId);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{userId}/clear")
    public ResponseEntity<Void> clearCart(@PathVariable Long userId) {
        List<Cart> cartItems = cartService.getCartItemsByUserId(userId);
        for (Cart cartItem : cartItems) {
            cartService.removeFromCart(userId, cartItem.getBook().getBookId());
        }
        return ResponseEntity.noContent().build();
    }
}