import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaBox, FaTruck, FaCheckCircle, FaTimes } from 'react-icons/fa';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orderDetails, setOrderDetails] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const { user } = useAuth();
  
  // Extract user ID from the authenticated user
  const userId = user?.id || user?.userId || user?._id || 1;

  // Fetch order data from backend
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await api.get(`/orders/user/${userId}`);
        // Transform the backend data to match our frontend structure
        const transformedOrders = response.data.map(order => ({
          id: order.orderId,
          date: order.createdAt ? new Date(order.createdAt).toISOString().split('T')[0] : 'N/A',
          total: order.totalAmount,
          status: order.orderStatus,
          items: [] // We'll fetch order items separately if needed
        }));
        setOrders(transformedOrders);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching orders:', error);
        setLoading(false);
      }
    };

    fetchOrders();
  }, [userId]);

  const fetchOrderDetails = async (orderId) => {
    try {
      // Fetch order details
      const orderResponse = await api.get(`/orders/${orderId}`);
      const orderData = orderResponse.data;
      
      // Fetch order items
      const itemsResponse = await api.get(`/order-items/order/${orderId}`);
      const orderItems = itemsResponse.data;
      
      // Combine the data
      const fullOrderDetails = {
        ...orderData,
        items: orderItems.map(item => ({
          id: item.orderItemId,
          title: item.book?.title || 'Unknown Book',
          author: item.book?.author || 'Unknown Author',
          quantity: item.quantity,
          price: item.price,
          bookId: item.book?.bookId
        }))
      };
      
      setOrderDetails(fullOrderDetails);
      setShowModal(true);
    } catch (error) {
      console.error('Error fetching order details:', error);
      alert('Failed to load order details. Please try again.');
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setOrderDetails(null);
  };

  const getStatusIcon = (status) => {
    switch (status.toLowerCase()) {
      case 'delivered':
        return <FaCheckCircle className="status-icon delivered" />;
      case 'shipped':
        return <FaTruck className="status-icon shipped" />;
      case 'processing':
        return <FaBox className="status-icon processing" />;
      default:
        return <FaBox className="status-icon" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'delivered':
        return '#28a745';
      case 'shipped':
        return '#ffc107';
      case 'processing':
        return '#17a2b8';
      default:
        return '#6c757d';
    }
  };

  return (
    <div className="orders-page py-8">
      <div className="container">
        <motion.h1 
          className="page-title text-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          My Orders
        </motion.h1>

        {loading ? (
          <div className="loading text-center">
            <p>Loading your orders...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="empty-orders text-center">
            <h3>No orders found</h3>
            <p>You haven't placed any orders yet.</p>
          </div>
        ) : (
          <div className="orders-list">
            {orders.map((order, index) => (
              <motion.div
                key={order.id}
                className="order-card card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="order-header">
                  <div className="order-id">Order #{order.id}</div>
                  <div className="order-date">{order.date}</div>
                  <div 
                    className="order-status"
                    style={{ color: getStatusColor(order.status) }}
                  >
                    {getStatusIcon(order.status)} {order.status}
                  </div>
                </div>
                
                <div className="order-items">
                  <h4>Items:</h4>
                  <ul>
                    {order.items.map(item => (
                      <li key={item.id} className="order-item">
                        <span>{item.title}</span>
                        <span>Qty: {item.quantity}</span>
                        <span>${(item.price).toFixed(2)}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div className="order-footer">
                  <div className="order-total">Total: ${order.total.toFixed(2)}</div>
                  <button 
                    className="btn btn-secondary"
                    onClick={() => fetchOrderDetails(order.id)}
                  >
                    View Details
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Order Details Modal */}
      {showModal && orderDetails && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Order Details</h2>
              <button className="close-button" onClick={closeModal}>
                <FaTimes />
              </button>
            </div>
            
            <div className="modal-body">
              <div className="order-summary">
                <div className="summary-row">
                  <span>Order ID:</span>
                  <span>#{orderDetails.orderId}</span>
                </div>
                <div className="summary-row">
                  <span>Date:</span>
                  <span>{orderDetails.createdAt ? new Date(orderDetails.createdAt).toLocaleDateString() : 'N/A'}</span>
                </div>
                <div className="summary-row">
                  <span>Status:</span>
                  <span style={{ color: getStatusColor(orderDetails.orderStatus) }}>
                    {getStatusIcon(orderDetails.orderStatus)} {orderDetails.orderStatus}
                  </span>
                </div>
                <div className="summary-row">
                  <span>Total Amount:</span>
                  <span>${orderDetails.totalAmount?.toFixed(2)}</span>
                </div>
              </div>
              
              <div className="order-items-details">
                <h3>Items in this Order:</h3>
                <div className="items-list">
                  {orderDetails.items.map(item => (
                    <div key={item.id} className="item-detail">
                      <div className="item-info">
                        <h4>{item.title}</h4>
                        <p>by {item.author}</p>
                      </div>
                      <div className="item-quantity">Qty: {item.quantity}</div>
                      <div className="item-price">${(item.price * item.quantity).toFixed(2)}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;

const styles = `
.orders-page {
  min-height: 70vh;
}

.page-title {
  font-size: 2.5rem;
  color: #333;
  margin-bottom: 2rem;
}

.empty-orders {
  padding: 4rem 0;
}

.empty-orders h3 {
  font-size: 1.5rem;
  color: #333;
  margin-bottom: 1rem;
}

.orders-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.order-card {
  padding: 1.5rem;
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.order-id {
  font-weight: bold;
  color: #333;
}

.order-date {
  color: #666;
}

.order-status {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 500;
}

.status-icon {
  font-size: 1.2rem;
}

.status-icon.delivered {
  color: #28a745;
}

.status-icon.shipped {
  color: #ffc107;
}

.status-icon.processing {
  color: #17a2b8;
}

.order-items h4 {
  margin-bottom: 0.5rem;
  color: #333;
}

.order-items ul {
  list-style: none;
  padding: 0;
}

.order-item {
  display: flex;
  justify-content: space-between;
  padding: 0.5rem 0;
  border-bottom: 1px solid #eee;
}

.order-item:last-child {
  border-bottom: none;
}

.order-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #eee;
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 8px;
  max-width: 600px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #eee;
}

.modal-header h2 {
  margin: 0;
  color: #333;
}

.close-button {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #666;
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-button:hover {
  color: #333;
}

.modal-body {
  padding: 1.5rem;
}

.order-summary {
  margin-bottom: 2rem;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  padding: 0.5rem 0;
  border-bottom: 1px solid #f0f0f0;
}

.summary-row:last-child {
  border-bottom: none;
  font-weight: bold;
  font-size: 1.1rem;
}

.order-items-details h3 {
  margin-bottom: 1rem;
  color: #333;
  border-bottom: 2px solid #333;
  padding-bottom: 0.5rem;
}

.item-detail {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border: 1px solid #eee;
  border-radius: 4px;
  margin-bottom: 0.5rem;
}

.item-info h4 {
  margin: 0 0 0.25rem 0;
  color: #333;
}

.item-info p {
  margin: 0;
  color: #666;
  font-size: 0.9rem;
}

.item-quantity {
  color: #666;
}

.item-price {
  font-weight: bold;
  color: #333;
}

@media (max-width: 768px) {
  .order-header {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .order-footer {
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
  }
  
  .order-item {
    flex-direction: column;
    gap: 0.25rem;
  }
  
  .modal-content {
    width: 95%;
    margin: 1rem;
  }
  
  .item-detail {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
  
  .summary-row {
    flex-direction: column;
    gap: 0.25rem;
  }
}
`;

// Add styles to the document
const styleSheet = document.createElement("style");
styleSheet.type = "text/css";
styleSheet.innerText = styles;
document.head.appendChild(styleSheet);