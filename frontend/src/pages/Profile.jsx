import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaUser, FaEnvelope, FaPhone, FaEdit, FaSave, FaTimes, FaSpinner } from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobile: '',
    createdAt: null
  });

  // Fetch detailed user information from backend
  useEffect(() => {
    console.log('Profile useEffect triggered, user:', user);
    
    const fetchUserDetails = async () => {
      if (user?.userId) {
        console.log('Fetching user details for userId:', user.userId);
        setIsLoading(true);
        try {
          const response = await api.get(`/users/${user.userId}`);
          console.log('User details response:', response.data);
          const userData = response.data;
          
          setFormData({
            name: userData.name || user.name || user.username || 'User',
            email: userData.email || user.email || '',
            mobile: userData.mobile || userData.phoneNumber || user.mobile || '',
            createdAt: userData.createdAt || user.createdAt
          });
        } catch (error) {
          console.error('Error fetching user details:', error);
          console.error('Error response:', error.response);
          // Fallback to existing user data
          setFormData({
            name: user.name || user.username || 'User',
            email: user.email || '',
            mobile: user.mobile || user.phoneNumber || '',
            createdAt: user.createdAt
          });
        } finally {
          setIsLoading(false);
        }
      } else {
        console.log('No userId found in user object:', user);
        // Initialize with available user data
        setFormData({
          name: user?.name || user?.username || 'User',
          email: user?.email || '',
          mobile: user?.mobile || user?.phoneNumber || '',
          createdAt: user?.createdAt
        });
      }
    };

    fetchUserDetails();
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // Update user information in backend
      const updateData = {
        name: formData.name,
        email: formData.email
        // Only send fields that can be updated
        // Don't send createdAt, userId, password, or role
      };
      
      console.log('Sending update request with data:', updateData);
      console.log('Updating user ID:', user.userId);
      
      const response = await api.put(`/users/${user.userId}`, updateData);
      console.log('Update response:', response);
      
      // Update user information in context
      updateUser({
        ...user,
        name: formData.name,
        email: formData.email
      });
      
      setIsEditing(false);
      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating user profile:', error);
      console.error('Error response:', error.response);
      
      let errorMessage = 'Failed to update profile. Please try again.';
      
      if (error.response) {
        // Server responded with error status
        if (error.response.status === 400) {
          errorMessage = 'Invalid data provided. Please check your inputs.';
        } else if (error.response.status === 404) {
          errorMessage = 'User not found. Please refresh and try again.';
        } else if (error.response.status === 409) {
          errorMessage = 'Email already exists. Please use a different email.';
        } else if (error.response.data?.message) {
          errorMessage = error.response.data.message;
        }
      } else if (error.request) {
        errorMessage = 'Network error. Please check your connection.';
      }
      
      alert(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    // Reset form to original values
    setFormData({
      name: user?.name || user?.username || 'User',
      email: user?.email || '',
      mobile: user?.mobile || user?.phoneNumber || '',
      createdAt: user?.createdAt
    });
    setIsEditing(false);
  };

  if (isLoading && !formData.name) {
    return (
      <div className="profile-page py-8 flex justify-center items-center">
        <div className="text-center">
          <FaSpinner className="animate-spin text-4xl text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading profile information...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-page py-8">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-4xl mx-auto"
        >
          <div className="profile-header mb-8 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="profile-avatar mx-auto mb-4 w-24 h-24 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white text-3xl"
            >
              <FaUser />
            </motion.div>
            <h1 className="text-3xl font-bold text-gray-800">Profile Settings</h1>
            <p className="text-gray-600 mt-2">Manage your personal information</p>
          </div>

          <div className="profile-card bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="p-6 md:p-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-semibold text-gray-800">Personal Information</h2>
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  disabled={isLoading}
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors duration-200 disabled:opacity-50"
                >
                  {isEditing ? (
                    <>
                      <FaTimes className="text-sm" /> Cancel
                    </>
                  ) : (
                    <>
                      <FaEdit className="text-sm" /> Edit Profile
                    </>
                  )}
                </button>
              </div>

              {isEditing ? (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Full Name
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <FaUser className="text-gray-400" />
                        </div>
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                          placeholder="Enter your full name"
                          required
                          disabled={isLoading}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <FaEnvelope className="text-gray-400" />
                        </div>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                          placeholder="Enter your email"
                          required
                          disabled={isLoading}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Mobile Number
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <FaPhone className="text-gray-400" />
                        </div>
                        <input
                          type="tel"
                          name="mobile"
                          value={formData.mobile}
                          onChange={handleInputChange}
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                          placeholder="Enter your mobile number"
                          disabled={isLoading}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-4 pt-4">
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg transition-colors duration-200 disabled:opacity-50"
                    >
                      {isLoading ? (
                        <>
                          <FaSpinner className="animate-spin text-sm" /> Saving...
                        </>
                      ) : (
                        <>
                          <FaSave className="text-sm" /> Save Changes
                        </>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={handleCancel}
                      disabled={isLoading}
                      className="flex items-center gap-2 bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-lg transition-colors duration-200 disabled:opacity-50"
                    >
                      <FaTimes className="text-sm" /> Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <FaUser className="text-blue-600" />
                        </div>
                        <h3 className="font-medium text-gray-700">Full Name</h3>
                      </div>
                      <p className="text-gray-900 ml-11 text-lg">{formData.name || 'Not provided'}</p>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                          <FaEnvelope className="text-red-600" />
                        </div>
                        <h3 className="font-medium text-gray-700">Email Address</h3>
                      </div>
                      <p className="text-gray-900 ml-11 text-lg">{formData.email || 'Not provided'}</p>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-4 md:col-span-2">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                          <FaPhone className="text-green-600" />
                        </div>
                        <h3 className="font-medium text-gray-700">Mobile Number</h3>
                      </div>
                      <p className="text-gray-900 ml-11 text-lg">
                        {formData.mobile ? formData.mobile : 'Not provided'}
                        {!formData.mobile && (
                          <span className="text-gray-500 text-sm ml-2">(Optional field not set)</span>
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
                    <h3 className="font-medium text-blue-800 mb-2">Account Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-700">
                      <div>
                        <span className="font-medium">Member Since:</span> {formData.createdAt ? new Date(formData.createdAt).toLocaleDateString() : 'Unknown'}
                      </div>
                      <div>
                        <span className="font-medium">Account Status:</span> Active
                      </div>
                      <div>
                        <span className="font-medium">User Role:</span> {user?.role || 'USER'}
                      </div>
                      <div>
                        <span className="font-medium">User ID:</span> {user?.userId || 'N/A'}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Security Section */}
          <div className="profile-card bg-white rounded-xl shadow-lg overflow-hidden mt-8">
            <div className="p-6 md:p-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-6">Security</h2>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h3 className="font-medium text-gray-800">Change Password</h3>
                    <p className="text-gray-600 text-sm">Update your account password</p>
                  </div>
                  <button className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg transition-colors duration-200">
                    Change
                  </button>
                </div>
                <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h3 className="font-medium text-gray-800">Two-Factor Authentication</h3>
                    <p className="text-gray-600 text-sm">Add an extra layer of security</p>
                  </div>
                  <button className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg transition-colors duration-200">
                    Configure
                  </button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      <style jsx>{`
        .profile-page {
          min-height: calc(100vh - 200px);
          background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
        }
        
        .profile-card {
          border: 1px solid #e5e7eb;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        
        .profile-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
        }
        
        .py-8 { padding-top: 2rem; padding-bottom: 2rem; }
        .px-4 { padding-left: 1rem; padding-right: 1rem; }
        .mx-auto { margin-left: auto; margin-right: auto; }
        .mb-8 { margin-bottom: 2rem; }
        .mb-6 { margin-bottom: 1.5rem; }
        .mb-4 { margin-bottom: 1rem; }
        .mb-2 { margin-bottom: 0.5rem; }
        .ml-11 { margin-left: 2.75rem; }
        .mt-8 { margin-top: 2rem; }
        .mt-6 { margin-top: 1.5rem; }
        .mt-2 { margin-top: 0.5rem; }
        .pt-4 { padding-top: 1rem; }
        .gap-6 { gap: 1.5rem; }
        .gap-4 { gap: 1rem; }
        .gap-3 { gap: 0.75rem; }
        .gap-2 { gap: 0.5rem; }
        .text-3xl { font-size: 1.875rem; }
        .text-2xl { font-size: 1.5rem; }
        .text-xl { font-size: 1.25rem; }
        .text-lg { font-size: 1.125rem; }
        .text-sm { font-size: 0.875rem; }
        .grid { display: grid; }
        .grid-cols-1 { grid-template-columns: repeat(1, minmax(0, 1fr)); }
        .col-span-2 { grid-column: span 2 / span 2; }
        .items-center { align-items: center; }
        .justify-center { justify-content: center; }
        .justify-between { justify-content: space-between; }
        .w-full { width: 100%; }
        .w-24 { width: 6rem; }
        .h-24 { height: 6rem; }
        .rounded-full { border-radius: 9999px; }
        .rounded-xl { border-radius: 0.75rem; }
        .rounded-lg { border-radius: 0.5rem; }
        .border { border-width: 1px; }
        .shadow-lg { box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05); }
        .overflow-hidden { overflow: hidden; }
        .bg-white { background-color: #fff; }
        .bg-gradient-to-r { background-image: linear-gradient(to right, var(--tw-gradient-stops)); }
        .from-blue-500 { --tw-gradient-from: #3b82f6; }
        .to-purple-600 { --tw-gradient-to: #9333ea; }
        .text-white { color: #fff; }
        .text-gray-800 { color: #1f2937; }
        .text-gray-600 { color: #4b5563; }
        .text-gray-700 { color: #374151; }
        .text-gray-900 { color: #111827; }
        .text-blue-600 { color: #2563eb; }
        .text-red-600 { color: #dc2626; }
        .text-green-600 { color: #16a34a; }
        .text-blue-800 { color: #1e40af; }
        .text-blue-700 { color: #1d4ed8; }
        .bg-gray-50 { background-color: #f9fafb; }
        .bg-blue-50 { background-color: #eff6ff; }
        .border-blue-200 { border-color: #bfdbfe; }
        .transition-colors { transition-property: background-color, border-color, color, fill, stroke; }
        .duration-200 { transition-duration: 200ms; }
        .hover\\:bg-blue-700:hover { background-color: #1d4ed8; }
        .hover\\:bg-green-700:hover { background-color: #15803d; }
        .focus\\:ring-2:focus { --tw-ring-offset-shadow: var(--tw-ring-inset) 0 0 0 var(--tw-ring-offset-width) var(--tw-ring-offset-color); --tw-ring-shadow: var(--tw-ring-inset) 0 0 0 calc(2px + var(--tw-ring-offset-width)) var(--tw-ring-color); box-shadow: var(--tw-ring-offset-shadow), var(--tw-ring-shadow), var(--tw-shadow, 0 0 #0000); }
        .focus\\:ring-blue-500:focus { --tw-ring-color: #3b82f6; }
        .focus\\:border-transparent:focus { border-color: transparent; }
        .transition-all { transition-property: all; }
        .pointer-events-none { pointer-events: none; }
        .inset-y-0 { top: 0px; bottom: 0px; }
        .left-0 { left: 0px; }
        .pl-3 { padding-left: 0.75rem; }
        .pl-10 { padding-left: 2.5rem; }
        .pr-4 { padding-right: 1rem; }
        .py-3 { padding-top: 0.75rem; padding-bottom: 0.75rem; }
        
        @media (min-width: 768px) {
          .md\\:p-8 { padding: 2rem; }
          .md\\:grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
          .md\\:col-span-2 { grid-column: span 2 / span 2; }
        }
      `}</style>
    </div>
  );
};

export default Profile;