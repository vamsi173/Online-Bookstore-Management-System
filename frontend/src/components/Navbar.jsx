import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaShoppingCart, FaUser, FaSignOutAlt, FaBars, FaTimes } from 'react-icons/fa';

const Navbar = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    if (token && role) {
      setIsLoggedIn(true);
      setUserRole(role);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    setIsLoggedIn(false);
    setUserRole('');
    navigate('/');
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <motion.nav 
      className="navbar"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="container d-flex justify-between align-center">
        <Link to="/" className="logo">
          <h2>📚 BookStore</h2>
        </Link>

        {/* Desktop Navigation */}
        <div className="nav-links">
          <Link to="/">Home</Link>
          <Link to="/books">Books</Link>
          {isLoggedIn && (
            <>
              <Link to="/cart">Cart <FaShoppingCart /></Link>
              <Link to="/orders">Orders</Link>
              {userRole === 'ADMIN' && <Link to="/admin">Admin</Link>}
              <Link to="/" onClick={handleLogout} className="logout-link">
                <FaSignOutAlt /> Logout
              </Link>
            </>
          )}
          {!isLoggedIn && (
            <>
              <Link to="/login" className="btn btn-primary">Login</Link>
              <Link to="/signup" className="btn btn-secondary">Sign Up</Link>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <div className="mobile-menu-btn" onClick={toggleMenu}>
          {isMenuOpen ? <FaTimes /> : <FaBars />}
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <motion.div 
          className="mobile-menu"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Link to="/" onClick={toggleMenu}>Home</Link>
          <Link to="/books" onClick={toggleMenu}>Books</Link>
          {isLoggedIn && (
            <>
              <Link to="/cart" onClick={toggleMenu}>Cart <FaShoppingCart /></Link>
              <Link to="/orders" onClick={toggleMenu}>Orders</Link>
              {userRole === 'ADMIN' && <Link to="/admin" onClick={toggleMenu}>Admin</Link>}
              <Link to="/" onClick={() => { handleLogout(); toggleMenu(); }} className="logout-link">
                <FaSignOutAlt /> Logout
              </Link>
            </>
          )}
          {!isLoggedIn && (
            <>
              <Link to="/login" className="btn btn-primary" onClick={toggleMenu}>Login</Link>
              <Link to="/signup" className="btn btn-secondary" onClick={toggleMenu}>Sign Up</Link>
            </>
          )}
        </motion.div>
      )}
    </motion.nav>
  );
};

export default Navbar;

const styles = `
.navbar {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  padding: 1rem 0;
  position: sticky;
  top: 0;
  z-index: 1000;
  box-shadow: 0 2px 20px rgba(0, 0, 0, 0.1);
}

.navbar .container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.navbar .logo h2 {
  color: #667eea;
  margin: 0;
}

.navbar .nav-links {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.navbar .nav-links a {
  text-decoration: none;
  color: #333;
  font-weight: 500;
  transition: color 0.3s ease;
}

.navbar .nav-links a:hover {
  color: #667eea;
}

.navbar .nav-links .btn {
  margin-left: 0.5rem;
}

.logout-link {
  text-decoration: none;
  color: #dc3545;
  font-weight: 500;
  padding: 0.5rem 1rem;
  border-radius: 5px;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.logout-link:hover {
  background-color: #dc3545;
  color: white;
}

.mobile-menu-btn {
  display: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #333;
}

.mobile-menu {
  display: none;
  flex-direction: column;
  gap: 1rem;
  padding: 1rem;
  background: white;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

@media (max-width: 768px) {
  .nav-links {
    display: none;
  }
  
  .mobile-menu-btn {
    display: block;
  }
  
  .mobile-menu {
    display: flex;
  }
}
`;

// Add styles to the document
const styleSheet = document.createElement("style");
styleSheet.type = "text/css";
styleSheet.innerText = styles;
document.head.appendChild(styleSheet);