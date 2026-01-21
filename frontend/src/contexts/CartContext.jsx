import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { useAuth } from './AuthContext';
import api from '../services/api';

const CartContext = createContext();

const cartReducer = (state, action) => {
  switch (action.type) {
    case 'SET_CART_ITEMS':
      return {
        ...state,
        cartItems: action.payload,
        isLoading: false
      };
    case 'ADD_TO_CART':
      const existingItem = state.cartItems.find(item => item.bookId === action.payload.bookId);
      if (existingItem) {
        return {
          ...state,
          cartItems: state.cartItems.map(item =>
            item.bookId === action.payload.bookId
              ? { ...item, quantity: item.quantity + action.payload.quantity }
              : item
          )
        };
      } else {
        return {
          ...state,
          cartItems: [...state.cartItems, { ...action.payload, quantity: action.payload.quantity }]
        };
      }
    case 'UPDATE_QUANTITY':
      return {
        ...state,
        cartItems: state.cartItems.map(item =>
          item.bookId === action.payload.bookId
            ? { ...item, quantity: action.payload.quantity }
            : item
        )
      };
    case 'REMOVE_FROM_CART':
      return {
        ...state,
        cartItems: state.cartItems.filter(item => item.bookId !== action.payload.bookId)
      };
    case 'CLEAR_CART':
      return {
        ...state,
        cartItems: []
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

export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  const userId = user?.id || user?.userId || user?._id || 'anonymous';
  
  const [state, dispatch] = useReducer(cartReducer, {
    cartItems: [],
    isLoading: true
  });

  // Load cart items from backend API based on user
  useEffect(() => {
    const fetchCartFromAPI = async () => {
      try {
        // Only fetch from API if user is authenticated
        if (userId && userId !== 'anonymous') {
          const response = await api.get(`/cart/${userId}`);
          // Transform the backend data to match our frontend structure
          const transformedItems = response.data.map(item => ({
            id: item.cartId,
            bookId: item.book.bookId,
            title: item.book.title,
            author: item.book.author,
            price: item.book.price,
            quantity: item.quantity,
            image: item.book.imageUrl || "https://via.placeholder.com/100x150.png?text=Book+Cover"
          }));
          dispatch({ type: 'SET_CART_ITEMS', payload: transformedItems });
          // Also save to localStorage for offline access
          localStorage.setItem(`cart_${userId}`, JSON.stringify(transformedItems));
        } else {
          // For anonymous users, load from localStorage only
          const savedCart = localStorage.getItem(`cart_${userId}`);
          if (savedCart) {
            try {
              const parsedCart = JSON.parse(savedCart);
              dispatch({ type: 'SET_CART_ITEMS', payload: parsedCart });
            } catch (error) {
              console.error('Error parsing cart from localStorage:', error);
              dispatch({ type: 'SET_CART_ITEMS', payload: [] });
            }
          } else {
            dispatch({ type: 'SET_CART_ITEMS', payload: [] });
          }
        }
      } catch (error) {
        console.error('Error fetching cart from API:', error);
        // Fallback to localStorage if API fails
        const savedCart = localStorage.getItem(`cart_${userId}`);
        if (savedCart) {
          try {
            const parsedCart = JSON.parse(savedCart);
            dispatch({ type: 'SET_CART_ITEMS', payload: parsedCart });
          } catch (error) {
            dispatch({ type: 'SET_CART_ITEMS', payload: [] });
          }
        } else {
          dispatch({ type: 'SET_CART_ITEMS', payload: [] });
        }
      }
    };

    fetchCartFromAPI();
  }, [userId]);

  // Save cart items to both backend API and localStorage based on user whenever they change
  useEffect(() => {
    const saveCartToAPI = async () => {
      try {
        // Only save to API if user is authenticated
        if (userId && userId !== 'anonymous') {
          // Sync cart items to backend
          for (const item of state.cartItems) {
            await api.put(
              `/cart/${userId}/item/${item.bookId}`,
              { quantity: item.quantity }
            );
          }
        }
      } catch (error) {
        console.error('Error saving cart to API:', error);
      }
    };
    
    // Save to localStorage
    localStorage.setItem(`cart_${userId}`, JSON.stringify(state.cartItems));
    
    // If user is authenticated, also sync to backend
    if (userId && userId !== 'anonymous') {
      saveCartToAPI();
    }
  }, [state.cartItems, userId]);

  const addToCart = async (book, quantity = 1) => {
    // Check if item already exists in cart to determine the total quantity
    const existingItem = state.cartItems.find(item => item.bookId === (book.bookId || book.id));
    const newQuantity = existingItem ? existingItem.quantity + quantity : quantity;
    
    // Update local state first
    dispatch({
      type: 'ADD_TO_CART',
      payload: {
        ...book,
        quantity: newQuantity
      }
    });
    
    // Sync with backend if user is authenticated
    if (userId && userId !== 'anonymous') {
      try {
        await api.put(
          `/cart/${userId}/item/${book.bookId || book.id}`,
          { quantity: newQuantity }
        );
      } catch (error) {
        console.error('Error adding to cart in backend:', error);
        // Revert local state if backend fails?
        // For now, we'll just log the error
      }
    }
  };

  const updateQuantity = async (bookId, quantity) => {
    if (quantity <= 0) {
      dispatch({ type: 'REMOVE_FROM_CART', payload: { bookId } });
      
      // Sync removal with backend if user is authenticated
      if (userId && userId !== 'anonymous') {
        try {
          await api.delete(`/cart/${userId}/item/${bookId}`);
        } catch (error) {
          console.error('Error removing from cart in backend:', error);
        }
      }
    } else {
      dispatch({
        type: 'UPDATE_QUANTITY',
        payload: { bookId, quantity }
      });
      
      // Sync with backend if user is authenticated
      if (userId && userId !== 'anonymous') {
        try {
          await api.put(
            `/cart/${userId}/item/${bookId}`,
            { quantity: quantity }
          );
        } catch (error) {
          console.error('Error updating cart quantity in backend:', error);
        }
      }
    }
  };

  const removeFromCart = async (bookId) => {
    dispatch({ type: 'REMOVE_FROM_CART', payload: { bookId } });
    
    // Sync with backend if user is authenticated
    if (userId && userId !== 'anonymous') {
      try {
        await api.delete(`/cart/${userId}/item/${bookId}`);
      } catch (error) {
        console.error('Error removing from cart in backend:', error);
      }
    }
  };

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' });
  };

  const getTotalItems = () => {
    return state.cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  const getTotalPrice = () => {
    return state.cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  return (
    <CartContext.Provider value={{
      ...state,
      addToCart,
      updateQuantity,
      removeFromCart,
      clearCart,
      getTotalItems,
      getTotalPrice
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};