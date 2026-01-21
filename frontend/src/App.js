import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { motion } from 'framer-motion';
import './App.css';
import './components/EnhancedNavbar.css';

// Import contexts
import { CartProvider } from './contexts/CartContext';
import { AuthProvider } from './contexts/AuthContext';

// Import pages
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Cart from './pages/Cart';
import Orders from './pages/Orders';
import AdminDashboard from './pages/AdminDashboard';
import Books from './pages/Books';
import Profile from './pages/Profile';

// Import components
import EnhancedNavbar from './components/EnhancedNavbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <div className="App">
            <EnhancedNavbar />
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/books" element={<Books />} />
                <Route path="/cart" element={<ProtectedRoute><Cart /></ProtectedRoute>} />
                <Route path="/orders" element={<ProtectedRoute><Orders /></ProtectedRoute>} />
                <Route path="/admin" element={<ProtectedRoute requiredRole="ADMIN"><AdminDashboard /></ProtectedRoute>} />
                <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
              </Routes>
            </motion.div>
            <Footer />
          </div>
        </Router>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;