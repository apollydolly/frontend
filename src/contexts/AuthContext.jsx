import React, { createContext, useState, useContext, useEffect } from "react";
import { authService } from "@services/authService";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const init = async () => {
      try {
        setLoading(true);

        // Быстрая синхронная проверка наличия токена
        const token = authService.getToken();
        if (!token) {
          setIsAuthenticated(false);
          setLoading(false);
          return;
        }

        try {
          setIsAuthenticated(true);
        } catch (err) {
          console.warn(
            "Token validation failed:",
            err?.response?.status || err
          );
          // Если валидация провалилась — чистим токен
          authService.logout();
          setIsAuthenticated(false);
        }
      } catch (err) {
        console.error("Auth init error:", err);
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    init();
  }, []);

  useEffect(() => {
    // Слушаем истечение токена
    const handleExpired = () => {
      setIsAuthenticated(false);
    };

    window.addEventListener("tokenExpired", handleExpired);

    return () => {
      window.removeEventListener("tokenExpired", handleExpired);
    };
  }, []);

  const login = async (username, password) => {
    try {
      setError("");
      const result = await authService.login({ username, password });
      if (result.access_token) {
        setIsAuthenticated(true);
        return { success: true };
      } else {
        setIsAuthenticated(false);
        setError("Не удалось получить токен");
        return { success: false, message: "Не удалось получить токен" };
      }
    } catch (err) {
      const message =
        err.response?.data?.user_id?.[1] ||
        err.response?.data?.user_id ||
        "Ошибка авторизации";
      setError(message);
      return { success: false, message };
    }
  };

  const register = async (loginStr, email, password) => {
    try {
      setError("");
      await authService.register({ login: loginStr, email, password });
      return { success: true };
    } catch (err) {
      const message =
        err.response?.data?.detail?.[0]?.msg ||
        err.response?.data?.detail ||
        "Ошибка регистрации";
      setError(message);
      return { success: false, message };
    }
  };

  const logout = () => {
    authService.logout();
    setIsAuthenticated(false);
  };

  const value = {
    isAuthenticated,
    login,
    register,
    logout,
    loading,
    error,
    clearError: () => setError(""),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
