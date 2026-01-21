import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../services/api'; // Use the API service instead of axios directly

const Signup = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await api.post('/auth/register', formData);
      
      if (response.data.message) {
        setSuccess(response.data.message);
        // Redirect to login after a short delay
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } else {
        setError('Registration failed: Invalid response from server');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <motion.div 
        className="auth-container"
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <div className="auth-form">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="signup-header text-center mb-6"
          >
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
              className="logo-circle mx-auto mb-4"
            >
              <span className="logo-icon">✨</span>
            </motion.div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Create Your Account</h2>
            <p className="text-gray-600">Join our community to start shopping</p>
          </motion.div>
          
          {error && (
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="error-message"
            >
              {error}
            </motion.div>
          )}
          
          {success && (
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="success-message"
            >
              {success}
            </motion.div>
          )}
          
          <form onSubmit={handleSubmit}>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="form-group"
            >
              <label className="form-label">Full Name</label>
              <input
                type="text"
                name="name"
                placeholder="Enter your full name"
                value={formData.name}
                onChange={handleChange}
                required
                className="form-control"
              />
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="form-group"
            >
              <label className="form-label">Email Address</label>
              <input
                type="email"
                name="email"
                placeholder="Enter your email address"
                value={formData.email}
                onChange={handleChange}
                required
                className="form-control"
              />
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="form-group"
            >
              <label className="form-label">Password</label>
              <input
                type="password"
                name="password"
                placeholder="Create a strong password"
                value={formData.password}
                onChange={handleChange}
                required
                className="form-control"
              />
            </motion.div>
            
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit" 
              className="btn btn-primary w-full mt-4"
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating account...
                </span>
              ) : (
                'Sign Up'
              )}
            </motion.button>
          </form>
          
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="auth-footer mt-6 text-center"
          >
            <p className="text-gray-600 mb-2">Already have an account? <Link to="/login" className="text-blue-600 hover:text-blue-800 font-medium">Login here</Link></p>
            <p className="text-gray-500"><Link to="/" className="text-gray-600 hover:text-gray-800 font-medium">← Back to Home</Link></p>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default Signup;

const styles = `
.auth-page {
  min-height: 80vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem 0;
}

.auth-container {
  background: white;
  border-radius: 16px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  padding: 2rem;
  width: 100%;
  max-width: 400px;
}

.auth-form h2 {
  text-align: center;
  margin-bottom: 1.5rem;
  color: #333;
}

.error-message {
  background: #fee;
  color: #c33;
  padding: 0.75rem;
  border-radius: 8px;
  margin-bottom: 1rem;
  text-align: center;
}

.success-message {
  background: #efe;
  color: #393;
  padding: 0.75rem;
  border-radius: 8px;
  margin-bottom: 1rem;
  text-align: center;
}

.form-group {
  margin-bottom: 1.5rem;
}

.w-full {
  width: 100%;
}

.auth-footer {
  margin-top: 1.5rem;
  text-align: center;
}

.auth-footer p {
  margin: 0.5rem 0;
}

.auth-footer a {
  color: #667eea;
  text-decoration: none;
  font-weight: 500;
}

.auth-footer a:hover {
  text-decoration: underline;
}`;

// Add styles to the document
const styleSheet = document.createElement("style");
styleSheet.type = "text/css";
styleSheet.innerText = styles;
document.head.appendChild(styleSheet);