import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  FaBook, FaUser, FaShoppingCart, FaChartBar, FaPlus, FaEdit, FaTrash, FaEye, 
  FaSave, FaTimes, FaSearch, FaBell, FaCog, FaSignOutAlt, FaArrowUp, 
  FaArrowDown, FaExclamationTriangle, FaBox, FaMoneyBillWave, FaChartLine,
  FaFilter, FaEllipsisV, FaChevronDown, FaStar, FaRegStar
} from 'react-icons/fa';
import api from '../services/api';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [books, setBooks] = useState([]);
  const [users, setUsers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [currentBook, setCurrentBook] = useState(null);
  const [newBook, setNewBook] = useState({
    title: '',
    author: '',
    price: '',
    category: '',
    description: '',
    imageUrl: '',
    stock: ''
  });
  
  // State for handling image upload
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [uploading, setUploading] = useState(false);

  const [stats, setStats] = useState({
    totalBooks: 0,
    totalUsers: 0,
    totalOrders: 0,
    totalRevenue: 0
  });
  
  const [recentActivity, setRecentActivity] = useState([]);
  const [topSelling, setTopSelling] = useState([]);
  const [performanceMetrics, setPerformanceMetrics] = useState({});
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  

  
  // Notification state
  const [notifications, setNotifications] = useState([{
    id: 1,
    message: 'New order received',
    time: '2 mins ago',
    type: 'info'
  }, {
    id: 2,
    message: 'Low stock alert: Harry Potter',
    time: '10 mins ago',
    type: 'warning'
  }]);
  
  // Chart data
  const [salesData, setSalesData] = useState([
    { month: 'Jan', sales: 12000 },
    { month: 'Feb', sales: 19000 },
    { month: 'Mar', sales: 15000 },
    { month: 'Apr', sales: 18000 },
    { month: 'May', sales: 22000 },
    { month: 'Jun', sales: 30000 },
  ]);
  
  const [userGrowthData, setUserGrowthData] = useState([
    { month: 'Jan', users: 120 },
    { month: 'Feb', users: 190 },
    { month: 'Mar', users: 150 },
    { month: 'Apr', users: 180 },
    { month: 'May', users: 220 },
    { month: 'Jun', users: 300 },
  ]);
  
  const [chartType, setChartType] = useState('sales');
  
  // Filter and sort states
  const [filters, setFilters] = useState({
    status: 'all',
    dateRange: 'all',
    searchQuery: ''
  });

  // Fetch data from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch dashboard data from new admin endpoint
        const token = localStorage.getItem('token');
        const dashboardResponse = await api.get('http://localhost:8081/api/admin/dashboard', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const dashboardData = dashboardResponse.data;
        
        // Extract data from response
        setStats(dashboardData.stats);
        setRecentActivity(dashboardData.recentOrders);
        setTopSelling(dashboardData.topSelling);
        setPerformanceMetrics(dashboardData.performance);
        
        // Fetch books, users, and orders separately for table views
        const booksResponse = await api.get('http://localhost:8081/api/books', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        setBooks(booksResponse.data);
        
        const usersResponse = await api.get('http://localhost:8081/api/users', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        setUsers(usersResponse.data);
        
        const ordersResponse = await api.get('http://localhost:8081/api/orders', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        setOrders(ordersResponse.data);
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        
        // Fallback to original method if admin endpoint fails
        try {
          const token = localStorage.getItem('token');
          
          // Fetch books
          const booksResponse = await api.get('http://localhost:8081/api/books', {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          const booksData = booksResponse.data;
          setBooks(booksData);
          
          // Fetch users
          const usersResponse = await api.get('http://localhost:8081/api/users', {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          const usersData = usersResponse.data;
          setUsers(usersData);
          
          // Fetch orders
          const ordersResponse = await api.get('http://localhost:8081/api/orders', {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          const ordersData = ordersResponse.data;
          setOrders(ordersData);
          
          // Calculate stats
          const totalBooks = booksData.length;
          const totalUsers = usersData.length;
          const totalOrders = ordersData.length;
          const totalRevenue = ordersData.reduce((sum, order) => sum + (order.totalAmount || order.total_amount || 0), 0);
          
          setStats({
            totalBooks,
            totalUsers,
            totalOrders,
            totalRevenue
          });
          
          // Get recent activity (last 5 orders)
          const sortedOrders = [...ordersData].sort((a, b) => 
            new Date(b.createdAt || b.created_at) - new Date(a.createdAt || a.created_at)
          );
          setRecentActivity(sortedOrders.slice(0, 5));
          
          // Calculate performance metrics
          const today = new Date();
          const sevenDaysAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
          
          const recentOrders = ordersData.filter(order => {
            const orderDate = new Date(order.createdAt || order.created_at);
            return orderDate >= sevenDaysAgo;
          });
          
          const recentRevenue = recentOrders.reduce((sum, order) => 
            sum + (order.totalAmount || order.total_amount || 0), 0);
          
          setPerformanceMetrics({
            ordersLast7Days: recentOrders.length,
            revenueLast7Days: recentRevenue,
            avgOrderValue: recentOrders.length > 0 ? recentRevenue / recentOrders.length : 0
          });
          
          setLoading(false);
        } catch (fallbackError) {
          console.error('Error with fallback method:', fallbackError);
          setLoading(false);
        }
      }
    };

    fetchData();
    
    // Refresh data every 30 seconds
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  // Handle adding a new book
  const handleAddBook = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await api.post('http://localhost:8081/api/books', newBook, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setBooks([...books, response.data]);
      setNewBook({
        title: '',
        author: '',
        price: '',
        category: '',
        description: '',
        imageUrl: '',
        stock: ''
      });
      setShowAddForm(false);
    } catch (error) {
      console.error('Error adding book:', error);
    }
  };

  // Handle updating a book
  const handleUpdateBook = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await api.put(`http://localhost:8081/api/books/${currentBook.bookId}`, currentBook, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setBooks(books.map(book => book.bookId === currentBook.bookId ? response.data : book));
      setShowEditForm(false);
      setCurrentBook(null);
    } catch (error) {
      console.error('Error updating book:', error);
    }
  };
  

  // Handle deleting a book
  const handleDeleteBook = async (bookId) => {
    if (window.confirm('Are you sure you want to delete this book?')) {
      try {
        const token = localStorage.getItem('token');
        await api.delete(`http://localhost:8081/api/books/${bookId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        setBooks(books.filter(book => book.bookId !== bookId));
      } catch (error) {
        console.error('Error deleting book:', error);
      }
    }
  };

  // Function to update order status
  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const token = localStorage.getItem('token');
      const response = await api.put(
        `http://localhost:8081/api/orders/${orderId}/status`,
        { status: newStatus },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      // Update the order in the local state
      setOrders(orders.map(order => 
        order.orderId === orderId || order.id === orderId
          ? { ...response.data }
          : order
      ));
      
      // Also update the selected order if it's currently viewed
      if (selectedOrder && (selectedOrder.orderId === orderId || selectedOrder.id === orderId)) {
        setSelectedOrder(response.data);
      }
      
      alert('Order status updated successfully!');
    } catch (error) {
      console.error('Error updating order status:', error.response || error);
      alert(`Failed to update order status: ${error.response?.data?.message || error.message || 'Unknown error'}`);
    }
  };

  // Function to open order details modal
  const openOrderDetails = (order) => {
    setSelectedOrder(order);
    setShowOrderModal(true);
  };

  // Function to close order details modal
  const closeOrderDetails = () => {
    setShowOrderModal(false);
    setSelectedOrder(null);
  };

  // Filter books based on search term
  const filteredBooks = books.filter(book =>
    book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    book.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
    book.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: <FaChartBar /> },
    { id: 'books', label: 'Manage Books', icon: <FaBook /> },
    { id: 'categories', label: 'Categories', icon: <FaBox /> },
    { id: 'orders', label: 'Manage Orders', icon: <FaShoppingCart /> },
    { id: 'users', label: 'Manage Users', icon: <FaUser /> }
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
    <div className="admin-dashboard min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="p-6">
        {/* The 'under construction' message has been removed */}
        {/* Dashboard and other tab content is shown in the tab-content section */}
        
        {/* Tabs */}
        <motion.div 
          className="admin-tabs card mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="tab-nav">
            {tabs.map(tab => (
              <button
                key={tab.id}
                className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>
          
          <div className="tab-content">
            {activeTab === 'dashboard' && (
              <motion.div 
                className="dashboard-content"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                <div className="welcome-section">
                  <div className="welcome-card bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-800 text-white p-8 rounded-2xl shadow-2xl mb-8">
                    <div className="flex flex-col md:flex-row justify-between items-center">
                      <div className="welcome-text">
                        <h3 className="text-3xl font-bold mb-2">Welcome to Admin Dashboard</h3>
                        <p className="text-lg text-blue-100">Manage your bookstore efficiently from here.</p>
                      </div>
                      <div className="dashboard-icon text-6xl mt-4 md:mt-0">📊</div>
                    </div>
                  </div>
                </div>
                
                <div className="dashboard-stats-grid grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="stat-card bg-gradient-to-br from-blue-50 to-indigo-100 p-6 rounded-2xl shadow-lg border border-blue-100">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-xl font-bold text-blue-800 flex items-center gap-2">
                        <span className="recent-activity-icon">🔄</span> Recent Activity
                      </h4>
                    </div>
                    <div className="space-y-3">
                      {recentActivity.length > 0 ? (
                        recentActivity.map((order, index) => (
                          <div key={index} className="activity-item bg-white p-3 rounded-lg shadow-sm border-l-4 border-blue-500">
                            <div className="flex justify-between items-center">
                              <span className="font-medium text-gray-800">Order #{order.orderId || order.id}</span>
                              <span className="font-bold text-green-600">${order.totalAmount || order.total_amount || 0}</span>
                            </div>
                            <div className="text-sm text-gray-600 mt-1">
                              {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'N/A'}
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-gray-500 text-center py-4">No recent activity</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="stat-card bg-gradient-to-br from-green-50 to-emerald-100 p-6 rounded-2xl shadow-lg border border-green-100">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-xl font-bold text-green-800 flex items-center gap-2">
                        <span className="top-selling-icon">🏆</span> Top Selling
                      </h4>
                    </div>
                    <div className="space-y-3">
                      {topSelling.length > 0 ? (
                        topSelling.map((book, index) => (
                          <div key={index} className="selling-item bg-white p-3 rounded-lg shadow-sm border-l-4 border-green-500">
                            <div className="font-medium text-gray-800">{book.title}</div>
                            <div className="text-sm text-gray-600">by {book.author}</div>
                          </div>
                        ))
                      ) : (
                        <p className="text-gray-500 text-center py-4">No data available</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="stat-card bg-gradient-to-br from-amber-50 to-orange-100 p-6 rounded-2xl shadow-lg border border-amber-100">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-xl font-bold text-amber-800 flex items-center gap-2">
                        <span className="performance-icon">📈</span> Performance
                      </h4>
                    </div>
                    <div className="space-y-4">
                      {performanceMetrics.ordersLast7Days !== undefined ? (
                        <>
                          <div className="metric-item flex justify-between items-center p-3 bg-white rounded-lg shadow-sm">
                            <span className="text-gray-700">Orders (7 days)</span>
                            <span className="font-bold text-blue-600">{performanceMetrics.ordersLast7Days}</span>
                          </div>
                          <div className="metric-item flex justify-between items-center p-3 bg-white rounded-lg shadow-sm">
                            <span className="text-gray-700">Revenue (7 days)</span>
                            <span className="font-bold text-green-600">${performanceMetrics.revenueLast7Days?.toFixed(2)}</span>
                          </div>
                          <div className="metric-item flex justify-between items-center p-3 bg-white rounded-lg shadow-sm">
                            <span className="text-gray-700">Avg Order Value</span>
                            <span className="font-bold text-purple-600">${performanceMetrics.avgOrderValue?.toFixed(2)}</span>
                          </div>
                        </>
                      ) : (
                        <p className="text-gray-500 text-center py-4">No data available</p>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
            
            {activeTab === 'books' && (
              <motion.div 
                className="manage-books"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-2xl font-bold">Manage Books</h3>
                  <div className="flex gap-4">
                    <div className="search-box relative">
                      <FaSearch className="search-icon absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search books..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="search-input pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <button 
                      className="btn btn-primary flex items-center gap-2"
                      onClick={() => setShowAddForm(true)}
                    >
                      <FaPlus /> Add New Book
                    </button>
                  </div>
                </div>

                {/* Add Book Form */}
                {showAddForm && (
                  <motion.div 
                    className="add-book-form card p-6 mb-6"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                  >
                    <h4 className="text-xl font-semibold mb-4">Add New Book</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <input
                        type="text"
                        placeholder="Title"
                        value={newBook.title}
                        onChange={(e) => setNewBook({...newBook, title: e.target.value})}
                        className="form-input"
                      />
                      <input
                        type="text"
                        placeholder="Author"
                        value={newBook.author}
                        onChange={(e) => setNewBook({...newBook, author: e.target.value})}
                        className="form-input"
                      />
                      <input
                        type="number"
                        placeholder="Price"
                        value={newBook.price}
                        onChange={(e) => setNewBook({...newBook, price: e.target.value})}
                        className="form-input"
                      />
                      <input
                        type="text"
                        placeholder="Category"
                        value={newBook.category}
                        onChange={(e) => setNewBook({...newBook, category: e.target.value})}
                        className="form-input"
                      />
                      <input
                        type="number"
                        placeholder="Stock"
                        value={newBook.stock}
                        onChange={(e) => setNewBook({...newBook, stock: e.target.value})}
                        className="form-input"
                      />
                      <div className="image-upload-container">
                        <div className="image-url-input mb-3">
                          <input
                            type="text"
                            placeholder="Enter image URL"
                            value={newBook.imageUrl || ''}
                            onChange={(e) => setNewBook({...newBook, imageUrl: e.target.value})}
                            className="form-input w-full"
                          />
                        </div>
                        {newBook.imageUrl && (
                          <div className="image-preview-wrapper">
                            <img src={newBook.imageUrl} alt="Preview" className="image-preview" onError={(e) => e.target.src='https://via.placeholder.com/200x250.png?text=Invalid+Image'} />
                          </div>
                        )}
                      </div>
                    </div>
                    <textarea
                      placeholder="Description"
                      value={newBook.description}
                      onChange={(e) => setNewBook({...newBook, description: e.target.value})}
                      className="form-textarea mt-4 w-full p-3 border border-gray-300 rounded-lg"
                      rows="3"
                    />
                    <div className="flex gap-2 mt-4">
                      <button 
                        className="btn btn-primary flex items-center gap-2"
                        onClick={handleAddBook}
                      >
                        <FaSave /> Save Book
                      </button>
                      <button 
                        className="btn btn-secondary flex items-center gap-2"
                        onClick={() => setShowAddForm(false)}
                      >
                        <FaTimes /> Cancel
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* Edit Book Form */}
                {showEditForm && currentBook && (
                  <motion.div 
                    className="edit-book-form card p-6 mb-6"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                  >
                    <h4 className="text-xl font-semibold mb-4">Edit Book</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <input
                        type="text"
                        placeholder="Title"
                        value={currentBook.title}
                        onChange={(e) => setCurrentBook({...currentBook, title: e.target.value})}
                        className="form-input"
                      />
                      <input
                        type="text"
                        placeholder="Author"
                        value={currentBook.author}
                        onChange={(e) => setCurrentBook({...currentBook, author: e.target.value})}
                        className="form-input"
                      />
                      <input
                        type="number"
                        placeholder="Price"
                        value={currentBook.price}
                        onChange={(e) => setCurrentBook({...currentBook, price: e.target.value})}
                        className="form-input"
                      />
                      <input
                        type="text"
                        placeholder="Category"
                        value={currentBook.category}
                        onChange={(e) => setCurrentBook({...currentBook, category: e.target.value})}
                        className="form-input"
                      />
                      <input
                        type="number"
                        placeholder="Stock"
                        value={currentBook.stock}
                        onChange={(e) => setCurrentBook({...currentBook, stock: e.target.value})}
                        className="form-input"
                      />
                      <div className="image-upload-container">
                        <div className="image-url-input mb-3">
                          <input
                            type="text"
                            placeholder="Enter image URL"
                            value={currentBook.imageUrl || ''}
                            onChange={(e) => setCurrentBook({...currentBook, imageUrl: e.target.value})}
                            className="form-input w-full"
                          />
                        </div>
                        {currentBook.imageUrl && (
                          <div className="image-preview-wrapper">
                            <img src={currentBook.imageUrl} alt="Preview" className="image-preview" onError={(e) => e.target.src='https://via.placeholder.com/200x250.png?text=Invalid+Image'} />
                          </div>
                        )}
                      </div>
                    </div>
                    <textarea
                      placeholder="Description"
                      value={currentBook.description}
                      onChange={(e) => setCurrentBook({...currentBook, description: e.target.value})}
                      className="form-textarea mt-4 w-full p-3 border border-gray-300 rounded-lg"
                      rows="3"
                    />
                    <div className="flex gap-2 mt-4">
                      <button 
                        className="btn btn-primary flex items-center gap-2"
                        onClick={handleUpdateBook}
                      >
                        <FaSave /> Update Book
                      </button>
                      <button 
                        className="btn btn-secondary flex items-center gap-2"
                        onClick={() => {
                          setShowEditForm(false);
                          setCurrentBook(null);
                        }}
                      >
                        <FaTimes /> Cancel
                      </button>
                    </div>
                  </motion.div>
                )}

                <div className="table-responsive">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Cover</th>
                        <th>Title</th>
                        <th>Author</th>
                        <th>Category</th>
                        <th>Price</th>
                        <th>Stock</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {loading ? (
                        <tr>
                          <td colSpan="8" className="text-center py-4">Loading books...</td>
                        </tr>
                      ) : filteredBooks.length > 0 ? (
                        filteredBooks.map(book => (
                          <motion.tr 
                            key={book.bookId || book.id}
                            whileHover={{ backgroundColor: '#f8f9fa' }}
                          >
                            <td>{book.bookId || book.id}</td>
                            <td>
                              <img 
                                src={book.imageUrl || book.image_url || "https://via.placeholder.com/50x75.png?text=No+Image"} 
                                alt={book.title} 
                                className="w-10 h-12 object-cover rounded"
                              />
                            </td>
                            <td>{book.title}</td>
                            <td>{book.author}</td>
                            <td>{book.category}</td>
                            <td>${book.price}</td>
                            <td>{book.stock}</td>
                            <td>
                              <div className="action-buttons flex gap-2">
                                <button 
                                  className="btn btn-secondary btn-sm flex items-center gap-1"
                                  onClick={() => {
                                    setCurrentBook(book);
                                    setShowEditForm(true);
                                  }}
                                >
                                  <FaEdit /> Edit
                                </button>
                                <button 
                                  className="btn btn-danger btn-sm flex items-center gap-1"
                                  onClick={() => handleDeleteBook(book.bookId || book.id)}
                                >
                                  <FaTrash /> Delete
                                </button>
                              </div>
                            </td>
                          </motion.tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="8" className="text-center py-4">No books found</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}
            
            {activeTab === 'users' && (
              <motion.div 
                className="manage-users"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                <h3 className="text-2xl font-bold mb-6">Manage Users</h3>
                <div className="table-responsive">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Role</th>
                        <th>Created At</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {loading ? (
                        <tr>
                          <td colSpan="6" className="text-center py-4">Loading users...</td>
                        </tr>
                      ) : users.length > 0 ? (
                        users.map(user => (
                          <motion.tr 
                            key={user.userId || user.id}
                            whileHover={{ backgroundColor: '#f8f9fa' }}
                          >
                            <td>{user.userId || user.id}</td>
                            <td>{user.name}</td>
                            <td>{user.email}</td>
                            <td><span className={`role-badge ${user.role || user.userRole || 'USER'}`}>{user.role || user.userRole || 'USER'}</span></td>
                            <td>{user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}</td>
                            <td>
                              <div className="action-buttons flex gap-2">
                                <button className="btn btn-secondary btn-sm flex items-center gap-1">
                                  <FaEdit /> Edit
                                </button>
                                <button className="btn btn-danger btn-sm flex items-center gap-1">
                                  <FaTrash /> Delete
                                </button>
                              </div>
                            </td>
                          </motion.tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="6" className="text-center py-4">No users found</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}
            
            {activeTab === 'orders' && (
              <motion.div 
                className="manage-orders"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                <h3 className="text-2xl font-bold mb-6">Manage Orders</h3>
                <div className="table-responsive">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>User</th>
                        <th>Items</th>
                        <th>Total Amount</th>
                        <th>Status</th>
                        <th>Date</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {loading ? (
                        <tr>
                          <td colSpan="7" className="text-center py-4">Loading orders...</td>
                        </tr>
                      ) : orders.length > 0 ? (
                        orders.map(order => (
                          <motion.tr 
                            key={order.orderId || order.id}
                            whileHover={{ backgroundColor: '#f8f9fa' }}
                            className="border-b border-gray-200 hover:bg-gray-50"
                          >
                            <td className="font-semibold text-blue-600">#{order.orderId || order.id}</td>
                            <td>
                              <div className="flex items-center gap-2">
                                <div className="bg-gray-200 rounded-full w-8 h-8 flex items-center justify-center text-xs font-bold">
                                  {order.userId ? order.userId.toString().charAt(0).toUpperCase() : 'U'}
                                </div>
                                <span>User {order.userId || 'N/A'}</span>
                              </div>
                            </td>
                            <td>
                              {order.orderItems && order.orderItems.length > 0 ? (
                                <div className="flex -space-x-2">
                                  {order.orderItems.slice(0, 3).map((item, idx) => (
                                    <div key={`${order.orderId || order.id}-${idx}`} className="w-8 h-8 rounded-full bg-blue-100 border-2 border-white flex items-center justify-center text-xs font-medium text-blue-800">
                                      {item.quantity || 1}
                                    </div>
                                  ))}
                                  {order.orderItems.length > 3 && (
                                    <div className="w-8 h-8 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center text-xs font-medium text-gray-800">
                                      +{order.orderItems.length - 3}
                                    </div>
                                  )}
                                </div>
                              ) : (
                                <span>{order.items && order.items.length ? order.items.length : 0} items</span>
                              )}
                            </td>
                            <td className="font-bold text-lg text-green-600">${order.total_amount || order.totalAmount || 0}</td>
                            <td>
                              <select 
                                value={order.order_status || order.status || 'PENDING'} 
                                onChange={(e) => updateOrderStatus(order.orderId || order.id, e.target.value)}
                                className={`status-select ${order.order_status || order.status || 'PENDING'}`}
                              >
                                <option value="PENDING">Pending</option>
                                <option value="CONFIRMED">Confirmed</option>
                                <option value="SHIPPED">Shipped</option>
                                <option value="DELIVERED">Delivered</option>
                                <option value="CANCELLED">Cancelled</option>
                              </select>
                            </td>
                            <td>{order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'N/A'}</td>
                            <td>
                              <div className="action-buttons flex flex-col gap-2">
                                <button 
                                  className="btn btn-secondary btn-sm flex items-center gap-1"
                                  onClick={() => openOrderDetails(order)}
                                >
                                  <FaEye /> View
                                </button>
                                <button 
                                  className="btn btn-success btn-sm flex items-center gap-1"
                                  onClick={() => updateOrderStatus(order.orderId || order.id, order.order_status || order.status || 'PENDING')}
                                >
                                  <FaEdit /> Update
                                </button>
                              </div>
                            </td>
                          </motion.tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="7" className="text-center py-4">No orders found</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>
        
        {/* Order Details Modal */}
        {showOrderModal && selectedOrder && (
          <div className="modal-overlay fixed inset-0 bg-gradient-to-br from-blue-900/70 to-purple-900/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div 
              className="modal-content bg-gradient-to-br from-white to-gray-50 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-200"
              initial={{ scale: 0.8, opacity: 0, rotateY: 15 }}
              animate={{ scale: 1, opacity: 1, rotateY: 0 }}
              exit={{ scale: 0.8, opacity: 0, rotateY: -15 }}
              transition={{ type: "spring", damping: 20, stiffness: 300 }}
            >
              <div className="modal-header p-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-2xl">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white/20 rounded-lg">
                      <FaShoppingCart className="text-xl" />
                    </div>
                    <h3 className="text-xl font-bold">Order Details</h3>
                  </div>
                  <button 
                    className="text-white/80 hover:text-white hover:bg-white/20 w-10 h-10 rounded-full flex items-center justify-center transition-all"
                    onClick={closeOrderDetails}
                  >
                    <span className="text-xl">&times;</span>
                  </button>
                </div>
              </div>
              <div className="modal-body p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-100">
                    <h4 className="font-semibold text-gray-700 mb-1">Order ID</h4>
                    <p className="text-2xl font-bold text-blue-600">#{selectedOrder.orderId || selectedOrder.id}</p>
                  </div>
                  <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-4 rounded-xl border border-purple-100">
                    <h4 className="font-semibold text-gray-700 mb-1">Status</h4>
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${selectedOrder.order_status || selectedOrder.status === 'DELIVERED' ? 'bg-green-500' : selectedOrder.order_status || selectedOrder.status === 'SHIPPED' ? 'bg-blue-500' : selectedOrder.order_status || selectedOrder.status === 'CONFIRMED' ? 'bg-yellow-500' : selectedOrder.order_status || selectedOrder.status === 'CANCELLED' ? 'bg-red-500' : 'bg-gray-500'}`}></div>
                      <p className={`text-lg font-bold ${selectedOrder.order_status || selectedOrder.status === 'DELIVERED' ? 'text-green-600' : selectedOrder.order_status || selectedOrder.status === 'SHIPPED' ? 'text-blue-600' : selectedOrder.order_status || selectedOrder.status === 'CONFIRMED' ? 'text-yellow-600' : selectedOrder.order_status || selectedOrder.status === 'CANCELLED' ? 'text-red-600' : 'text-gray-600'}`}>
                        {selectedOrder.order_status || selectedOrder.status || 'PENDING'}
                      </p>
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-xl border border-green-100">
                    <h4 className="font-semibold text-gray-700 mb-1">Total Amount</h4>
                    <p className="text-2xl font-bold text-green-600">${selectedOrder.total_amount || selectedOrder.totalAmount || 0}</p>
                  </div>
                  <div className="bg-gradient-to-br from-amber-50 to-orange-50 p-4 rounded-xl border border-amber-100">
                    <h4 className="font-semibold text-gray-700 mb-1">Date</h4>
                    <p className="text-lg font-medium text-amber-600">{selectedOrder.createdAt ? new Date(selectedOrder.createdAt).toLocaleDateString() : 'N/A'}</p>
                  </div>
                </div>
                
                <div className="mb-6 bg-gray-50 p-5 rounded-xl border border-gray-200">
                  <div className="flex items-center gap-2 mb-4">
                    <FaBook className="text-blue-600" />
                    <h4 className="font-bold text-lg text-gray-800">Order Items</h4>
                  </div>
                  <div className="space-y-3">
                    {(selectedOrder.orderItems || selectedOrder.items || []).map((item, index) => (
                      <div key={index} className="flex justify-between items-center p-4 bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                        <div>
                          <p className="font-bold text-gray-800">{item.book?.title || item.title || 'Unknown Product'}</p>
                          <div className="flex items-center gap-4 mt-1">
                            <p className="text-sm text-gray-600 flex items-center gap-1">
                              <span className="font-medium">Qty:</span> {item.quantity || item.qty || 1}
                            </p>
                            <p className="text-sm text-gray-600 flex items-center gap-1">
                              <span className="font-medium">Price:</span> ${(item.price || item.unitPrice || 0).toFixed(2)}
                            </p>
                          </div>
                        </div>
                        <p className="font-bold text-lg text-blue-600">
                          ${(item.price || item.unitPrice || 0) * (item.quantity || item.qty || 1)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="bg-gradient-to-br from-indigo-50 to-blue-50 p-5 rounded-xl border border-indigo-200">
                  <div className="flex items-center gap-2 mb-4">
                    <FaUser className="text-indigo-600" />
                    <h4 className="font-bold text-lg text-gray-800">Customer Information</h4>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white p-3 rounded-lg border border-gray-200">
                      <p className="text-sm text-gray-600 font-medium">Name</p>
                      <p className="font-medium">{selectedOrder.user?.name || selectedOrder.userName || 'N/A'}</p>
                    </div>
                    <div className="bg-white p-3 rounded-lg border border-gray-200">
                      <p className="text-sm text-gray-600 font-medium">Email</p>
                      <p className="font-medium truncate">{selectedOrder.user?.email || selectedOrder.userEmail || 'N/A'}</p>
                    </div>
                    <div className="bg-white p-3 rounded-lg border border-gray-200">
                      <p className="text-sm text-gray-600 font-medium">Phone</p>
                      <p className="font-medium">{selectedOrder.phoneNumber || selectedOrder.phone || 'N/A'}</p>
                    </div>
                    <div className="bg-white p-3 rounded-lg border border-gray-200">
                      <p className="text-sm text-gray-600 font-medium">Address</p>
                      <p className="font-medium">{selectedOrder.shippingAddress || selectedOrder.address || 'N/A'}</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="modal-footer p-6 bg-gray-50 rounded-b-2xl flex flex-col sm:flex-row justify-between gap-3">
                <button 
                  className="btn btn-secondary px-6 py-3 rounded-xl font-medium flex items-center justify-center gap-2 hover:shadow-md transition-all"
                  onClick={closeOrderDetails}
                >
                  <FaTimes /> Close
                </button>
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-700">Update Status:</span>
                  <select 
                    value={selectedOrder.order_status || selectedOrder.status || 'PENDING'} 
                    onChange={(e) => updateOrderStatus(selectedOrder.orderId || selectedOrder.id, e.target.value)}
                    className="status-select px-4 py-3 rounded-xl border-2 border-blue-200 bg-white text-gray-800 font-medium focus:border-blue-500 focus:ring-2 focus:ring-blue-200 min-w-[180px]"
                  >
                    <option value="PENDING">Pending</option>
                    <option value="CONFIRMED">Confirmed</option>
                    <option value="SHIPPED">Shipped</option>
                    <option value="DELIVERED">Delivered</option>
                    <option value="CANCELLED">Cancelled</option>
                  </select>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;

const styles = `
.admin-dashboard {
  min-height: 70vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #e4edf5 100%);
  padding: 2rem 0;
}

.page-title {
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

.stats-grid {
  gap: 2rem;
  margin-bottom: 2rem;
}

.stat-card {
  transition: all 0.3s ease;
  border-radius: 15px;
  overflow: hidden;
  background: white;
  box-shadow: 0 10px 30px rgba(0,0,0,0.1);
}

.stat-icon {
  color: #667eea;
  margin-bottom: 1rem;
}

.stat-number {
  font-size: 2rem;
  font-weight: 700;
  color: #333;
  margin: 0 0 0.5rem;
}

.stat-label {
  font-size: 1rem;
  color: #666;
  margin: 0;
}

.admin-tabs {
  padding: 0;
  border-radius: 15px;
  overflow: hidden;
  background: white;
  box-shadow: 0 10px 30px rgba(0,0,0,0.1);
}

.tab-nav {
  display: flex;
  border-bottom: 1px solid #eee;
  overflow-x: auto;
  background: #f8f9fa;
}

.tab-btn {
  padding: 1.2rem 2rem;
  border: none;
  background: transparent;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 600;
  color: #666;
  transition: all 0.3s ease;
  white-space: nowrap;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.tab-btn.active {
  color: #667eea;
  background: white;
  border-bottom: 3px solid #667eea;
  position: relative;
}

.tab-btn:hover:not(.active) {
  color: #667eea;
  background: #eef2f7;
}

.tab-content {
  padding: 2rem;
}

.admin-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 1rem;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 5px 15px rgba(0,0,0,0.05);
}

.admin-table th,
.admin-table td {
  padding: 1rem;
  text-align: left;
  border-bottom: 1px solid #eee;
}

.admin-table th {
  background: #f8f9fa;
  font-weight: 600;
  color: #333;
  text-transform: uppercase;
  font-size: 0.8rem;
  letter-spacing: 0.5px;
}

.admin-table tbody tr:last-child td {
  border-bottom: none;
}

.table-responsive {
  overflow-x: auto;
}

.btn-sm {
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
  border-radius: 5px;
}

.btn-danger {
  background: linear-gradient(45deg, #ff416c, #ff4b2b);
  color: white;
}

.btn-danger:hover {
  background: linear-gradient(45deg, #e43a5f, #e04427);
  transform: translateY(-2px);
}

.btn-secondary {
  background: linear-gradient(45deg, #667eea, #764ba2);
  color: white;
}

.btn-secondary:hover {
  background: linear-gradient(45deg, #5a6fd8, #6a4190);
  transform: translateY(-2px);
}

.btn-success {
  background: linear-gradient(45deg, #00b09b, #96c93d);
  color: white;
}

.btn-success:hover {
  background: linear-gradient(45deg, #009e8a, #85b83a);
  transform: translateY(-2px);
}

.action-buttons {
  display: flex;
  gap: 0.5rem;
}

.role-badge, .status-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 500;
}

.role-badge.USER, .status-badge.PENDING {
  background: #e3f2fd;
  color: #1976d2;
}

.role-badge.ADMIN, .status-badge.DELIVERED {
  background: #e8f5e9;
  color: #388e3c;
}

.status-badge.SHIPPED {
  background: #fff3e0;
  color: #f57c00;
}

.status-badge.PROCESSING {
  background: #f3e5f5;
  color: #7b1fa2;
}

.dashboard-stats {
  margin-top: 2rem;
}

.dashboard-stat {
  border-radius: 15px;
  transition: transform 0.3s ease;
}

.dashboard-stat:hover {
  transform: translateY(-5px);
}

.search-box {
  position: relative;
  min-width: 250px;
}

.search-input {
  width: 100%;
  padding: 0.75rem 1rem 0.75rem 2.5rem;
  border: 2px solid #ddd;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.3s ease;
}

.search-input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.add-book-form, .edit-book-form {
  background: #f8f9fa;
  border-radius: 10px;
  margin-bottom: 1.5rem;
  animation: fadeIn 0.3s ease;
}

.form-input, .form-textarea {
  width: 100%;
  padding: 0.75rem;
  border: 2px solid #ddd;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.3s ease;
}

.form-input:focus, .form-textarea:focus {
  outline: none;
  border-color: #667eea;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@media (max-width: 768px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .tab-nav {
    flex-direction: column;
  }
  
  .tab-btn {
    border-bottom: 1px solid #eee;
  }
  
  .tab-btn.active {
    border-bottom: 3px solid #667eea;
  }
  
  .admin-table {
    font-size: 0.8rem;
  }
  
  .admin-table th,
  .admin-table td {
    padding: 0.75rem 0.5rem;
  }
  
  .action-buttons {
    flex-direction: column;
  }
  
  .search-box {
    min-width: 100%;
    margin-bottom: 1rem;
  }
}

/* Image URL Input Styles */
.image-upload-container {
  margin: 1rem 0;
}

.image-url-input {
  margin-bottom: 1rem;
}

.image-url-input input {
  width: 100%;
  padding: 0.75rem;
  border: 2px solid #ddd;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.3s ease;
}

.image-url-input input:focus {
  outline: none;
  border-color: #667eea;
}

.image-preview-wrapper {
  position: relative;
  display: inline-block;
  margin-bottom: 1rem;
}

.image-preview {
  max-width: 200px;
  max-height: 200px;
  object-fit: cover;
  border-radius: 8px;
  border: 2px solid #ddd;
}

.modal-overlay {
  z-index: 1000;
}

.modal-content {
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.25);
  max-height: 90vh;
  overflow-y: auto;
}

.status-select {
  padding: 0.5rem;
  border-radius: 0.375rem;
  border: 1px solid #d1d5db;
  background-color: white;
  color: #374151;
  font-size: 0.875rem;
}

.status-select:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.status-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 500;
}

.status-badge.PENDING {
  background: #fef3c7;
  color: #d97706;
}

.status-badge.CONFIRMED {
  background: #fef3c7;
  color: #d97706;
}

.status-badge.SHIPPED {
  background: #dbeafe;
  color: #2563eb;
}

.status-badge.DELIVERED {
  background: #d1fae5;
  color: #059669;
}

.status-badge.CANCELLED {
  background: #fee2e2;
  color: #dc2626;
}

/* Modern Dashboard Styles */
.admin-dashboard {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #e4edf5 100%);
}

.sidebar {
  background: linear-gradient(180deg, #1e40af 0%, #7e22ce 100%);
  backdrop-filter: blur(10px);
}

.stat-card {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border-radius: 16px;
  overflow: hidden;
}

.stat-card:hover {
  transform: translateY(-8px) scale(1.02);
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.15);
}

.btn-primary {
  background: linear-gradient(45deg, #3b82f6, #8b5cf6);
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 12px;
  font-weight: 600;
  transition: all 0.3s ease;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 25px rgba(59, 130, 246, 0.3);
}

.table-container {
  background: white;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.05);
}

.table th {
  background: linear-gradient(to bottom, #f8fafc, #e2e8f0);
  color: #475569;
  font-weight: 600;
  padding: 16px;
  text-transform: uppercase;
  font-size: 0.875rem;
  letter-spacing: 0.5px;
}

.table td {
  padding: 16px;
  border-bottom: 1px solid #e2e8f0;
}

.table tr:nth-child(even) {
  background-color: #f8fafc;
}

.table tr:hover {
  background-color: #f1f5f9;
  transform: scale(1.01);
  transition: all 0.2s ease;
}

.card {
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
}

.card:hover {
  transform: translateY(-5px);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
}

.form-input {
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  padding: 12px 16px;
  font-size: 1rem;
  transition: all 0.3s ease;
}

.form-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.action-button {
  border-radius: 12px;
  padding: 8px 16px;
  font-weight: 500;
  transition: all 0.3s ease;
}

.action-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.status-badge {
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: 500;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.status-badge.pending {
  background: #fef3c7;
  color: #d97706;
}

.status-badge.confirmed {
  background: #dbeafe;
  color: #2563eb;
}

.status-badge.delivered {
  background: #d1fae5;
  color: #059669;
}

.status-badge.cancelled {
  background: #fee2e2;
  color: #dc2626;
}

/* Dashboard Welcome Section */
.welcome-section {
  margin-bottom: 2rem;
}

.welcome-card {
  transition: all 0.3s ease;
}

.welcome-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2) !important;
}

.dashboard-stats-grid {
  margin-top: 1.5rem;
}

.stat-card {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border-radius: 16px;
  overflow: hidden;
  position: relative;
}

.stat-card:hover {
  transform: translateY(-8px) scale(1.02);
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.15);
}

.activity-item {
  transition: all 0.3s ease;
}

.activity-item:hover {
  transform: translateX(5px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1) !important;
}

.selling-item {
  transition: all 0.3s ease;
}

.selling-item:hover {
  transform: translateX(5px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1) !important;
}

.metric-item {
  transition: all 0.3s ease;
}

.metric-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1) !important;
}
`;

// Add styles to the document
const styleSheet = document.createElement("style");
styleSheet.type = "text/css";
styleSheet.innerText = styles;
document.head.appendChild(styleSheet);


