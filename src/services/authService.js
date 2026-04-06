import { apiClient } from "./api";

export const authService = {
  async register(userData) {
    try {
      const response = await apiClient.post("/user/register", userData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.msg || "Ошибка регистрации");
    }
  },

  async login(credentials) {
    try {
      const formData = new URLSearchParams();
      formData.append("username", credentials.username);
      formData.append("password", credentials.password);
      formData.append("grant_type", "password");

      const response = await apiClient.post("/user/login", formData, {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      });

      console.log("login response: ", response);

      // Проверяем структуру ответа
      if (response.data.access_token) {
        // Проверяем, является ли access_token массивом с кодом ошибки
        if (
          Array.isArray(response.data.access_token) &&
          response.data.access_token[0] === "code"
        ) {
          const errorCode = response.data.access_token[1];
          const errorMessage =
            response.data.user_id?.[1] ||
            `Ошибка авторизации (код: ${errorCode})`;

          console.error("Login failed:", errorMessage);
          throw new Error(errorMessage);
        }

        // Если это строка (настоящий токен)
        if (typeof response.data.access_token === "string") {
          localStorage.setItem("access_token", response.data.access_token);
          return response.data;
        }
      }

      throw new Error("Неверный формат ответа от сервера");
    } catch (error) {
      console.error("Login error:", error.message);
      throw error;
    }
  },

  logout() {
    localStorage.removeItem("access_token");
  },

  isAuthenticated() {
    return !!localStorage.getItem("access_token");
  },

  getToken() {
    return localStorage.getItem("access_token");
  },
};
