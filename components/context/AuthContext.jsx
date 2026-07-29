"use client";

import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [checked, setChecked] = useState(false);

  // Read on mount only (not during render) so the server-rendered HTML and
  // the first client render match — avoids a hydration mismatch. `checked`
  // lets consumers (e.g. the /profile route guard) wait for this read
  // before deciding whether to redirect, so a logged-in user isn't bounced
  // to /login during the one-tick window before localStorage is read.
  useEffect(() => {
    setIsAuthenticated(!!localStorage.getItem("portfolio_token"));
    setChecked(true);
  }, []);

  const getToken = () => localStorage.getItem("portfolio_token");

  const login = async (username, password) => {
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (data.success) {
        localStorage.setItem("portfolio_token", data.token);
        setIsAuthenticated(true);
        return { success: true };
      }
      return { success: false, error: data.error };
    } catch (err) {
      return { success: false, error: "Login failed. Please try again." };
    }
  };

  const logout = () => {
    localStorage.removeItem("portfolio_token");
    setIsAuthenticated(false);
  };

  const changePassword = async (currentPass, newPass) => {
    try {
      const token = getToken();
      const res = await fetch("/api/auth/change-password", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ currentPassword: currentPass, newPassword: newPass }),
      });
      return await res.json();
    } catch (err) {
      return { success: false, error: "Failed to change password." };
    }
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, checked, login, logout, changePassword, getToken }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
