import { authClient } from "./api";

export const dashboardService = {
  // Получение списка виджетов
  async getWidgets() {
    try {
      console.log("[getWidgets] Запрашиваем список виджетов");

      const response = await authClient.get("/user/widget", {
        timeout: 30000,
      });

      console.log("[getWidgets] Ответ сервера:", response.data);

      const responseData = response.data;

      if (!responseData.success || responseData.error) {
        throw new Error(
          responseData.error?.msg || "Ошибка при получении списка виджетов"
        );
      }

      return responseData.data?.widgets || [];
    } catch (error) {
      console.error("[getWidgets] Ошибка запроса:", error);
      throw error;
    }
  },

  // Сохранение дашборда
  async saveDashboard(dashboardData) {
    try {
      console.log(
        "[saveDashboard] Отправляем запрос с данными:",
        dashboardData
      );

      // Формируем запрос строго по спецификации
      const requestData = {
        name: dashboardData.name || "Новый дашборд",
        data: dashboardData.data, // JSON строка (компактная)
        widget_id: dashboardData.widgetIds || [],
      };

      // Логируем структуру запроса (без полного data для экономии места)
      console.log("[saveDashboard] Структура запроса:", {
        requestData,
      });

      const response = await authClient.post(
        "/user/save_dashboard",
        requestData,
        {
          headers: {
            "Content-Type": "application/json",
          },
          timeout: 30000,
        }
      );

      console.log("[saveDashboard] Ответ сервера:", response.data);

      const responseData = response.data;

      if (!responseData.success || responseData.error) {
        console.log("[saveDashboard] Ошибка в ответе:", responseData.error);
        throw new Error(
          responseData.error?.msg || "Ошибка при сохранении дашборда"
        );
      }

      return responseData.data || responseData;
    } catch (error) {
      console.error("[saveDashboard] Ошибка запроса:", {
        error: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
      throw error;
    }
  },

  // Получение списка дашбордов пользователя
  async getUserDashboards() {
    try {
      console.log(
        "[getUserDashboards] Запрашиваем список дашбордов пользователя"
      );

      const response = await authClient.get("/user/dashboard", {
        timeout: 30000,
      });

      console.log("[getUserDashboards] Ответ сервера:", response.data);

      const responseData = response.data;

      if (!responseData.success || responseData.error) {
        throw new Error(
          responseData.error?.msg || "Ошибка при получении списка дашбордов"
        );
      }

      return responseData.data?.dashboards || [];
    } catch (error) {
      console.error("[getUserDashboards] Ошибка запроса:", error);
      throw error;
    }
  },

  // Обновление дашборда
  async updateDashboard(dashboardData) {
    try {
      console.log(
        "[updateDashboard] Отправляем запрос на обновление:",
        dashboardData
      );

      const response = await authClient.post(
        "/user/update_dashboard",
        {
          dashboard_id: dashboardData.dashboard_id,
          name: dashboardData.name || "Дашборд",
          data: dashboardData.data,
          widget_id: dashboardData.widget_id || [],
          video_id: dashboardData.video_id || [],
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
          timeout: 30000,
        }
      );

      console.log("[updateDashboard] Ответ сервера:", response.data);

      const responseData = response.data;

      if (!responseData.success || responseData.error) {
        console.log("[updateDashboard] Ошибка в ответе:", responseData.error);
        throw new Error(
          responseData.error?.msg || "Ошибка при обновлении дашборда"
        );
      }

      return responseData.data || responseData;
    } catch (error) {
      console.error("[updateDashboard] Ошибка запроса:", {
        error: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
      throw error;
    }
  },

  // Удаление дашборда
  async deleteDashboard(dashboardId) {
    try {
      console.log(
        "[deleteDashboard] Отправляем запрос на удаление дашборда:",
        dashboardId
      );

      const response = await authClient.delete("/user/delete_dashboard", {
        data: {
          dashboard_id: dashboardId,
        },
        headers: {
          "Content-Type": "application/json",
        },
        timeout: 30000,
      });

      console.log("[deleteDashboard] Ответ сервера:", response.data);

      const responseData = response.data;

      if (!responseData.success || responseData.error) {
        console.log("[deleteDashboard] Ошибка в ответе:", responseData.error);
        throw new Error(
          responseData.error?.msg || "Ошибка при удалении дашборда"
        );
      }

      return responseData.data || responseData;
    } catch (error) {
      console.error("[deleteDashboard] Ошибка запроса:", {
        error: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
      throw error;
    }
  },
};
