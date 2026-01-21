import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FaBook, FaStar, FaShoppingCart, FaArrowRight, FaFire, FaChartLine, FaGift } from 'react-icons/fa';
import api from '../services/api';
import { useCart } from '../contexts/CartContext';
import FeaturedBooks from '../components/FeaturedBooks';
import '../components/FeaturedBooks.css';

const Home = () => {
  const [featuredBooks, setFeaturedBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const { addToCart: contextAddToCart } = useCart();
  
  const handleAddToCart = async (book) => {
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
  };
  


  // Fetch featured books from the backend API
  useEffect(() => {
    const fetchFeaturedBooks = async () => {
      try {
        const response = await api.get('/books');
        // Get first 6 books as featured books
        setFeaturedBooks(response.data.slice(0, 6));
        setLoading(false);
      } catch (error) {
        console.error('Error fetching featured books:', error);
        // Fallback to mock data if API fails
        setFeaturedBooks([
          {
            id: 1,
            title: "The Great Gatsby",
            author: "F. Scott Fitzgerald",
            price: 12.99,
            category: "Fiction",
            rating: 4.5,
            image_url: "https://m.media-amazon.com/images/I/71fQA7+jNBL._AC_UF1000,1000_QL80_.jpg"
          },
          {
            id: 2,
            title: "To Kill a Mockingbird",
            author: "Harper Lee",
            price: 14.99,
            category: "Classic",
            rating: 4.8,
            image_url: "https://m.media-amazon.com/images/I/817K3Y5N1FL._AC_UF1000,1000_QL80_.jpg"
          },
          {
            id: 3,
            title: "Atomic Habits",
            author: "James Clear",
            price: 16.99,
            category: "Self-Help",
            rating: 4.9,
            image_url: "https://m.media-amazon.com/images/I/91bYsDFDE+L._AC_UF1000,1000_QL80_.jpg"
          },
          {
            id: 4,
            title: "The Catcher in the Rye",
            author: "J.D. Salinger",
            price: 13.99,
            category: "Fiction",
            rating: 4.3,
            image_url: "https://m.media-amazon.com/images/I/8125hG50XBL._AC_UF1000,1000_QL80_.jpg"
          },
          {
            id: 5,
            title: "1984",
            author: "George Orwell",
            price: 14.49,
            category: "Dystopian",
            rating: 4.7,
            image_url: "https://m.media-amazon.com/images/I/81twONyHgWL._AC_UF1000,1000_QL80_.jpg"
          },
          {
            id: 6,
            title: "Pride and Prejudice",
            author: "Jane Austen",
            price: 12.49,
            category: "Romance",
            rating: 4.6,
            image_url: "https://m.media-amazon.com/images/I/81rluG3ZG0L._AC_UF1000,1000_QL80_.jpg"
          }
        ]);
        setLoading(false);
      }
    };

    fetchFeaturedBooks();
  }, []);

  const categories = [
    { name: "Fiction", count: 150, icon: "📚", color: "from-blue-500 to-purple-600", animationDelay: 0 },
    { name: "Non-Fiction", count: 120, icon: "📖", color: "from-green-500 to-teal-600", animationDelay: 0.1 },
    { name: "Technology", count: 80, icon: "💻", color: "from-yellow-500 to-orange-600", animationDelay: 0.2 },
    { name: "Science", count: 90, icon: "🔬", color: "from-red-500 to-pink-600", animationDelay: 0.3 },
    { name: "Business", count: 70, icon: "💼", color: "from-indigo-500 to-blue-600", animationDelay: 0.4 },
    { name: "Biography", count: 60, icon: "👤", color: "from-purple-500 to-indigo-600", animationDelay: 0.5 }
  ];

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5
      }
    }
  };

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="container">
          <motion.div 
            className="hero-content"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <motion.div
              className="hero-logo"
              animate={{
                scale: [1, 1.1, 1],
                rotate: [0, 5, -5, 0]
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                repeatType: "reverse",
                ease: "easeInOut"
              }}
            >
              <div className="bookstore-title-wrapper">
                <span className="bookstore-emoji">📚</span>
                <motion.h1 
                  className="hero-title"
                  animate={{ 
                    textShadow: [
                      "0 0 10px rgba(255,215,0,0.5)",
                      "0 0 20px rgba(255,215,0,0.8)",
                      "0 0 30px rgba(255,140,0,1)",
                      "0 0 20px rgba(255,215,0,0.8)",
                      "0 0 10px rgba(255,215,0,0.5)"
                    ]
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    repeatType: "reverse"
                  }}
                >
                  BookStore
                </motion.h1>
              </div>
            </motion.div>
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="hero-main-title"
            >
              Discover Your Next Favorite Book
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.6 }}
              className="hero-description"
            >
              Explore our vast collection of books from various genres and authors. Quality reading materials at affordable prices.
            </motion.p>
            <motion.div 
              className="hero-buttons"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.6 }}
            >
              <Link to="/books" className="btn btn-primary btn-lg">
                Shop Now <FaArrowRight />
              </Link>
              <Link to="/books" className="btn btn-secondary btn-lg">
                Browse Collection
              </Link>
            </motion.div>
            
            {/* Animated floating books */}
            <motion.div className="floating-books">
              <motion.div
                className="floating-book book-1"
                animate={{
                  y: [-10, 10, -10],
                  rotate: [0, 5, -5, 0],
                  scale: [1, 1.1, 1]
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                📖
              </motion.div>
              <motion.div
                className="floating-book book-2"
                animate={{
                  y: [10, -10, 10],
                  rotate: [0, -5, 5, 0],
                  scale: [1, 1.1, 1]
                }}
                transition={{
                  duration: 5,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 0.5
                }}
              >
                📗
              </motion.div>
              <motion.div
                className="floating-book book-3"
                animate={{
                  y: [-15, 15, -15],
                  rotate: [0, 8, -8, 0],
                  scale: [1, 1.1, 1]
                }}
                transition={{
                  duration: 6,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 1
                }}
              >
                📘
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats-section py-8">
        <div className="container">
          <motion.div 
            className="stats-grid grid grid-cols-2 md:grid-cols-4 gap-6"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.div 
              className="stat-item text-center"
              variants={itemVariants}
            >
              <div className="stat-icon bg-gradient-to-r from-blue-500 to-purple-600">
                <FaBook className="text-white text-2xl" />
              </div>
              <h3 className="stat-number">5000+</h3>
              <p className="stat-label">Books Available</p>
            </motion.div>
            
            <motion.div 
              className="stat-item text-center"
              variants={itemVariants}
            >
              <div className="stat-icon bg-gradient-to-r from-green-500 to-teal-600">
                <FaFire className="text-white text-2xl" />
              </div>
              <h3 className="stat-number">10K+</h3>
              <p className="stat-label">Happy Readers</p>
            </motion.div>
            
            <motion.div 
              className="stat-item text-center"
              variants={itemVariants}
            >
              <div className="stat-icon bg-gradient-to-r from-yellow-500 to-orange-600">
                <FaChartLine className="text-white text-2xl" />
              </div>
              <h3 className="stat-number">98%</h3>
              <p className="stat-label">Satisfaction</p>
            </motion.div>
            
            <motion.div 
              className="stat-item text-center"
              variants={itemVariants}
            >
              <div className="stat-icon bg-gradient-to-r from-red-500 to-pink-600">
                <FaGift className="text-white text-2xl" />
              </div>
              <h3 className="stat-number">24/7</h3>
              <p className="stat-label">Support</p>
            </motion.div>
          </motion.div>
        </div>
      </section>



      {/* Featured Books Section */}
      <section className="featured-books-section py-8">
        <div className="container">
          <motion.h2 
            className="section-title text-center mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            Featured Books
          </motion.h2>
          
          <div className="books-slider-container">
            {loading ? (
              <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>Loading featured books...</p>
              </div>
            ) : featuredBooks.length > 0 ? (
              <FeaturedBooks 
                books={featuredBooks} 
                title="Featured Books" 
                onAddToCart={handleAddToCart}
              />
            ) : (
              <div className="no-books-found">
                <p>No featured books available at the moment.</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="cta-section py-16">
        <div className="container">
          <motion.div 
            className="cta-content text-center"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
          >
            <motion.h2 
              className="cta-title"
              animate={{ 
                textShadow: [
                  "0 0 10px rgba(255,215,0,0.5)",
                  "0 0 20px rgba(255,140,0,0.8)",
                  "0 0 30px rgba(255,69,0,1)",
                  "0 0 20px rgba(255,140,0,0.8)",
                  "0 0 10px rgba(255,215,0,0.5)"
                ]
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                repeatType: "reverse"
              }}
            >
              Ready to Start Reading?
            </motion.h2>
            <motion.p className="cta-description mb-8">
              Join thousands of satisfied readers and discover amazing books today.
            </motion.p>
            <Link to="/books" className="btn btn-primary btn-xl">
              <FaBook className="mr-2" /> Explore Collection
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="why-choose-us-section py-16">
        <div className="container">
          <motion.h2 
            className="section-title text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            Why Choose Our Bookstore?
          </motion.h2>
          
          <div className="features-grid grid grid-cols-1 md:grid-cols-3 gap-10">
            <motion.div
              className="feature-card card text-center p-8 rounded-2xl"
              whileHover={{ scale: 1.05, y: -10, rotateY: 5 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <div className="feature-icon-wrapper mb-6">
                <div className="feature-icon-circle bg-gradient-to-r from-blue-500 to-purple-600 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FaBook className="feature-icon text-white text-4xl" />
                </div>
              </div>
              <h3 className="text-xl font-bold mb-4 text-gray-800">Premium Quality Books</h3>
              <p className="text-gray-600">We offer only the best quality books with excellent printing and binding.</p>
            </motion.div>
            
            <motion.div
              className="feature-card card text-center p-8 rounded-2xl"
              whileHover={{ scale: 1.05, y: -10, rotateY: 5 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="feature-icon-wrapper mb-6">
                <div className="feature-icon-circle bg-gradient-to-r from-teal-500 to-green-600 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FaStar className="feature-icon text-white text-4xl" />
                </div>
              </div>
              <h3 className="text-xl font-bold mb-4 text-gray-800">Top Rated Selection</h3>
              <p className="text-gray-600">Our collection consists of top-rated books recommended by readers worldwide.</p>
            </motion.div>
            
            <motion.div
              className="feature-card card text-center p-8 rounded-2xl"
              whileHover={{ scale: 1.05, y: -10, rotateY: 5 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <div className="feature-icon-wrapper mb-6">
                <div className="feature-icon-circle bg-gradient-to-r from-orange-500 to-red-600 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FaShoppingCart className="feature-icon text-white text-4xl" />
                </div>
              </div>
              <h3 className="text-xl font-bold mb-4 text-gray-800">Easy Shopping Experience</h3>
              <p className="text-gray-600">Enjoy a seamless shopping experience with our intuitive platform.</p>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;

const styles = `
.home-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #e4edf5 100%);
}

.hero-section {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 6rem 0;
  position: relative;
  overflow: hidden;
  clip-path: polygon(0 0, 100% 0, 100% 85%, 0 100%);
}

.hero-section::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="25" cy="25" r="1" fill="white" opacity="0.1"/><circle cx="75" cy="75" r="1" fill="white" opacity="0.1"/><circle cx="50" cy="10" r="1" fill="white" opacity="0.1"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>');
  opacity: 0.3;
}

.hero-content {
  text-align: center;
  position: relative;
  z-index: 1;
}

.hero-logo {
  margin-bottom: 1rem;
}

.bookstore-title-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  margin-bottom: 1rem;
}

.bookstore-emoji {
  font-size: 4rem;
  animation: float 3s ease-in-out infinite;
  display: inline-block;
  transform: rotate(0deg);
}

.hero-title {
  font-size: 4rem;
  margin: 0;
  font-weight: 700;
  background: linear-gradient(45deg, #ffd700, #ffed4e, #ffd700);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-fill-color: transparent;
  animation: glow 2s ease-in-out infinite alternate;
  text-align: left;
}

@keyframes glow {
  from {
    text-shadow: 0 0 5px #fff, 0 0 10px #ff8c00, 0 0 15px #ff4500;
  }
  to {
    text-shadow: 0 0 10px #fff, 0 0 20px #ff4500, 0 0 30px #ff8c00;
  }
}

.hero-main-title {
  font-size: 3.5rem;
  margin-bottom: 1rem;
  font-weight: 700;
  text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
}

.hero-description {
  font-size: 1.2rem;
  margin-bottom: 2rem;
  opacity: 0.9;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
}

.hero-buttons {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
  margin-bottom: 3rem;
}

.btn-lg {
  padding: 1rem 2rem;
  font-size: 1.1rem;
  border-radius: 50px;
  font-weight: 600;
  transition: all 0.3s ease;
}

.btn-xl {
  padding: 1.2rem 2.5rem;
  font-size: 1.2rem;
  border-radius: 50px;
  font-weight: 600;
}

.floating-books {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  overflow: hidden;
}

.floating-book {
  position: absolute;
  font-size: 3rem;
  opacity: 0.7;
  user-select: none;
}

.book-1 {
  top: 20%;
  left: 10%;
}

.book-2 {
  top: 40%;
  right: 15%;
}

.book-3 {
  bottom: 30%;
  left: 20%;
}

.stats-section {
  background: white;
  position: relative;
  z-index: 2;
  margin-top: -3rem;
  border-radius: 20px;
  box-shadow: 0 20px 40px rgba(0,0,0,0.1);
}

.stats-grid {
  gap: 2rem;
}

.stat-item {
  padding: 1.5rem;
  border-radius: 15px;
  background: white;
  box-shadow: 0 10px 30px rgba(0,0,0,0.1);
}

.stat-icon {
  width: 70px;
  height: 70px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1rem;
  color: white;
}

.stat-number {
  font-size: 2rem;
  font-weight: 700;
  color: #333;
  margin: 0 0 0.5rem;
}

.stat-label {
  font-size: 0.9rem;
  color: #666;
  margin: 0;
}

.section-title {
  font-size: 2.5rem;
  color: #333;
  margin-bottom: 2rem;
  text-align: center;
  background: linear-gradient(45deg, #667eea, #764ba2);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-fill-color: transparent;
}

.categories-grid, .books-grid, .features-grid {
  gap: 2rem;
}

.category-card-wrapper {
  perspective: 1000px;
}

.category-card, .book-card, .feature-card {
  transition: all 0.3s ease;
  border-radius: 15px;
  overflow: hidden;
}

.book-image img {
  width: 100%;
  height: 300px;
  object-fit: cover;
  border-radius: 8px 8px 0 0;
}

.book-info {
  padding: 1.5rem;
}

.book-info h3 {
  font-size: 1.25rem;
  margin-bottom: 0.5rem;
  color: #333;
  line-height: 1.4;
}

.book-author {
  color: #666;
  font-style: italic;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
}

.book-meta {
  font-size: 0.9rem;
  color: #666;
}

.book-category {
  background: linear-gradient(45deg, #667eea, #764ba2);
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-weight: 500;
  font-size: 0.8rem;
}

.book-rating {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.book-price .price {
  font-size: 1.5rem;
  font-weight: bold;
  color: #667eea;
  background: linear-gradient(45deg, #667eea, #764ba2);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-fill-color: transparent;
}

.feature-icon-wrapper {
  display: inline-block;
  padding: 1rem;
  border-radius: 50%;
  background: linear-gradient(45deg, #667eea, #764ba2);
  color: white;
  margin-bottom: 1rem;
}

.cta-section {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  text-align: center;
  clip-path: polygon(0 10%, 100% 0, 100% 90%, 0 100%);
  margin: 4rem 0;
}

.cta-title {
  font-size: 2.5rem;
  margin-bottom: 1rem;
  font-weight: 700;
}

.cta-description {
  font-size: 1.2rem;
  opacity: 0.9;
  max-width: 600px;
  margin: 0 auto 2rem;
}

.loading-container {
  grid-column: 1 / -1;
  text-align: center;
  padding: 3rem;
  color: #666;
}

.loading-spinner {
  width: 50px;
  height: 50px;
  border: 5px solid #f3f3f3;
  border-top: 5px solid #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

@keyframes float {
  0% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
  100% { transform: translateY(0px); }
}

@media (max-width: 768px) {
  .hero-content h1 {
    font-size: 2.5rem;
  }
  
  .hero-buttons {
    flex-direction: column;
    align-items: center;
  }
  
  .section-title {
    font-size: 2rem;
  }
  
  .books-grid {
    grid-template-columns: 1fr;
  }
  
  .categories-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .hero-title {
    font-size: 3rem;
  }
  
  .hero-main-title {
    font-size: 2.5rem;
  }
}
}

.books-slider-container {
  position: relative;
  width: 100%;
}

.no-books-found {
  text-align: center;
  padding: 2rem;
  color: #666;
  font-style: italic;
}

.mr-2 {
  margin-right: 0.5rem;
}

.feature-icon-circle {
  box-shadow: 0 10px 25px rgba(0,0,0,0.15);
  transition: all 0.3s ease;
}

.feature-card {
  box-shadow: 0 15px 35px rgba(0,0,0,0.1);
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  overflow: hidden;
  background: linear-gradient(145deg, #ffffff, #f8f9fa);
  border: 1px solid rgba(255,255,255,0.5);
}

.feature-card:hover {
  box-shadow: 0 20px 40px rgba(0,0,0,0.2);
  transform: translateY(-5px);
}

.features-grid {
  max-width: 1200px;
  margin: 0 auto;
}

`;

// Add styles to the document
const styleSheet = document.createElement("style");
styleSheet.type = "text/css";
styleSheet.innerText = styles;
document.head.appendChild(styleSheet);