import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaBook, FaStar, FaShoppingCart, FaSearch } from 'react-icons/fa';
import api from '../services/api';
import { useSearchParams } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';

const Books = () => {
  const [searchParams] = useSearchParams();
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(() => {
    const categoryFromUrl = searchParams.get('category');
    return categoryFromUrl || 'All';
  });
  const [sortBy, setSortBy] = useState('title');
  
  const { addToCart: contextAddToCart } = useCart();
  


  // Fetch books from the backend API
  useEffect(() => {
    const fetchBooks = async () => {
      try {
        console.log('Fetching books from API...');
        const response = await api.get('/books');
        console.log('API Response:', response.data);
        setBooks(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching books:', error);
        // Fallback to mock data if API fails
        setBooks([
          {
            bookId: 1,
            title: "The Great Gatsby",
            author: "F. Scott Fitzgerald",
            price: 12.99,
            category: "Fiction",
            description: "A classic American novel set in the Jazz Age.",
            imageUrl: "https://m.media-amazon.com/images/I/71fQA7+jNBL._AC_UF1000,1000_QL80_.jpg",
            stock: 50
          },
          {
            bookId: 2,
            title: "To Kill a Mockingbird",
            author: "Harper Lee",
            price: 14.99,
            category: "Fiction",
            description: "A gripping tale of racial injustice and childhood innocence.",
            imageUrl: "https://m.media-amazon.com/images/I/817K3Y5N1FL._AC_UF1000,1000_QL80_.jpg",
            stock: 45
          },
          {
            bookId: 3,
            title: "1984",
            author: "George Orwell",
            price: 13.99,
            category: "Dystopian",
            description: "A dystopian social science fiction novel.",
            imageUrl: "https://m.media-amazon.com/images/I/91bYsDFDE+L._AC_UF1000,1000_QL80_.jpg",
            stock: 60
          }
        ]);
        setLoading(false);
      }
    };

    fetchBooks();
  }, []);

  const [allCategories, setAllCategories] = useState(['All']);

  // Fetch all available categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await api.get('/books/categories');
        setAllCategories(['All', ...response.data]);
      } catch (error) {
        console.error('Error fetching categories:', error);
        // Fallback to unique categories from books if API fails
        setAllCategories(['All', ...new Set(books.map(book => book.category))]);
      }
    };

    if (books.length > 0) {
      fetchCategories();
    }
  }, [books]);

  const categories = allCategories;

  // Filter and sort books based on search term, category, and sort option
  const filteredBooks = books
    .filter(book => 
      (selectedCategory === 'All' || book.category === selectedCategory) &&
      (book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
       book.author.toLowerCase().includes(searchTerm.toLowerCase()))
    )
    .sort((a, b) => {
      if (sortBy === 'title') {
        return a.title.localeCompare(b.title);
      } else if (sortBy === 'author') {
        return a.author.localeCompare(b.author);
      } else if (sortBy === 'priceLow') {
        return a.price - b.price;
      } else if (sortBy === 'priceHigh') {
        return b.price - a.price;
      } else if (sortBy === 'date') {
        return new Date(b.createdAt) - new Date(a.createdAt);
      }
      return 0;
    });

  const handleAddToCart = async (book) => {
    if (book.stock <= 0) {
      alert('This book is out of stock!');
      return;
    }
    
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

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading books...</p>
      </div>
    );
  }



  return (
    <div className="books-page">
      {/* Page Header */}
      <section className="page-header">
        <div className="container">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            Our Book Collection
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            Discover our vast collection of books across various genres and categories
          </motion.p>
        </div>
      </section>

      {/* Search and Filter Section */}
      <section className="search-filter-section py-6">
        <div className="container">
          <div className="search-filter-container">
            <div className="search-box">
              <FaSearch className="search-icon" />
              <input
                type="text"
                placeholder="Search books by title or author..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>
            
            <div className="filter-options">
              <div className="filter-group">
                <label>Category:</label>
                <select 
                  value={selectedCategory} 
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="filter-select"
                >
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
              
              <div className="filter-group">
                <label>Sort by:</label>
                <select 
                  value={sortBy} 
                  onChange={(e) => setSortBy(e.target.value)}
                  className="filter-select"
                >
                  <option value="title">Title A-Z</option>
                  <option value="author">Author A-Z</option>
                  <option value="priceLow">Price: Low to High</option>
                  <option value="priceHigh">Price: High to Low</option>
                  <option value="date">Newest First</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Books Grid */}
      <section className="books-section py-8">
        <div className="container">
          <div className="books-grid">
            {filteredBooks.length > 0 ? (
              filteredBooks.map((book, index) => (
                <motion.div
                  key={book.bookId || book.id || index}
                  className="book-card card"
                  whileHover={{ y: -10, scale: 1.02 }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 * index }}
                >
                  <div className="book-image">
                    <img 
                      src={book.imageUrl || book.image_url || "https://via.placeholder.com/300x450.png?text=Book+Cover"} 
                      alt={`Cover of ${book.title} by ${book.author}`} 
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/300x450.png?text=No+Image';
                      }}
                    />
                  </div>
                  <div className="book-info">
                    <h3>{book.title}</h3>
                    <p className="book-author">by {book.author}</p>
                    <div className="book-meta d-flex justify-between align-center mt-2">
                      <span className="book-category">{book.category}</span>
                      <div className="book-rating">
                        <FaStar color="#ffc107" /> {book.rating || '4.5'}
                      </div>
                    </div>
                    <div className="book-price mt-3">
                      {book.discount && book.discount > 0 ? (
                        <>
                          <span className="original-price">${(book.price * (1 + book.discount/100)).toFixed(2)}</span>
                          <span className="discounted-price">${book.price}</span>
                          <span className="discount-badge">-{book.discount}%</span>
                        </>
                      ) : (
                        <span className="price">${book.price}</span>
                      )}
                    </div>
                    <div className="book-stock mt-2">
                      <span className={`stock-status ${book.stock > 10 ? 'in-stock' : book.stock > 0 ? 'low-stock' : 'out-of-stock'}`}>
                        {book.stock > 10 ? 'In Stock' : book.stock > 0 ? `${book.stock} left` : 'Out of Stock'}
                      </span>
                    </div>
                    <button 
                      className={`book-action-btn w-full mt-4 ${book.stock > 0 ? 'btn-primary' : 'btn-disabled'}`}
                      onClick={() => handleAddToCart(book)}
                      disabled={book.stock <= 0}
                    >
                      <FaShoppingCart /> {book.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
                    </button>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="no-books-found">
                <FaBook className="no-books-icon" />
                <h3>No books found</h3>
                <p>Try adjusting your search or filter criteria</p>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Books;

const styles = `
.books-page {
  min-height: 100vh;
}

.page-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 3rem 0;
  text-align: center;
}

.page-header h1 {
  font-size: 2.5rem;
  margin-bottom: 1rem;
}

.search-filter-section {
  background: linear-gradient(135deg, #f5f7fa 0%, #e4edf5 100%);
  padding: 2rem 0;
  box-shadow: 0 2px 10px rgba(0,0,0,0.05);
}

.search-filter-container {
  display: flex;
  flex-wrap: wrap;
  gap: 1.5rem;
  align-items: end;
}

.search-box {
  position: relative;
  flex: 1;
  min-width: 300px;
}

.search-icon {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: #666;
}

.search-input {
  width: 100%;
  padding: 0.75rem 1rem 0.75rem 3rem;
  border: 2px solid #ddd;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.3s ease;
}

.search-input:focus {
  outline: none;
  border-color: #667eea;
}

.filter-options {
  display: flex;
  gap: 1.5rem;
  flex-wrap: wrap;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.filter-group label {
  font-weight: 500;
  color: #333;
}

.filter-select {
  padding: 0.5rem;
  border: 2px solid #ddd;
  border-radius: 8px;
  font-size: 1rem;
}

.books-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 2rem;
  padding: 1rem;
}

.book-card {
  transition: all 0.3s ease;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  height: 100%;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.1);
  background: white;
  position: relative;
}

.book-image img {
  width: 100%;
  height: 300px;
  object-fit: cover;
  border-radius: 12px 12px 0 0;
  transition: transform 0.3s ease;
}

.book-card:hover .book-image img {
  transform: scale(1.05);
}

.book-info {
  padding: 1.5rem;
  flex: 1;
  display: flex;
  flex-direction: column;
  position: relative;
}

.book-info h3 {
  font-size: 1.25rem;
  margin-bottom: 0.5rem;
  color: #2c3e50;
  line-height: 1.4;
  font-weight: 600;
}

.book-author {
  color: #7f8c8d;
  font-style: italic;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
  font-weight: 500;
}

.book-meta {
  font-size: 0.9rem;
  color: #666;
}

.book-category {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 0.35rem 0.8rem;
  border-radius: 20px;
  font-weight: 500;
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-size: 0.75rem;
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
}

.original-price {
  text-decoration: line-through;
  color: #999;
  font-size: 1rem;
  margin-right: 0.5rem;
}

.discounted-price {
  font-size: 1.5rem;
  font-weight: bold;
  color: #e74c3c;
}

.discount-badge {
  background: #e74c3c;
  color: white;
  padding: 0.15rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: bold;
  margin-left: 0.5rem;
  position: relative;
  top: -0.25rem;
}

.book-stock {
  margin-top: 0.5rem;
}

.stock-status {
  font-size: 0.85rem;
  font-weight: 500;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
}

.in-stock {
  color: #28a745;
  background: #d4edda;
}

.low-stock {
  color: #856404;
  background: #fff3cd;
}

.out-of-stock {
  color: #721c24;
  background: #f8d7da;
}

.no-books-found {
  grid-column: 1 / -1;
  text-align: center;
  padding: 3rem;
  color: #666;
}

.no-books-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
  color: #ccc;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 50vh;
}

.loading-spinner {
  width: 50px;
  height: 50px;
  border: 5px solid #f3f3f3;
  border-top: 5px solid #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

.book-action-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 0.75rem;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.book-action-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 15px rgba(102, 126, 234, 0.4);
}

.book-action-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

@media (max-width: 768px) {
  .search-filter-container {
    flex-direction: column;
  }
  
  .search-box {
    min-width: 100%;
  }
  
  .filter-options {
    width: 100%;
  }
  
  .page-header h1 {
    font-size: 2rem;
  }
  
  .books-grid {
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 1.5rem;
  }
}
`;

// Add styles to the document
const styleSheet = document.createElement("style");
styleSheet.type = "text/css";
styleSheet.innerText = styles;
document.head.appendChild(styleSheet);