import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaChevronLeft, FaChevronRight, FaStar, FaShoppingCart } from 'react-icons/fa';
import { useCart } from '../contexts/CartContext';
import './FeaturedBooks.css';

const FeaturedBooks = ({ books = [], title = "Featured Books", onAddToCart }) => {
  const { addToCart: contextAddToCart } = useCart();
  
  // Use provided onAddToCart function or fallback to contextAddToCart
  const handleAddToCart = async (book) => {
    if (onAddToCart) {
      await onAddToCart(book);
    } else {
      try {
        // Use the CartContext to add item to cart
        await contextAddToCart(book, 1);
        
        // Show success notification
        alert(`${book.title} added to cart!`);
        console.log(`${book.title} added to cart via context`);
      } catch (error) {
        console.error('Error adding to cart via context:', error);
        
        // Provide more detailed error information
        if (error.response) {
          // Server responded with error status
          console.error('Server Error:', error.response.status, error.response.data);
          alert(`Failed to add item to cart. Server error: ${error.response.status}`);
        } else if (error.request) {
          // Request was made but no response received
          console.error('Network Error:', error.request);
          alert('Failed to add item to cart. Please check your connection and try again.');
        } else {
          // Something else happened
          console.error('Error:', error.message);
          alert('Failed to add item to cart. Please try again.');
        }
      }
    }
  };
  const scrollContainerRef = useRef(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);

  // Check scroll position to show/hide arrows
  const checkScrollPosition = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setShowLeftArrow(scrollLeft > 10);
      setShowRightArrow(scrollWidth > clientWidth && scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  useEffect(() => {
    checkScrollPosition();
    window.addEventListener('resize', checkScrollPosition);
    return () => window.removeEventListener('resize', checkScrollPosition);
  }, []);

  const scrollTo = (direction) => {
    if (scrollContainerRef.current) {
      const { scrollLeft, clientWidth } = scrollContainerRef.current;
      const scrollToPosition = direction === 'left' 
        ? scrollLeft - clientWidth 
        : scrollLeft + clientWidth;

      scrollContainerRef.current.scrollTo({
        left: scrollToPosition,
        behavior: 'smooth'
      });

      setTimeout(checkScrollPosition, 300);
    }
  };

  // Handle drag to scroll
  const handleMouseDown = (e) => {
    const startX = e.pageX - scrollContainerRef.current.offsetLeft;
    const scrollLeft = scrollContainerRef.current.scrollLeft;

    const handleMouseMove = (e) => {
      e.preventDefault();
      const x = e.pageX - scrollContainerRef.current.offsetLeft;
      const walk = (x - startX) * 2; // Scroll multiplier
      scrollContainerRef.current.scrollLeft = scrollLeft - walk;
    };

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      checkScrollPosition();
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleTouchStart = (e) => {
    const startY = e.touches[0].pageX - scrollContainerRef.current.offsetLeft;
    const scrollLeft = scrollContainerRef.current.scrollLeft;

    const handleTouchMove = (e) => {
      e.preventDefault();
      const y = e.touches[0].pageX - scrollContainerRef.current.offsetLeft;
      const walk = (y - startY) * 2; // Scroll multiplier
      scrollContainerRef.current.scrollLeft = scrollLeft - walk;
    };

    const handleTouchEnd = () => {
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
      checkScrollPosition();
    };

    document.addEventListener('touchmove', handleTouchMove);
    document.addEventListener('touchend', handleTouchEnd);
  };



  // If no books, return null
  if (!books || books.length === 0) {
    return null;
  }
  
  return (
    <div className="featured-books-horizontal-container">
      <div className="featured-books-wrapper">
        {showLeftArrow && (
          <button 
            className="scroll-arrow left-arrow"
            onClick={() => scrollTo('left')}
            aria-label="Scroll left"
          >
            <FaChevronLeft />
          </button>
        )}
        
        <div
          ref={scrollContainerRef}
          className="books-horizontal-scroll"
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
          onScroll={checkScrollPosition}
        >
          {books.map((book, index) => (
            <motion.div
              key={book.id || book.bookId || index}
              className="book-card card"
              whileHover={{ 
                y: -10, 
                scale: 1.03,
                boxShadow: "0 20px 40px rgba(0, 0, 0, 0.15)"
              }}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              dragConstraints={{ left: 0, right: 0 }}
            >
              <div className="book-image">
                <img 
                  src={book.imageUrl || book.image_url || "https://via.placeholder.com/300x450.png?text=Book+Cover"} 
                  alt={`Cover of ${book.title} by ${book.author}`} 
                  className="book-cover"
                  loading="lazy"
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/300x450.png?text=No+Image';
                  }}
                />
              </div>
              
              <div className="book-info">
                <h3 className="book-title">{book.title}</h3>
                <p className="book-author">by {book.author}</p>
                
                <div className="book-meta d-flex justify-between align-center mt-2">
                  <span className="book-genre">{book.category || book.genre}</span>
                  <div className="book-rating">
                    <FaStar className="star-icon" color="#ffc107" />
                    <span className="rating-value">{book.rating || '4.5'}</span>
                  </div>
                </div>
                
                <div className="book-price mt-3">
                  <span className="price">${book.price}</span>
                </div>
                
                <button 
                  className="btn btn-primary w-full mt-4"
                  onClick={() => handleAddToCart(book)}
                >
                  <FaShoppingCart /> Add to Cart
                </button>
              </div>
            </motion.div>
          ))}
        </div>
        
        {showRightArrow && (
          <button 
            className="scroll-arrow right-arrow"
            onClick={() => scrollTo('right')}
            aria-label="Scroll right"
          >
            <FaChevronRight />
          </button>
        )}
      </div>
    </div>
  );
};

export default FeaturedBooks;