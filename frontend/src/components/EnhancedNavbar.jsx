import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FaShoppingCart, FaUser, FaSignOutAlt, FaSearch, FaBook, FaStar, FaFire, FaTag, FaBell, FaAngleDown } from 'react-icons/fa';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';

const EnhancedNavbar = () => {
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  
  const location = useLocation();
  const navigate = useNavigate();
  const searchInputRef = useRef(null);
  const profileRef = useRef(null);
  
  const { cartItems = [], getTotalItems } = useCart();
  const { isLoggedIn = false, user = null, logout } = useAuth();

  // Handle clicks outside to close dropdowns
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Debounce utility function
  function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce(async (query) => {
      if (query.trim().length > 0) {
        setIsSearching(true);
        // Simulate API call - replace with actual search API
        setTimeout(() => {
          // Mock search results - replace with actual search results
          const mockResults = [
            { id: 1, title: 'Sample Book 1', author: 'Author 1', price: 29.99 },
            { id: 2, title: 'Sample Book 2', author: 'Author 2', price: 39.99 },
            { id: 3, title: 'Sample Book 3', author: 'Author 3', price: 19.99 },
          ];
          setSearchResults(mockResults);
          setIsSearching(false);
        }, 300);
      } else {
        setSearchResults([]);
      }
    }, 300),
    []
  );

  useEffect(() => {
    debouncedSearch(searchQuery);
  }, [searchQuery, debouncedSearch]);

  // Handle search submission
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
      setSearchResults([]);
      setIsSearchFocused(false);
    }
  };

  // Handle logout
  const handleLogout = () => {
    logout();
    setIsProfileDropdownOpen(false);
    navigate('/');
  };

  // Animation variants
  const navbarVariants = {
    hidden: { y: -100 },
    visible: { 
      y: 0,
      transition: { 
        duration: 0.5,
        ease: "easeOut"
      }
    }
  };

  const menuItemVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        duration: 0.3,
        ease: "easeOut"
      }
    }
  };

  // Calculate cart item count
  const cartItemCount = getTotalItems ? getTotalItems() : cartItems.reduce((total, item) => total + item.quantity, 0);

  return (
    <motion.nav 
      className="enhanced-navbar"
      variants={navbarVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="navbar-container">
        {/* Logo with subtle animation */}
        <Link to="/" className="logo">
          <motion.div
            className="logo-container"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            animate={{ rotate: [0, 2, -2, 0] }}
            transition={{ duration: 4, repeat: Infinity, repeatType: "reverse" }}
          >
            <FaBook className="logo-icon" />
            <span className="logo-text">📚 BookStore</span>
          </motion.div>
        </Link>

        {/* Desktop Navigation */}
        <div className="nav-links desktop-nav">
          <motion.div variants={menuItemVariants} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Link 
              to="/" 
              className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}
            >
              <span className="link-text">Home</span>
              <span className="underline"></span>
            </Link>
          </motion.div>

          <motion.div variants={menuItemVariants} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Link 
              to="/books" 
              className={`nav-link ${location.pathname.includes('/books') ? 'active' : ''}`}
            >
              <span className="link-text">Categories</span>
              <span className="underline"></span>
            </Link>
          </motion.div>

          <motion.div variants={menuItemVariants} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Link 
              to="/books?sortBy=rating" 
              className={`nav-link ${location.pathname.includes('/books') && location.search.includes('rating') ? 'active' : ''}`}
            >
              <span className="link-text">Best Sellers</span>
              <span className="underline"></span>
            </Link>
          </motion.div>

          <motion.div variants={menuItemVariants} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Link 
              to="/books?sortBy=dateAdded" 
              className={`nav-link ${location.pathname.includes('/books') && location.search.includes('dateAdded') ? 'active' : ''}`}
            >
              <span className="link-text">New Arrivals</span>
              <span className="underline"></span>
            </Link>
          </motion.div>
        </div>

        {/* Search Bar */}
        <div className="search-container">
          <form onSubmit={handleSearchSubmit} className="search-form">
            <div className="search-input-wrapper">
              <FaSearch className="search-icon" />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search books..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
                className="search-input"
              />
            </div>
            
            {/* Search Results Dropdown */}
            <AnimatePresence>
              {(isSearchFocused && searchResults.length > 0) && (
                <motion.div 
                  className="search-results-dropdown"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  {searchResults.map((result) => (
                    <Link 
                      key={result.id} 
                      to={`/books/${result.id}`}
                      className="search-result-item"
                      onClick={() => {
                        setSearchResults([]);
                        setIsSearchFocused(false);
                        setSearchQuery('');
                      }}
                    >
                      <div className="result-info">
                        <div className="result-title">{result.title}</div>
                        <div className="result-author">by {result.author}</div>
                        <div className="result-price">${result.price}</div>
                      </div>
                    </Link>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </form>
        </div>

        {/* Right side items */}
        <div className="nav-right">
          {/* Cart with animated badge */}
          <motion.div 
            className="cart-container"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <Link to="/cart" className="cart-link">
              <FaShoppingCart className="cart-icon" />
              {cartItemCount > 0 && (
                <motion.span 
                  className="cart-badge"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 500, damping: 15 }}
                >
                  {cartItemCount}
                </motion.span>
              )}
            </Link>
          </motion.div>

          {/* Authentication buttons - Desktop */}
          <div className="auth-buttons">
            {isLoggedIn ? (
              <>
                {user?.role === 'ADMIN' && (
                  <motion.div variants={menuItemVariants} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Link to="/admin" className="nav-link">
                      <span className="link-text">Admin</span>
                      <span className="underline"></span>
                    </Link>
                  </motion.div>
                )}
                <motion.button
                  className="logout-button"
                  onClick={handleLogout}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <FaSignOutAlt className="logout-icon" />
                  <span>Logout</span>
                </motion.button>
              </>
            ) : (
              <>
                <motion.div variants={menuItemVariants} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link to="/login" className="nav-link">
                    <span className="link-text">Login</span>
                    <span className="underline"></span>
                  </Link>
                </motion.div>
                <motion.div variants={menuItemVariants} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link to="/signup" className="nav-link">
                    <span className="link-text">Sign Up</span>
                    <span className="underline"></span>
                  </Link>
                </motion.div>
              </>
            )}
          </div>

          {/* Profile dropdown */}
          <div className="profile-container" ref={profileRef}>
            <motion.div 
              className="profile-trigger"
              onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <FaUser className="profile-icon" />
              <FaAngleDown className="dropdown-arrow" />
            </motion.div>

            <AnimatePresence>
              {isProfileDropdownOpen && (
                <motion.div 
                  className="profile-dropdown"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  {isLoggedIn ? (
                    <>
                      <div className="user-info">
                        <div className="user-name">Welcome, {user?.name || 'User'}!</div>
                        <div className="user-email">{user?.email}</div>
                      </div>
                      <Link 
                        to="/orders" 
                        className="dropdown-item"
                        onClick={() => setIsProfileDropdownOpen(false)}
                      >
                        My Orders
                      </Link>
                      <Link 
                        to="/profile" 
                        className="dropdown-item"
                        onClick={() => setIsProfileDropdownOpen(false)}
                      >
                        Profile Settings
                      </Link>
                      {user?.role === 'ADMIN' && (
                        <Link 
                          to="/admin" 
                          className="dropdown-item"
                          onClick={() => {
                            setIsProfileDropdownOpen(false);
                            navigate('/admin');
                          }}
                        >
                          Admin Panel
                        </Link>
                      )}
                      <button 
                        className="dropdown-item logout-btn"
                        onClick={handleLogout}
                      >
                        <FaSignOutAlt className="logout-icon" />
                        Logout
                      </button>
                    </>
                  ) : (
                    <>
                      <Link 
                        to="/login" 
                        className="dropdown-item"
                        onClick={() => setIsProfileDropdownOpen(false)}
                      >
                        Login
                      </Link>
                      <Link 
                        to="/signup" 
                        className="dropdown-item"
                        onClick={() => setIsProfileDropdownOpen(false)}
                      >
                        Sign Up
                      </Link>
                    </>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>


        </div>
      </div>


    </motion.nav>
  );
};

export default EnhancedNavbar;