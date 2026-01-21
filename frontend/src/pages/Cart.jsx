import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaTrash, FaPlus, FaMinus, FaShoppingCart, FaCheck } from 'react-icons/fa';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';

const Cart = () => {
  const { cartItems, loading, updateQuantity: updateCartQuantity, removeFromCart: removeCartById, getTotalPrice } = useCart();
  const { user } = useAuth();
  
  // Extract user ID from the authenticated user
  const userId = user?.id || user?.userId || user?._id || 1;
  
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [showOrderSuccess, setShowOrderSuccess] = useState(false);
  const [orderId, setOrderId] = useState(null);
  const [uniqueOrderId, setUniqueOrderId] = useState(null);
  const [checkoutStep, setCheckoutStep] = useState(1); // 1: Address, 2: Payment, 3: Confirm
  const [checkoutForm, setCheckoutForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    address: '',
    city: '',
    zipCode: '',
    country: '',
    phone: '',
    paymentMethod: 'cash-on-delivery',
    cardNumber: '',
    expiryDate: '',
    cvv: ''
  });

  // Define local updateQuantity and removeFromCart to avoid naming conflicts
  const updateQuantity = async (id, bookId, newQuantity) => {
    if (newQuantity <= 0) {
      await removeCartById(bookId);
      return;
    }
    await updateCartQuantity(bookId, newQuantity);
  };

  const removeFromCart = async (id, bookId) => {
    await removeCartById(bookId);
  };

  const calculateTotal = () => {
    return getTotalPrice().toFixed(2);
  };

  const handleCheckoutClick = () => {
    if (cartItems.length === 0) {
      alert('Your cart is empty!');
      return;
    }
    setShowCheckoutModal(true);
    setCheckoutStep(1); // Start with address step
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;
    setCheckoutForm(prev => ({
      ...prev,
      [name]: newValue
    }));
  };

  const validateAddressForm = () => {
    const requiredFields = ['firstName', 'lastName', 'email', 'address', 'city', 'zipCode', 'country', 'phone'];
    for (const field of requiredFields) {
      if (!checkoutForm[field]) {
        alert(`Please fill in the ${field.replace(/([A-Z])/g, ' $1').toLowerCase()} field.`);
        return false;
      }
    }
    return true;
  };

  const validateCardDetails = () => {
    if (checkoutForm.paymentMethod === 'card') {
      const cardFields = ['cardNumber', 'expiryDate', 'cvv'];
      for (const field of cardFields) {
        if (!checkoutForm[field]) {
          alert(`Please fill in the ${field.replace(/([A-Z])/g, ' $1').toLowerCase()} field.`);
          return false;
        }
      }
      
      // Validate card number (basic validation)
      const cardNumber = checkoutForm.cardNumber.replace(/\s+/g, '');
      if (!/^\d{16}$/.test(cardNumber)) {
        alert('Please enter a valid 16-digit card number.');
        return false;
      }
      
      // Validate expiry date (MM/YY format)
      if (!/^(0[1-9]|1[0-2])\/?([0-9]{2})$/.test(checkoutForm.expiryDate)) {
        alert('Please enter a valid expiry date (MM/YY).');
        return false;
      }
      
      // Validate CVV (3 digits)
      if (!/^\d{3}$/.test(checkoutForm.cvv)) {
        alert('Please enter a valid 3-digit CVV.');
        return false;
      }
    }
    return true;
  };

  const goToNextStep = () => {
    if (checkoutStep === 1) { // Address step
      if (validateAddressForm()) {
        setCheckoutStep(2); // Move to payment step
      }
    } else if (checkoutStep === 2) { // Payment step
      if (validateCardDetails()) {
        setCheckoutStep(3); // Move to confirmation step
      }
    }
  };

  const goToPreviousStep = () => {
    if (checkoutStep > 1) {
      setCheckoutStep(checkoutStep - 1);
    }
  };

  const handlePlaceOrder = async () => {
    try {
      // Validate cart is not empty
      if (cartItems.length === 0) {
        alert('Your cart is empty! Please add items to your cart before placing an order.');
        return;
      }
      
      // Validate required checkout form fields with more detailed validation
      if (!checkoutForm.firstName || checkoutForm.firstName.trim() === '') {
        alert('First name is required.');
        return;
      }
      if (!checkoutForm.lastName || checkoutForm.lastName.trim() === '') {
        alert('Last name is required.');
        return;
      }
      if (!checkoutForm.email || !isValidEmail(checkoutForm.email)) {
        alert('A valid email is required.');
        return;
      }
      
      // If payment method is card, validate card details
      if (checkoutForm.paymentMethod === 'card') {
        if (!checkoutForm.cardNumber || checkoutForm.cardNumber.replace(/\s/g, '').length !== 16 || isNaN(checkoutForm.cardNumber.replace(/\s/g, ''))) {
          alert('Valid 16-digit card number is required for card payments.');
          return;
        }
        if (!checkoutForm.expiryDate || !checkoutForm.expiryDate.match(/^(0[1-9]|1[0-2])\/?(\d{2})$/)) {
          alert('Valid expiry date (MM/YY format) is required for card payments.');
          return;
        }
        if (!checkoutForm.cvv || checkoutForm.cvv.length !== 3 || isNaN(checkoutForm.cvv)) {
          alert('Valid 3-digit CVV is required for card payments.');
          return;
        }
      }
      
      if (!checkoutForm.address || checkoutForm.address.trim() === '') {
        alert('Address is required.');
        return;
      }
      if (!checkoutForm.city || checkoutForm.city.trim() === '') {
        alert('City is required.');
        return;
      }
      if (!checkoutForm.zipCode || checkoutForm.zipCode.trim() === '') {
        alert('ZIP code is required.');
        return;
      }
      if (!checkoutForm.country || checkoutForm.country.trim() === '') {
        alert('Country is required.');
        return;
      }
      if (!checkoutForm.phone || !isValidPhone(checkoutForm.phone)) {
        alert('A valid phone number is required (digits only, 1-15 characters).');
        return;
      }
      if (!checkoutForm.paymentMethod) {
        alert('Payment method is required.');
        return;
      }
      
      // Validate userId before proceeding
      if (!userId || (typeof userId === 'string' && isNaN(parseInt(userId, 10)))) {
        alert('Invalid user ID. Please make sure you are logged in.');
        return;
      }
      
      // Convert userId to number if it's a string (only declare once)
      const numericUserId = typeof userId === 'string' ? parseInt(userId, 10) : userId;
      
      // Comprehensive cart synchronization and validation
      
      // 1. Verify user authentication
      const token = localStorage.getItem('token');
      if (!token) {
        alert('You must be logged in to place an order. Please log in and try again.');
        return;
      }
      
      // 2. Verify cart has items
      if (cartItems.length === 0) {
        alert('Your cart is empty! Please add items to your cart before placing an order.');
        return;
      }
      
      // 3. Wait for any pending cart operations to complete
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // 4. The API service handles authentication automatically
      
      // Simple cart validation - just ensure we have items
      if (cartItems.length === 0) {
        alert('Your cart is empty! Please add items to your cart before placing an order.');
        return;
      }
      
      // Ensure cart items are synced to backend before checkout
      // The backend will fetch cart items using userId, so we don't send them in the request
      
      // First, let's make sure the cart items are properly synchronized
      // Wait a moment to ensure any pending operations are complete
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Sync all cart items to ensure they exist in backend using POST
      for (const item of cartItems) {
        try {
          const cartPayload = {
            user: { userId: numericUserId },
            book: { bookId: item.bookId },
            quantity: item.quantity
          };
          
          await api.post(
            '/cart',
            cartPayload
          );
          console.log('Synced item to backend:', item.title);
        } catch (syncError) {
          console.error(`Failed to sync item ${item.bookId}:`, syncError);
        }
      }
      
      // Wait a moment for sync to complete
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Verify that cart items exist by fetching them again from backend
      try {
        const verifyResponse = await api.get(`/cart/${numericUserId}`);
        console.log('Verified cart items from backend:', verifyResponse.data);
        if (verifyResponse.data.length === 0) {
          alert('Your cart appears to be empty. Please add items to your cart before placing an order.');
          return;
        }
      } catch (verificationError) {
        console.error('Failed to verify cart items:', verificationError);
        alert('Could not verify cart contents. Please try again.');
        return;
      }
      
      console.log('Cart items synced and verified, proceeding with checkout');
      
      console.log('Proceeding with order placement for', cartItems.length, 'items');

      console.log('Cart synchronization validated successfully, proceeding with checkout');

      // Prepare order data without totalAmount since the backend calculates it
      // Format the checkout form data to match backend requirements
      const cleanedPhone = checkoutForm.phone.toString().replace(/\s/g, '').replace(/-/g, '');
      
      // Validate phone number format if not valid
      if (!isValidPhone(cleanedPhone)) {
        alert('Invalid phone number format. Please enter a valid phone number.');
        return;
      }
      
      // Additional check: ensure the user is authenticated and has a valid cart
      if (!userId) {
        alert('You must be logged in to place an order.');
        return;
      }
      
      // Build order data ensuring proper types and values
      // Do NOT include cartItems - backend fetches them using userId
      const orderData = {
        firstName: checkoutForm.firstName?.trim(),
        lastName: checkoutForm.lastName?.trim(),
        email: checkoutForm.email?.trim(),
        address: checkoutForm.address?.trim(),
        city: checkoutForm.city?.trim(),
        zipCode: checkoutForm.zipCode?.trim(),
        country: checkoutForm.country?.trim(),
        phone: cleanedPhone,
        paymentMethod: checkoutForm.paymentMethod,
        userId: numericUserId
      };
      
      // Make sure the user ID is a valid number
      if (isNaN(numericUserId)) {
        alert('Invalid user ID. Please log out and log back in to refresh your session.');
        return;
      }
      
      // Log the order data being sent
      console.log('Sending order data:', orderData);
      console.log('User ID being sent:', numericUserId, 'Type:', typeof numericUserId);
      
      // Add card details only if payment method is card
      if (checkoutForm.paymentMethod === 'card') {
        orderData.cardNumber = checkoutForm.cardNumber;
        orderData.expiryDate = checkoutForm.expiryDate;
        orderData.cvv = checkoutForm.cvv;
      }

      console.log('Sending checkout request:', orderData);
      console.log('User ID type and value:', typeof numericUserId, numericUserId);
      
      const response = await api.post('/checkout/process', orderData);
      console.log('Checkout response:', response);
      
      if (response.data && response.data.success) {
        handlePlaceOrderSuccess(response.data);
        
        // Clear cart items from state
        // Note: This will be handled by the CartContext since we're using it now
      } else {
        alert(response.data.message || 'Order failed');
      }
    } catch (error) {
      console.error('Order error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        config: error.config?.url,
        errorConfig: error.config
      });
      
      // More specific error handling
      if (error.response) {
        // Server responded with error status
        console.error('Full Server Error Response:', error.response);
        console.error('Error Response Data:', error.response.data);
        
        // Extract error message from different possible fields
        let serverErrorMessage = 'Unknown server error';
        
        if (typeof error.response.data === 'string') {
          // Sometimes the error is just a string
          serverErrorMessage = error.response.data;
        } else if (error.response.data?.message) {
          serverErrorMessage = error.response.data.message;
        } else if (error.response.data?.error) {
          serverErrorMessage = error.response.data.error;
        } else if (error.response.data?.[0]?.msg) {
          // For validation errors in array format
          serverErrorMessage = error.response.data[0].msg;
        } else if (Array.isArray(error.response.data) && error.response.data.length > 0) {
          // For validation errors in array format
          serverErrorMessage = error.response.data.join(', ');
        } else {
          // Try to stringify the whole response as fallback
          try {
            serverErrorMessage = JSON.stringify(error.response.data);
          } catch (e) {
            serverErrorMessage = 'Could not parse error response';
          }
        }
        
        alert(`Error placing order: ${serverErrorMessage} (Status: ${error.response.status})`);
      } else if (error.request) {
        // Request was made but no response received
        console.error('Network Error - Request Object:', error.request);
        alert('Network error: Could not connect to the server. Please check your connection and try again.');
      } else {
        // Something else happened
        console.error('General Error:', error.message);
        alert(`Error placing order: ${error.message || 'Unknown error'}`);
      }
    }
  };

  const closeOrderSuccess = () => {
    setShowOrderSuccess(false);
  };
  
  // Generate a unique order ID (timestamp + random string)
  const generateUniqueOrderId = () => {
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substr(2, 9).toUpperCase();
    return `ORD-${timestamp}-${randomString}`;
  };
  
  // Helper function to validate email format
  const isValidEmail = (email) => {
    const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
    return emailRegex.test(email);
  };
  
  // Helper function to validate phone number format
  const isValidPhone = (phone) => {
    // Phone should match ^\+?[1-9]\d{1,14}$ pattern from backend
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    const cleanedPhone = phone.toString().replace(/\s/g, '').replace(/-/g, '');
    return phoneRegex.test(cleanedPhone);
  };
  
  // Function to handle order placement and store unique ID
  const handlePlaceOrderSuccess = (orderResponse) => {
    setShowCheckoutModal(false);
    setOrderId(orderResponse.orderId); // Set the order ID from response
    setUniqueOrderId(generateUniqueOrderId()); // Generate and store unique order ID
    setShowOrderSuccess(true);
    
    // Reset form
    setCheckoutForm({
      firstName: '',
      lastName: '',
      email: '',
      address: '',
      city: '',
      zipCode: '',
      country: '',
      phone: '',
      paymentMethod: 'cash-on-delivery',
      cardNumber: '',
      expiryDate: '',
      cvv: ''
    });
  };

  if (loading) {
    return (
      <div className="cart-page py-8">
        <div className="container">
          <div className="text-center">Loading cart...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page py-8">
      <div className="container">
        <div className="cart-header">
          <motion.div 
            className="cart-title-container"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="page-title text-center">
              <span className="cart-icon">🛒</span> Your Shopping Cart
            </h1>
            <p className="cart-subtitle text-center">Review and manage your selected items</p>
          </motion.div>
        </div>

        {cartItems.length === 0 ? (
          <div className="empty-cart text-center">
            <h3>Your cart is empty</h3>
            <p>Add some books to get started!</p>
          </div>
        ) : (
          <div className="cart-content">
            <div className="cart-items">
              {cartItems.map((item, index) => (
                <motion.div
                  key={item.id || item.bookId}
                  className="cart-item card"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className="cart-item-image">
                    <img src={item.image} alt="" />
                  </div>
                  
                  <div className="cart-item-details">
                    <h3>{item.title}</h3>
                    <p className="author">by {item.author}</p>
                    <p className="price">${item.price.toFixed(2)}</p>
                  </div>
                  
                  <div className="cart-item-quantity">
                    <button 
                      className="quantity-btn"
                      onClick={() => updateQuantity(item.id, item.bookId, item.quantity - 1)}
                    >
                      <FaMinus />
                    </button>
                    <span className="quantity">{item.quantity}</span>
                    <button 
                      className="quantity-btn"
                      onClick={() => updateQuantity(item.id, item.bookId, item.quantity + 1)}
                    >
                      <FaPlus />
                    </button>
                  </div>
                  
                  <div className="cart-item-total">
                    <strong>${(item.price * item.quantity).toFixed(2)}</strong>
                  </div>
                  
                  <button 
                    className="remove-btn"
                    onClick={() => removeFromCart(item.id, item.bookId)}
                  >
                    <FaTrash />
                  </button>
                </motion.div>
              ))}
            </div>

            <div className="cart-summary card">
              <h3 className="summary-title">Order Summary</h3>
              <div className="summary-row">
                <span>Subtotal</span>
                <span className="summary-value">${calculateTotal()}</span>
              </div>
              <div className="summary-row">
                <span>Shipping</span>
                <span className="summary-value">Free</span>
              </div>
              <div className="summary-divider"></div>
              <div className="summary-row total">
                <span>Total</span>
                <span className="total-amount">${calculateTotal()}</span>
              </div>
              
              <button 
                className="btn btn-checkout w-full mt-4"
                onClick={handleCheckoutClick}
              >
                <span className="checkout-text">Proceed to Checkout</span>
                <span className="checkout-arrow">→</span>
              </button>
              
              <div className="secure-checkout">
                <span className="lock-icon">🔒</span> Secure Checkout
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Checkout Modal */}
      {showCheckoutModal && (
        <div className="modal-overlay" onClick={() => setShowCheckoutModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Checkout</h3>
              <button className="close-btn" onClick={() => setShowCheckoutModal(false)}>×</button>
            </div>
            
            {/* Progress Steps */}
            <div className="checkout-progress">
              <div className={`step ${checkoutStep >= 1 ? 'active' : ''}`}>
                <div className="step-number">{checkoutStep >= 1 ? <FaCheck /> : '1'}</div>
                <div className="step-label">Address</div>
              </div>
              <div className={`step ${checkoutStep >= 2 ? 'active' : ''}`}>
                <div className="step-number">{checkoutStep >= 2 ? <FaCheck /> : '2'}</div>
                <div className="step-label">Payment</div>
              </div>
              <div className={`step ${checkoutStep >= 3 ? 'active' : ''}`}>
                <div className="step-number">{checkoutStep >= 3 ? <FaCheck /> : '3'}</div>
                <div className="step-label">Confirm</div>
              </div>
            </div>
            
            {/* Step Content */}
            {checkoutStep === 1 && (
              <div className="checkout-step-content">
                <div className="delivery-info-header">
                  <h4 className="delivery-title">Delivery Information</h4>
                  <p className="delivery-subtitle">Fill in your shipping details</p>
                </div>
                
                <div className="form-grid">
                  <div className="form-group">
                    <label htmlFor="firstName">First Name *</label>
                    <div className="input-wrapper">
                      <input
                        type="text"
                        id="firstName"
                        name="firstName"
                        value={checkoutForm.firstName}
                        onChange={handleInputChange}
                        placeholder="Enter your first name"
                        className="input-field"
                      />
                      <span className="input-icon">👤</span>
                    </div>
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="lastName">Last Name *</label>
                    <div className="input-wrapper">
                      <input
                        type="text"
                        id="lastName"
                        name="lastName"
                        value={checkoutForm.lastName}
                        onChange={handleInputChange}
                        placeholder="Enter your last name"
                        className="input-field"
                      />
                      <span className="input-icon">👤</span>
                    </div>
                  </div>
                </div>
                
                <div className="form-group">
                  <label htmlFor="email">Email *</label>
                  <div className="input-wrapper">
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={checkoutForm.email}
                      onChange={handleInputChange}
                      placeholder="Enter your email address"
                      className="input-field"
                    />
                    <span className="input-icon">✉️</span>
                  </div>
                </div>
                
                <div className="form-group">
                  <label htmlFor="phone">Phone *</label>
                  <div className="input-wrapper">
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={checkoutForm.phone}
                      onChange={handleInputChange}
                      placeholder="Enter your phone number"
                      className="input-field"
                    />
                    <span className="input-icon">📱</span>
                  </div>
                </div>
                
                <div className="form-group">
                  <label htmlFor="address">Address *</label>
                  <div className="input-wrapper">
                    <input
                      type="text"
                      id="address"
                      name="address"
                      value={checkoutForm.address}
                      onChange={handleInputChange}
                      placeholder="Enter your street address"
                      className="input-field"
                    />
                    <span className="input-icon">📍</span>
                  </div>
                </div>
                
                <div className="form-grid">
                  <div className="form-group">
                    <label htmlFor="city">City *</label>
                    <div className="input-wrapper">
                      <input
                        type="text"
                        id="city"
                        name="city"
                        value={checkoutForm.city}
                        onChange={handleInputChange}
                        placeholder="Enter your city"
                        className="input-field"
                      />
                      <span className="input-icon">🏙️</span>
                    </div>
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="zipCode">ZIP Code *</label>
                    <div className="input-wrapper">
                      <input
                        type="text"
                        id="zipCode"
                        name="zipCode"
                        value={checkoutForm.zipCode}
                        onChange={handleInputChange}
                        placeholder="Enter ZIP code"
                        className="input-field"
                      />
                      <span className="input-icon">📮</span>
                    </div>
                  </div>
                </div>
                
                <div className="form-group">
                  <label htmlFor="country">Country *</label>
                  <div className="input-wrapper">
                    <input
                      type="text"
                      id="country"
                      name="country"
                      value={checkoutForm.country}
                      onChange={handleInputChange}
                      placeholder="Enter your country"
                      className="input-field"
                    />
                    <span className="input-icon">🌍</span>
                  </div>
                </div>
                
                <div className="form-actions">
                  <button 
                    type="button" 
                    className="btn btn-continue"
                    onClick={goToNextStep}
                  >
                    Continue to Payment <span className="arrow-icon">→</span>
                  </button>
                </div>
              </div>
            )}
            
            {checkoutStep === 2 && (
              <div className="checkout-step-content">
                <h4>Payment Method</h4>
                
                <div className="payment-methods">
                  <label className="payment-option">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="cash-on-delivery"
                      checked={checkoutForm.paymentMethod === 'cash-on-delivery'}
                      onChange={handleInputChange}
                    />
                    <span className="payment-label">Cash on Delivery</span>
                  </label>
                  
                  <label className="payment-option">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="card"
                      checked={checkoutForm.paymentMethod === 'card'}
                      onChange={handleInputChange}
                    />
                    <span className="payment-label">Credit/Debit Card</span>
                  </label>
                </div>
                
                {checkoutForm.paymentMethod === 'card' && (
                  <div className="card-details">
                    <div className="form-group">
                      <label htmlFor="cardNumber">Card Number *</label>
                      <input
                        type="text"
                        id="cardNumber"
                        name="cardNumber"
                        value={checkoutForm.cardNumber}
                        onChange={handleInputChange}
                        placeholder="1234 1234 1234 1234"
                      />
                    </div>
                    
                    <div className="form-row">
                      <div className="form-group">
                        <label htmlFor="expiryDate">Expiry Date *</label>
                        <input
                          type="text"
                          id="expiryDate"
                          name="expiryDate"
                          value={checkoutForm.expiryDate}
                          onChange={handleInputChange}
                          placeholder="MM/YY"
                        />
                      </div>
                      <div className="form-group">
                        <label htmlFor="cvv">CVV *</label>
                        <input
                          type="text"
                          id="cvv"
                          name="cvv"
                          value={checkoutForm.cvv}
                          onChange={handleInputChange}
                          placeholder="123"
                        />
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="form-actions">
                  <button 
                    type="button" 
                    className="btn btn-secondary"
                    onClick={goToPreviousStep}
                  >
                    Back
                  </button>
                  <button 
                    type="button" 
                    className="btn btn-primary"
                    onClick={goToNextStep}
                  >
                    Review Order
                  </button>
                </div>
              </div>
            )}
            
            {checkoutStep === 3 && (
              <div className="checkout-step-content">
                <div className="review-header">
                  <h4 className="review-title">Review Your Order</h4>
                  <p className="review-subtitle">Please confirm your order details before placing</p>
                </div>
                
                <div className="review-section">
                  <div className="section-card">
                    <div className="section-header">
                      <h5 className="section-title"><span className="section-icon">📦</span> Delivery Information</h5>
                    </div>
                    <div className="section-content">
                      <div className="info-row">
                        <span className="info-label">Name:</span>
                        <span className="info-value">{checkoutForm.firstName} {checkoutForm.lastName}</span>
                      </div>
                      <div className="info-row">
                        <span className="info-label">Email:</span>
                        <span className="info-value">{checkoutForm.email}</span>
                      </div>
                      <div className="info-row">
                        <span className="info-label">Phone:</span>
                        <span className="info-value">{checkoutForm.phone}</span>
                      </div>
                      <div className="info-row">
                        <span className="info-label">Address:</span>
                        <span className="info-value">{checkoutForm.address}, {checkoutForm.city}, {checkoutForm.zipCode}, {checkoutForm.country}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="section-card">
                    <div className="section-header">
                      <h5 className="section-title"><span className="section-icon">💳</span> Payment Method</h5>
                    </div>
                    <div className="section-content">
                      <div className={`payment-badge ${checkoutForm.paymentMethod === 'cash-on-delivery' ? 'cod' : 'card'}`}>
                        <span className="payment-method">{checkoutForm.paymentMethod === 'cash-on-delivery' ? 'Cash on Delivery' : 'Credit/Debit Card'}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="section-card">
                    <div className="section-header">
                      <h5 className="section-title"><span className="section-icon">📋</span> Order Items</h5>
                    </div>
                    <div className="order-items">
                      {cartItems.map(item => (
                        <div key={item.id || item.bookId} className="order-item">
                          <div className="item-info">
                            <span className="item-name">{item.title}</span>
                            <span className="item-qty">x {item.quantity}</span>
                          </div>
                          <div className="item-price">${(item.price * item.quantity).toFixed(2)}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="order-total">
                    <div className="total-row">
                      <span className="total-label">Total:</span>
                      <span className="total-amount">${calculateTotal()}</span>
                    </div>
                  </div>
                </div>
                
                <div className="form-actions">
                  <button 
                    type="button" 
                    className="btn btn-back"
                    onClick={goToPreviousStep}
                  >
                    ← Back
                  </button>
                  <button 
                    type="button" 
                    className="btn btn-place-order"
                    onClick={handlePlaceOrder}
                  >
                    Place Order <span className="check-icon">✅</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Order Success Notification */}
      {showOrderSuccess && (
        <div className="success-overlay">
          <div className="success-content">
            <div className="success-animation">
              <div className="checkmark-circle">
                <span className="checkmark-icon">✓</span>
              </div>
            </div>
            
            <div className="success-header">
              <h3 className="success-title">Order Placed Successfully!</h3>
              <p className="success-message">Your order has been confirmed and will be processed shortly.</p>
            </div>
            
            <div className="order-details">
              <div className="order-id-card">
                <span className="order-label">Order Number</span>
                <span className="order-id">#{orderId}</span>
              </div>
              <div className="order-id-card mt-3">
                <span className="order-label">Unique Order ID</span>
                <span className="order-id">{uniqueOrderId}</span>
              </div>
            </div>
            
            <p className="thank-you-message">Thank you for shopping with us!</p>
            
            <button 
              className="btn btn-continue-shopping"
              onClick={closeOrderSuccess}
            >
              <span className="shopping-icon">🛍️</span> Continue Shopping
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// Add CSS for enhanced cart design
const enhancedStyles = `
.cart-header {
  text-align: center;
  margin-bottom: 2rem;
}

.cart-title-container {
  margin-bottom: 1rem;
}

.page-title {
  font-size: 2.5rem;
  color: #2c3e50;
  margin-bottom: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.cart-icon {
  font-size: 1.8rem;
}

.cart-subtitle {
  color: #7f8c8d;
  font-size: 1.1rem;
  margin: 0;
}

.cart-item {
  display: grid;
  grid-template-columns: 120px 1fr auto auto auto;
  align-items: center;
  gap: 1rem;
  padding: 1.5rem;
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  background: white;
  box-shadow: 0 2px 10px rgba(0,0,0,0.05);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.cart-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 20px rgba(0,0,0,0.1);
}

.cart-item-image img {
  width: 100%;
  height: 150px;
  object-fit: cover;
  border-radius: 8px;
  border: 1px solid #eee;
}

.cart-item-details h3 {
  margin: 0 0 0.5rem 0;
  color: #2c3e50;
  font-size: 1.2rem;
}

.cart-item-details .author {
  color: #7f8c8d;
  font-style: italic;
  margin: 0 0 0.5rem 0;
  font-size: 0.9rem;
}

.cart-item-details .price {
  font-weight: bold;
  color: #e74c3c;
  margin: 0;
  font-size: 1.1rem;
}

.cart-item-quantity {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.quantity-btn {
  width: 32px;
  height: 32px;
  border: 2px solid #3498db;
  background: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  color: #3498db;
}

.quantity-btn:hover {
  background: #3498db;
  color: white;
  transform: scale(1.1);
}

.quantity {
  font-weight: bold;
  min-width: 2rem;
  text-align: center;
  font-size: 1.1rem;
}

.remove-btn {
  background: #e74c3c;
  color: white;
  border: none;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 1rem;
}

.remove-btn:hover {
  background: #c0392b;
  transform: scale(1.1);
}

.cart-summary {
  padding: 1.8rem;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-radius: 12px;
  align-self: flex-start;
  box-shadow: 0 4px 15px rgba(0,0,0,0.08);
}

.summary-title {
  font-size: 1.4rem;
  color: #2c3e50;
  margin: 0 0 1.2rem 0;
  padding-bottom: 0.8rem;
  border-bottom: 2px solid #3498db;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.8rem;
  font-size: 1.1rem;
}

.summary-value {
  color: #27ae60;
  font-weight: 500;
}

.summary-divider {
  height: 1px;
  background: #dee2e6;
  margin: 0.8rem 0;
}

.summary-row.total {
  border-top: 2px solid #dee2e6;
  padding-top: 0.8rem;
  margin-top: 0.5rem;
  font-weight: bold;
  font-size: 1.2rem;
  color: #2c3e50;
}

.total-amount {
  color: #e74c3c;
  font-size: 1.4rem;
}

.btn-checkout {
  background: linear-gradient(135deg, #3498db 0%, #2980b9 100%);
  color: white;
  border: none;
  padding: 1rem;
  border-radius: 8px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 1.2rem !important;
}

.btn-checkout:hover {
  background: linear-gradient(135deg, #2980b9 0%, #1f618d 100%);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(52, 152, 219, 0.3);
}

.checkout-text {
  flex: 1;
  text-align: center;
}

.checkout-arrow {
  margin-left: 0.5rem;
  font-size: 1.2rem;
}

.secure-checkout {
  text-align: center;
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px dashed #dee2e6;
  color: #7f8c8d;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.lock-icon {
  font-size: 0.9rem;
}

/* Checkout Modal Styles */
.checkout-progress {
  display: flex;
  justify-content: space-between;
  margin: 1.5rem 0;
  position: relative;
}

.checkout-progress::before {
  content: '';
  position: absolute;
  top: 20px;
  left: 0;
  right: 0;
  height: 2px;
  background: #e0e0e0;
  z-index: 1;
}

.step {
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  z-index: 2;
}

.step.active .step-number {
  background: #3498db;
  color: white;
}

.step-number {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #e0e0e0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  margin-bottom: 0.5rem;
}

.step-label {
  font-size: 0.9rem;
  color: #666;
}

.step.active .step-label {
  color: #3498db;
  font-weight: 500;
}

.checkout-step-content {
  padding: 1rem 0;
}

.payment-methods {
  margin: 1rem 0;
}

.payment-option {
  display: flex;
  align-items: center;
  margin-bottom: 1rem;
  padding: 1rem;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  cursor: pointer;
}

.payment-option input[type="radio"] {
  margin-right: 0.5rem;
}

.card-details {
  margin-top: 1rem;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 8px;
}

.order-summary {
  margin: 1rem 0;
}

.order-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
  padding: 0.5rem 0;
  border-bottom: 1px solid #eee;
}

.delivery-info-header {
  text-align: center;
  margin-bottom: 1.5rem;
}

.delivery-title {
  font-size: 1.5rem;
  color: #2c3e50;
  margin: 0 0 0.5rem 0;
  font-weight: 600;
}

.delivery-subtitle {
  color: #7f8c8d;
  margin: 0;
  font-size: 1rem;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-bottom: 1rem;
}

.form-group {
  margin-bottom: 1.2rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #2c3e50;
  font-size: 0.95rem;
}

.input-wrapper {
  position: relative;
}

.input-field {
  width: 100%;
  padding: 0.8rem 3rem 0.8rem 1rem;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.3s ease;
  background: #ffffff;
}

.input-field:focus {
  outline: none;
  border-color: #3498db;
  box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.1);
}

.input-icon {
  position: absolute;
  right: 1rem;
  top: 50%;
  transform: translateY(-50%);
  pointer-events: none;
  font-size: 1.1rem;
  color: #7f8c8d;
}

.btn-continue {
  background: linear-gradient(135deg, #3498db 0%, #2980b9 100%);
  color: white;
  border: none;
  padding: 0.9rem 1.8rem;
  border-radius: 8px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.btn-continue:hover {
  background: linear-gradient(135deg, #2980b9 0%, #1f618d 100%);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(52, 152, 219, 0.3);
}

.arrow-icon {
  font-size: 1.2rem;
  transition: transform 0.3s ease;
}

.btn-continue:hover .arrow-icon {
  transform: translateX(3px);
}

.review-header {
  text-align: center;
  margin-bottom: 1.5rem;
}

.review-title {
  font-size: 1.5rem;
  color: #2c3e50;
  margin: 0 0 0.5rem 0;
  font-weight: 600;
}

.review-subtitle {
  color: #7f8c8d;
  margin: 0;
  font-size: 1rem;
}

.review-section {
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
  margin-bottom: 1.5rem;
}

.section-card {
  background: #ffffff;
  border-radius: 12px;
  border: 1px solid #e0e0e0;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0,0,0,0.05);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.section-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0,0,0,0.08);
}

.section-header {
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #e0e0e0;
}

.section-title {
  margin: 0;
  font-size: 1.1rem;
  color: #2c3e50;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.section-icon {
  font-size: 1.2rem;
}

.section-content {
  padding: 1.5rem;
}

.info-row {
  display: flex;
  margin-bottom: 0.8rem;
  padding-bottom: 0.8rem;
  border-bottom: 1px dashed #eee;
}

.info-row:last-child {
  margin-bottom: 0;
  padding-bottom: 0;
  border-bottom: none;
}

.info-label {
  font-weight: 600;
  color: #34495e;
  min-width: 80px;
  margin-right: 1rem;
}

.info-value {
  color: #2c3e50;
  flex: 1;
}

.payment-badge {
  display: inline-block;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-weight: 600;
  font-size: 0.9rem;
}

.payment-badge.cod {
  background: #ffeaa7;
  color: #d35400;
}

.payment-badge.card {
  background: #74b9ff;
  color: white;
}

.order-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.8rem 0;
  border-bottom: 1px solid #f0f0f0;
}

.order-item:last-child {
  border-bottom: none;
}

.item-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.item-name {
  font-weight: 500;
  color: #2c3e50;
}

.item-qty {
  color: #7f8c8d;
  font-size: 0.9rem;
}

.item-price {
  font-weight: 600;
  color: #27ae60;
}

.order-total {
  background: linear-gradient(135deg, #3498db 0%, #2980b9 100%);
  color: white;
  border-radius: 12px;
  padding: 1.2rem 1.5rem;
  margin-top: 1rem;
}

.total-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 1.2rem;
  font-weight: 600;
}

.total-label {
  font-size: 1.1rem;
}

.total-amount {
  font-size: 1.4rem;
  color: #fff;
}

.btn-back {
  background: #6c757d;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s ease;
}

.btn-back:hover {
  background: #5a6268;
  transform: translateY(-2px);
}

.btn-place-order {
  background: linear-gradient(135deg, #2ecc71 0%, #27ae60 100%);
  color: white;
  border: none;
  padding: 0.75rem 1.8rem;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-place-order:hover {
  background: linear-gradient(135deg, #27ae60 0%, #219653 100%);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(46, 204, 113, 0.3);
}

.check-icon {
  font-size: 1.2rem;
}

.success-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: fadeIn 0.5s ease;
}

.success-content {
  background: white;
  border-radius: 20px;
  padding: 2.5rem;
  text-align: center;
  max-width: 450px;
  width: 90%;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
  position: relative;
  animation: slideInUp 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.success-animation {
  margin-bottom: 1.5rem;
}

.checkmark-circle {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background: linear-gradient(135deg, #2ecc71 0%, #27ae60 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1.5rem;
  position: relative;
  overflow: hidden;
}

.checkmark-circle::before {
  content: '';
  position: absolute;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  animation: pulse 2s infinite;
}

.checkmark-icon {
  font-size: 3rem;
  color: white;
  z-index: 2;
}

.success-header {
  margin-bottom: 1.5rem;
}

.success-title {
  font-size: 1.8rem;
  color: #2c3e50;
  margin: 0 0 0.5rem 0;
  font-weight: 700;
}

.success-message {
  color: #7f8c8d;
  margin: 0;
  font-size: 1.1rem;
}

.order-details {
  margin: 1.5rem 0;
}

.order-id-card {
  background: linear-gradient(135deg, #3498db 0%, #2980b9 100%);
  color: white;
  padding: 1rem;
  border-radius: 12px;
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  min-width: 200px;
}

.order-label {
  font-size: 0.9rem;
  opacity: 0.9;
  margin-bottom: 0.3rem;
}

.order-id {
  font-size: 1.5rem;
  font-weight: 700;
}

.thank-you-message {
  color: #27ae60;
  font-size: 1.1rem;
  font-weight: 600;
  margin: 1rem 0;
}

.btn-continue-shopping {
  background: linear-gradient(135deg, #9b59b6 0%, #8e44ad 100%);
  color: white;
  border: none;
  padding: 0.9rem 1.8rem;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1.1rem;
  font-weight: 600;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-continue-shopping:hover {
  background: linear-gradient(135deg, #8e44ad 0%, #7d3c98 100%);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(155, 89, 182, 0.4);
}

.shopping-icon {
  font-size: 1.2rem;
}

.form-actions {
  display: flex;
  gap: 1rem;
  margin-top: 1.5rem;
  justify-content: flex-end;
}

.btn-secondary {
  background: #6c757d;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 6px;
  cursor: pointer;
}

.btn-primary {
  background: #007bff;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 6px;
  cursor: pointer;
}

.btn-success {
  background: #28a745;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 6px;
  cursor: pointer;
}

.mt-2 {
  margin-top: 0.5rem;
}

.mt-3 {
  margin-top: 1rem;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(50px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes pulse {
  0% { transform: scale(0.8); opacity: 0.7; }
  50% { transform: scale(1.1); opacity: 0.3; }
  100% { transform: scale(0.8); opacity: 0.7; }
}

@media (max-width: 768px) {
  .page-title {
    font-size: 2rem;
  }
  
  .cart-item {
    grid-template-columns: 80px 1fr auto;
    grid-template-rows: auto auto;
  }
  
  .cart-item-quantity,
  .cart-item-total {
    grid-column: 2 / -1;
    justify-self: end;
  }
  
  .remove-btn {
    grid-column: 3;
    grid-row: 1;
    justify-self: end;
  }
  
  .cart-summary {
    margin-top: 1.5rem;
  }
  
  .form-row {
    flex-direction: column;
    gap: 1rem;
  }
  
  .checkout-progress {
    display: none;
  }
  
  .form-actions {
    flex-direction: column;
  }
}
`;

// Add enhanced styles to document
const enhancedStyleSheet = document.createElement("style");
enhancedStyleSheet.type = "text/css";
enhancedStyleSheet.innerText = enhancedStyles;
document.head.appendChild(enhancedStyleSheet);

export default Cart;