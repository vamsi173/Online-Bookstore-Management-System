import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../services/api'; // Use the API service instead of axios directly

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
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

    try {
      // Try regular login first
      const response = await api.post('/auth/login', formData);
      
      if (response.data.token) {
        // Store in localStorage
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('role', response.data.role);
        
        // Store user data
        const userObject = {
          id: response.data.userId,
          name: response.data.name,
          email: response.data.email,
          role: response.data.role
        };
        localStorage.setItem('userData', JSON.stringify(userObject));
        
        // Redirect based on role
        if (response.data.role === 'ADMIN') {
          navigate('/admin');
        } else {
          navigate('/');
        }
      } else {
        setError('Login failed: Invalid response from server');
      }
    } catch (err) {
      // If regular login fails, try admin login
      try {
        const adminResponse = await api.post('/auth/admin/login', formData);
        
        if (adminResponse.data.token) {
          // Store in localStorage
          localStorage.setItem('token', adminResponse.data.token);
          localStorage.setItem('role', adminResponse.data.role);
          
          // Store user data
          const userObject = {
            id: adminResponse.data.userId,
            name: adminResponse.data.name,
            email: adminResponse.data.email,
            role: adminResponse.data.role
          };
          localStorage.setItem('userData', JSON.stringify(userObject));
          
          // Redirect to admin panel
          navigate('/admin');
        } else {
          setError(err.response?.data?.message || 'Login failed. Please try again.');
        }
      } catch (adminErr) {
        setError(err.response?.data?.message || adminErr.response?.data?.message || 'Login failed. Please try again.');
      }
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
            className="login-header text-center mb-6"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="logo-circle mx-auto mb-4"
            >
              <span className="logo-icon">📚</span>
            </motion.div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Welcome Back</h2>
            <p className="text-gray-600">Sign in to your account to continue</p>
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
          
          <form onSubmit={handleSubmit}>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
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
              transition={{ delay: 0.4 }}
              className="form-group"
            >
              <label className="form-label">Password</label>
              <input
                type="password"
                name="password"
                placeholder="Enter your password"
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
                  Signing in...
                </span>
              ) : (
                'Sign In'
              )}
            </motion.button>
          </form>
          
          {/* Admin Login Section */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="admin-login-section card mt-6 p-4 bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-100 rounded-lg"
          >
            <h3 className="text-lg font-semibold text-purple-800 mb-2 flex items-center">
              <span className="mr-2">👑</span> Admin Access
            </h3>
            <div className="admin-credentials text-sm">
              <p className="font-medium text-gray-700 mb-1">Use admin credentials to access admin panel:</p>
              <div className="grid grid-cols-2 gap-2 mt-2">
                <div className="bg-white p-2 rounded text-center">
                  <p className="text-xs text-gray-500">Username</p>
                  <p className="font-mono text-purple-600 font-semibold">vamsi@admin.com</p>
                </div>
                <div className="bg-white p-2 rounded text-center">
                  <p className="text-xs text-gray-500">Password</p>
                  <p className="font-mono text-purple-600 font-semibold">vamsi@123</p>
                </div>
              </div>
            </div>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="auth-footer mt-6 text-center"
          >
            <p className="text-gray-600 mb-2">Don't have an account? <Link to="/signup" className="text-blue-600 hover:text-blue-800 font-medium">Sign up here</Link></p>
            <p className="text-gray-500"><Link to="/" className="text-gray-600 hover:text-gray-800 font-medium">← Back to Home</Link></p>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;

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
}

.admin-login-section {
  background: #f8f9fa;
  border: 2px solid #667eea;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
}

.admin-credentials {
  margin-top: 0.5rem;
}

.admin-credentials code {
  background: #e9ecef;
  padding: 0.2rem 0.4rem;
  border-radius: 4px;
  font-size: 0.9rem;
}`;

// Add styles to the document
const styleSheet = document.createElement("style");
styleSheet.type = "text/css";
styleSheet.innerText = styles;
document.head.appendChild(styleSheet);