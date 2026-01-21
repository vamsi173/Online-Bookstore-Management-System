import React from 'react';
import { motion } from 'framer-motion';

const Footer = () => {
  return (
    <motion.footer 
      className="footer"
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="container">
        <div className="footer-content">
          <div className="footer-section">
            <h3>📚 BookStore</h3>
            <p>Your one-stop destination for all your reading needs.</p>
          </div>
          
          <div className="footer-section">
            <h4>Quick Links</h4>
            <ul>
              <li><a href="/">Home</a></li>
              <li><a href="/books">Books</a></li>
              <li><a href="/about">About Us</a></li>
              <li><a href="/contact">Contact</a></li>
            </ul>
          </div>
          
          <div className="footer-section">
            <h4>Categories</h4>
            <ul>
              <li><a href="/category/fiction">Fiction</a></li>
              <li><a href="/category/non-fiction">Non-Fiction</a></li>
              <li><a href="/category/technology">Technology</a></li>
              <li><a href="/category/science">Science</a></li>
            </ul>
          </div>
          
          <div className="footer-section">
            <h4>Contact Us</h4>
            <p>Email: info@bookstore.com</p>
            <p>Phone: +1 234 567 890</p>
          </div>
        </div>
        
        <div className="footer-bottom">
          <p>&copy; 2026 BookStore. All rights reserved.</p>
        </div>
      </div>
    </motion.footer>
  );
};

export default Footer;

const styles = `
.footer {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 3rem 0 1rem;
  margin-top: auto;
}

.footer-content {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 2rem;
  margin-bottom: 2rem;
}

.footer-section h3,
.footer-section h4 {
  margin-bottom: 1rem;
  color: #fff;
}

.footer-section ul {
  list-style: none;
}

.footer-section ul li {
  margin-bottom: 0.5rem;
}

.footer-section ul li a {
  color: rgba(255, 255, 255, 0.8);
  text-decoration: none;
  transition: color 0.3s ease;
}

.footer-section ul li a:hover {
  color: white;
}

.footer-bottom {
  text-align: center;
  padding-top: 2rem;
  border-top: 1px solid rgba(255, 255, 255, 0.2);
}

@media (max-width: 768px) {
  .footer-content {
    grid-template-columns: 1fr;
    text-align: center;
  }
}
`;

// Add styles to the document
const styleSheet = document.createElement("style");
styleSheet.type = "text/css";
styleSheet.innerText = styles;
document.head.appendChild(styleSheet);