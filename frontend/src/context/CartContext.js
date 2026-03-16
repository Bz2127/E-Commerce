import React, { createContext, useState, useContext, useEffect, useCallback } from "react";
import axios from "axios";
import { useAuth } from "./AuthContext";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [wishlist, setWishlist] = useState([]); // Added for the Navbar sign
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  // Load wishlist from backend
  const fetchWishlist = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      const res = await axios.get("http://localhost:5000/api/wishlist", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setWishlist(res.data.wishlist || []);
    } catch (err) {
      console.error("Failed to fetch wishlist:", err);
    }
  }, []);

  useEffect(() => {
    if (user) {
      fetchWishlist();
    } else {
      setWishlist([]);
    }
  }, [user, fetchWishlist]);

  // LOAD CART FROM LOCAL STORAGE
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem("cart");
      if (savedCart) {
        setCart(JSON.parse(savedCart));
      }
    } catch (err) {
      console.error("Failed to load cart:", err);
    }
  }, []);

  // SAVE CART TO LOCAL STORAGE
  useEffect(() => {
    try {
      localStorage.setItem("cart", JSON.stringify(cart));
    } catch (err) {
      console.error("Failed to save cart:", err);
    }
  }, [cart]);

  // BACKEND CART SYNC
  const syncToBackend = useCallback(async () => {
    if (!user?.id || cart.length === 0) return;
    try {
      setIsLoading(true);
      await axios.post("http://localhost:5000/api/cart/sync", {
        cart: cart.map((item) => ({
          ...item,
          variant_id: item.variant_id || null 
        }))
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
    } catch (err) {
      console.log("Backend sync failed");
    } finally {
      setIsLoading(false);
    }
  }, [cart, user]);

  useEffect(() => {
    if (user?.id && cart.length > 0) {
      const timer = setTimeout(syncToBackend, 2000);
      return () => clearTimeout(timer);
    }
  }, [cart, syncToBackend, user]);

  const addToCart = (product) => {
    setCart((prev) => {
      const existingIndex = prev.findIndex(
        (item) => item.id === product.id && item.variant_id === product.variant_id
      );
      if (existingIndex > -1) {
        const updatedCart = [...prev];
        updatedCart[existingIndex] = {
          ...updatedCart[existingIndex],
          quantity: (updatedCart[existingIndex].quantity || 0) + (product.quantity || 1),
        };
        return updatedCart;
      }
      return [...prev, { ...product, quantity: product.quantity || 1 }];
    });
  };

  const removeFromCart = (id, variant_id = null) => {
    setCart((prev) =>
      prev.filter((item) => !(item.id === id && (item.variant_id || null) === (variant_id || null)))
    );
  };

  const updateQuantity = (id, newQty, variant_id = null) => {
    if (newQty < 1) return;
    setCart((prev) =>
      prev.map((item) => (item.id === id && (item.variant_id || null) === (variant_id || null)) 
        ? { ...item, quantity: newQty } 
        : item)
    );
  };

  const getCartTotal = () => {
    return cart.reduce((total, item) => total + (Number(item.price) || 0) * (Number(item.quantity) || 0), 0);
  };

  const cartCount = cart.reduce((total, item) => total + (item.quantity || 0), 0);

  const clearCart = () => {
    setCart([]);
    localStorage.removeItem("cart");
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        wishlist, 
        fetchWishlist, 
        cartCount,
        isLoading,
        addToCart,
        removeFromCart,
        updateQuantity,
        getCartTotal,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within CartProvider");
  }
  return context;
};