import React, { createContext, useState, useContext, useEffect, useMemo } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {

  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Set API base URL once
  axios.defaults.baseURL = "http://localhost:5000/api";

  // Attach token to axios
  useEffect(() => {

    if (token) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common["Authorization"];
    }

  }, [token]);


  // Restore session on page load
  useEffect(() => {

    const savedUser =
      localStorage.getItem("user") || sessionStorage.getItem("user");

    const savedToken =
      localStorage.getItem("token") || sessionStorage.getItem("token");

    if (savedToken && savedUser && savedUser !== "undefined") {

      try {

        const parsedUser = JSON.parse(savedUser);

        setToken(savedToken);
        setUser(parsedUser);

      } catch (error) {

        console.error("Session restoration failed:", error);
        logout();

      }

    }

    setLoading(false);

  }, []);


  const login = (newToken, newUser, remember = false) => {

    if (!newToken || !newUser) {
      console.error("Auth Error: Missing token or user.");
      return;
    }

    setToken(newToken);
    setUser(newUser);

    const isCurrentlyUsingLocal = !!localStorage.getItem("token");

    const storage =
      (remember || isCurrentlyUsingLocal) ? localStorage : sessionStorage;

    if (remember || isCurrentlyUsingLocal) {

      sessionStorage.removeItem("token");
      sessionStorage.removeItem("user");

    } else {

      localStorage.removeItem("token");
      localStorage.removeItem("user");

    }

    storage.setItem("token", newToken);
    storage.setItem("user", JSON.stringify(newUser));

  };


  const logout = () => {

    setUser(null);
    setToken(null);

    localStorage.removeItem("token");
    localStorage.removeItem("user");

    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");

    delete axios.defaults.headers.common["Authorization"];

    if (window.location.pathname !== "/login") {
      window.location.href = "/login";
    }

  };


  const authValue = useMemo(() => ({

    user,
    token,
    login,
    logout,
    loading,

    isAuthenticated: !!token,
    isAdmin: user?.role === "admin",
    isSeller: user?.role === "seller",
    isApproved: user?.is_approved === 1 || user?.is_approved === true,
    isShopper: user?.role === "customer"

  }), [user, token, loading]);


  return (

    <AuthContext.Provider value={authValue}>

      {!loading ? children : (

        <div style={spinnerContainer}>

          <div className="spinner"></div>

          <p style={{ marginTop: "10px", color: "#10b981", fontWeight: "600" }}>
            Verifying Session...
          </p>

        </div>

      )}

    </AuthContext.Provider>

  );

};

export const useAuth = () => {

  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;

};

const spinnerContainer = {

  height: "100vh",
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  alignItems: "center",
  fontFamily: "sans-serif",
  background: "#ffffff"

};