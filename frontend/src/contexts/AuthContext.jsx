import React, { createContext, useContext, useReducer, useEffect } from 'react';

const AuthContext = createContext();

const authReducer = (state, action) => {
  switch (action.type) {
    case 'LOGIN_START':
      return {
        ...state,
        isLoading: true,
        error: null
      };
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        isLoggedIn: true,
        user: action.payload.user,
        token: action.payload.token,
        isLoading: false,
        error: null
      };
    case 'LOGIN_FAILURE':
      return {
        ...state,
        isLoggedIn: false,
        user: null,
        token: null,
        isLoading: false,
        error: action.payload
      };
    case 'LOGOUT':
      return {
        ...state,
        isLoggedIn: false,
        user: null,
        token: null,
        isLoading: false,
        error: null
      };
    case 'SET_USER':
      return {
        ...state,
        user: action.payload,
        isLoggedIn: !!action.payload
      };
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload
      };
    default:
      return state;
  }
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, {
    isLoggedIn: false,
    user: null,
    token: localStorage.getItem('token'),
    isLoading: false,
    error: null
  });

  // Check if user is logged in on initial load
  useEffect(() => {
    console.log('AuthContext useEffect triggered');
    // Check for new format first
    let token = localStorage.getItem('token');
    let userData = localStorage.getItem('userData');
    
    console.log('Token from localStorage:', token);
    console.log('UserData from localStorage:', userData);
    
    // If no user data found in new format, check for old format
    if (!token || !userData) {
      const oldToken = localStorage.getItem('token');
      const role = localStorage.getItem('role');
      
      console.log('Checking old format - token:', oldToken, 'role:', role);
      
      if (oldToken && role) {
        // Create user object from old format
        const userFromOldFormat = {
          role: role,
          // You can add more user properties here if available
        };
        
        console.log('Creating user from old format:', userFromOldFormat);
        // Store in new format
        localStorage.setItem('userData', JSON.stringify(userFromOldFormat));
        
        dispatch({
          type: 'LOGIN_SUCCESS',
          payload: {
            user: userFromOldFormat,
            token: oldToken
          }
        });
      }
    } else {
      // Use new format
      try {
        const parsedUserData = JSON.parse(userData);
        console.log('Using parsed user data:', parsedUserData);
        dispatch({
          type: 'LOGIN_SUCCESS',
          payload: {
            user: parsedUserData,
            token: token
          }
        });
      } catch (error) {
        console.error('Error parsing user data from localStorage:', error);
        // Clear invalid data
        localStorage.removeItem('token');
        localStorage.removeItem('userData');
      }
    }
  }, []);

  const login = async (userData, token) => {
    dispatch({ type: 'LOGIN_START' });
    
    try {
      // Save to localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('userData', JSON.stringify(userData));
      
      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: {
          user: userData,
          token: token
        }
      });
      
      return { success: true };
    } catch (error) {
      dispatch({
        type: 'LOGIN_FAILURE',
        payload: error.message
      });
      return { success: false, error: error.message };
    }
  };

  const logout = () => {
    // Clear from localStorage (both old and new formats)
    localStorage.removeItem('token');
    localStorage.removeItem('userData');
    localStorage.removeItem('role');
    
    dispatch({ type: 'LOGOUT' });
  };

  const updateUser = (userData) => {
    try {
      localStorage.setItem('userData', JSON.stringify(userData));
      dispatch({
        type: 'SET_USER',
        payload: userData
      });
    } catch (error) {
      console.error('Error updating user data:', error);
    }
  };

  return (
    <AuthContext.Provider value={{
      ...state,
      login,
      logout,
      updateUser
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};