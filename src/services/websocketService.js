import { authClient } from "./api";

class WebSocketService {
  constructor() {
    this.ws = null;
    this.listeners = new Map();
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 3000;
    this.currentDashboardId = null;
    this.currentUserId = null;
    this.isActive = false;
  }

  getEventNotificationUrl() {
    try {
      const baseURL = authClient.defaults.baseURL || "";
      const eventUrl = `${baseURL}/event/event_notification`;

      console.log("Event notification URL:", eventUrl);
      return eventUrl;
    } catch (error) {
      console.error("Error getting event notification URL:", error);
    }
  }

  connectForDashboard(userId, dashboardId) {
    console.log("WebSocket: запрос подключения для дашборда", {
      userId,
      dashboardId,
      currentDashboardId: this.currentDashboardId,
      isActive: this.isActive,
      wsState: this.ws?.readyState,
    });

    if (
      this.isActive &&
      this.currentDashboardId === dashboardId &&
      this.ws?.readyState === WebSocket.OPEN
    ) {
      console.log("WebSocket уже подключен для этого дашборда");
      return;
    }

    if (this.isActive && this.currentDashboardId !== dashboardId) {
      console.log(
        "WebSocket: переключаемся с дашборда",
        this.currentDashboardId,
        "на",
        dashboardId
      );
      this.disconnect();
    }

    if (!this.isActive || !this.ws || this.ws.readyState === WebSocket.CLOSED) {
      this.currentUserId = userId;
      this.currentDashboardId = dashboardId;
      this.connect(userId);
    }
  }

  connect(userId) {
    if (!userId) {
      console.error("User ID is required for WebSocket connection");
      return;
    }

    if (this.ws) {
      this.ws.close(1000, "Reconnecting");
      this.ws = null;
    }

    const baseUrl = this.getEventNotificationUrl();
    const wsUrl = `${baseUrl}?user_id=${userId}`;

    console.log("Connecting to WebSocket for dashboard:", {
      url: wsUrl,
      dashboardId: this.currentDashboardId,
      userId: userId,
    });

    try {
      this.ws = new WebSocket(wsUrl);
      this.isActive = true;

      this.ws.onopen = () => {
        console.log(
          "WebSocket connected successfully for dashboard:",
          this.currentDashboardId,
          "URL:",
          wsUrl
        );
        this.reconnectAttempts = 0;

        this.notifyListeners({
          event_type: "websocket_connected",
          dashboard_id: this.currentDashboardId,
          timestamp: new Date().toISOString(),
        });

        this.subscribeToDashboard();
      };

      this.ws.onmessage = (event) => {
        try {
          console.log(
            "WebSocket raw message received for dashboard:",
            this.currentDashboardId,
            "Data length:",
            event.data.length
          );

          const preview =
            event.data.length > 500
              ? event.data.substring(0, 500) + "..."
              : event.data;
          console.log("Raw message preview:", preview);

          // Обрабатываем сообщение "connection established"
          if (event.data === "connection established") {
            console.log("WebSocket connection established");
            this.notifyListeners({
              event_type: "connection_established",
              dashboard_id: this.currentDashboardId,
              timestamp: new Date().toISOString(),
              message: event.data,
            });
            return; // Прерываем дальнейшую обработку
          }

          // УЛУЧШЕННЫЙ ПАРСИНГ: сервер возвращает "Message text was: {JSON}"
          let parsedData;

          if (event.data.startsWith("Message text was: ")) {
            // Извлекаем JSON из текста
            const jsonStart = event.data.indexOf("{");
            const jsonEnd = event.data.lastIndexOf("}") + 1;

            if (jsonStart !== -1 && jsonEnd !== -1) {
              const jsonString = event.data.substring(jsonStart, jsonEnd);
              console.log("Extracted JSON from message:", jsonString);
              parsedData = JSON.parse(jsonString);
            } else {
              console.error("Cannot find JSON in message:", event.data);
              return;
            }
          } else {
            // Пытаемся распарсить как обычный JSON
            parsedData = JSON.parse(event.data);
          }

          console.log(
            "WebSocket parsed message for dashboard:",
            this.currentDashboardId,
            "Data:",
            parsedData
          );

          this.processWebSocketData(parsedData, this.currentDashboardId);
        } catch (error) {
          // Если это не JSON и не "connection established", логируем но не паникуем
          console.warn("Could not parse WebSocket message as JSON:", {
            error: error.message,
            data: event.data.substring(0, 100),
            isConnectionEstablished: event.data === "connection established",
          });

          // Можно опционально уведомить слушателей о текстовом сообщении
          if (
            event.data.includes("established") ||
            event.data.includes("connected")
          ) {
            console.log("Connection status message:", event.data);
          }
        }
      };

      this.ws.onerror = (error) => {
        console.error(
          "WebSocket error for dashboard",
          this.currentDashboardId,
          "Error:",
          error
        );
        this.isActive = false;
      };

      this.ws.onclose = (event) => {
        console.log(
          "WebSocket disconnected for dashboard",
          this.currentDashboardId,
          "Code:",
          event.code,
          "Reason:",
          event.reason,
          "Was clean:",
          event.wasClean
        );
        this.isActive = false;

        this.notifyListeners({
          event_type: "websocket_disconnected",
          dashboard_id: this.currentDashboardId,
          code: event.code,
          reason: event.reason,
          wasClean: event.wasClean,
          timestamp: new Date().toISOString(),
        });

        if (
          event.code !== 1000 &&
          this.currentUserId &&
          this.currentDashboardId
        ) {
          this.attemptReconnect();
        }
      };
    } catch (error) {
      console.error("Error creating WebSocket connection:", error);
      this.isActive = false;
    }
  }

  // Попытка ручного парсинга если JSON невалиден
  tryManualParsing(rawData) {
    try {
      // Пробуем найти JSON в строке
      const jsonRegex = /\{[\s\S]*\}/;
      const match = rawData.match(jsonRegex);

      if (match) {
        const jsonString = match[0];
        console.log("Found JSON in raw data:", jsonString);
        const data = JSON.parse(jsonString);
        this.processWebSocketData(data, this.currentDashboardId);
      }
    } catch (error) {
      console.error("Manual parsing also failed:", error);
    }
  }

  subscribeToDashboard() {
    if (
      !this.ws ||
      this.ws.readyState !== WebSocket.OPEN ||
      !this.currentDashboardId
    ) {
      return;
    }

    try {
      const subscribeMessage = {
        event_type: "subscribe",
        dashboard_id: this.currentDashboardId,
        timestamp: new Date().toISOString(),
      };

      console.log("Sending subscribe message:", subscribeMessage);
      this.ws.send(JSON.stringify(subscribeMessage));
    } catch (error) {
      console.error("Error sending subscribe message:", error);
    }
  }

  disconnect() {
    console.log(
      "WebSocket: закрытие соединения для дашборда",
      this.currentDashboardId
    );

    if (this.ws) {
      this.ws.close(1000, "Dashboard switched");
      this.ws = null;
    }

    this.isActive = false;
    this.currentDashboardId = null;
    this.currentUserId = null;
    this.reconnectAttempts = 0;
  }

  attemptReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.log("Max reconnection attempts reached");
      return;
    }

    this.reconnectAttempts++;
    console.log(
      `Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`
    );

    setTimeout(() => {
      if (this.currentUserId && this.currentDashboardId) {
        console.log("Executing reconnection...");
        this.connect(this.currentUserId);
      }
    }, this.reconnectDelay * this.reconnectAttempts);
  }

  processWebSocketData(data, currentDashboardId) {
    if (!data || typeof data !== "object") {
      console.warn("Invalid data received in processWebSocketData:", data);
      return;
    }

    console.log("Processing WebSocket data:", data);

    // Проверяем эхо нашего сообщения о подписке
    if (
      data.event_type === "subscribe" &&
      data.dashboard_id === currentDashboardId
    ) {
      console.log("Received echo of our subscribe message");
      return;
    }

    // Проверяем, есть ли данные для текущего дашборда
    if (data[currentDashboardId]) {
      const dashboardData = data[currentDashboardId];

      if (dashboardData && typeof dashboardData === "object") {
        // Обрабатываем каждый виджет
        const processedWidgetData = {};

        Object.keys(dashboardData).forEach((widgetId) => {
          const widgetArray = dashboardData[widgetId];

          if (Array.isArray(widgetArray) && widgetArray.length > 0) {
            // Берем первый элемент массива
            processedWidgetData[widgetId] = widgetArray[0];

            console.log(`Processed widget ${widgetId}:`, widgetArray[0]);
          }
        });

        if (Object.keys(processedWidgetData).length > 0) {
          const widgetEvent = {
            event_type: "widget_update",
            dashboard_id: currentDashboardId,
            widget_data: processedWidgetData,
            timestamp: new Date().toISOString(),
          };

          console.log(
            `Sending widget updates for dashboard ${currentDashboardId}:`,
            processedWidgetData
          );
          this.notifyListeners(widgetEvent);
        }
      }
    }

    // Также обрабатываем данные в новом формате
    this.processParsedData(data);
  }

  addListener(dashboardId, callback) {
    if (!this.listeners.has(dashboardId)) {
      this.listeners.set(dashboardId, []);
    }
    this.listeners.get(dashboardId).push(callback);

    console.log(
      `Added listener for dashboard ${dashboardId}, total listeners:`,
      this.listeners.get(dashboardId).length
    );
  }

  removeListener(dashboardId, callback) {
    if (this.listeners.has(dashboardId)) {
      const callbacks = this.listeners.get(dashboardId);
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
        console.log(
          `Removed listener for dashboard ${dashboardId}, remaining:`,
          callbacks.length
        );
      }
    }
  }

  notifyListeners(data) {
    const dashboardId = data.dashboard_id;
    console.log(
      `Notifying listeners for dashboard ${dashboardId}, data:`,
      data
    );

    if (dashboardId && this.listeners.has(dashboardId)) {
      const callbacks = this.listeners.get(dashboardId);
      console.log(
        `Found ${callbacks.length} listeners for dashboard ${dashboardId}`
      );

      callbacks.forEach((callback, index) => {
        try {
          console.log(`Calling listener ${index + 1}/${callbacks.length}`);
          callback(data);
        } catch (error) {
          console.error(`Error in WebSocket listener ${index}:`, error);
        }
      });
    } else {
      console.log(`No listeners found for dashboard ${dashboardId}`);
    }
  }

  getStatus() {
    return {
      isActive: this.isActive,
      currentDashboardId: this.currentDashboardId,
      readyState: this.ws?.readyState,
      readyStateText: this.ws
        ? this.getReadyStateText(this.ws.readyState)
        : "DISCONNECTED",
      url: this.ws?.url,
      listenersCount: this.listeners.has(this.currentDashboardId)
        ? this.listeners.get(this.currentDashboardId).length
        : 0,
    };
  }

  getReadyStateText(state) {
    switch (state) {
      case 0:
        return "CONNECTING";
      case 1:
        return "OPEN";
      case 2:
        return "CLOSING";
      case 3:
        return "CLOSED";
      default:
        return "UNKNOWN";
    }
  }

  processParsedData(data) {
    if (!data || typeof data !== "object") {
      console.warn("Invalid data after parsing:", data);
      return;
    }

    console.log("Processing parsed data:", data);

    if (
      data.event_type === "widget_update" &&
      data.dashboard_id &&
      data.widget_data
    ) {
      console.log("Widget update received for dashboard:", data.dashboard_id);
      const parsedWidgetData = this.parseWidgetData(data.widget_data);

      console.log("Parsed widget data:", parsedWidgetData);

      this.notifyListeners({
        event_type: "widget_update",
        dashboard_id: data.dashboard_id,
        widget_data: parsedWidgetData,
        raw_data: data.widget_data,
        timestamp: data.timestamp || new Date().toISOString(),
      });
    }

    // Другие типы событий
    else if (data.event_type) {
      console.log(`Event: ${data.event_type}`, data);
      this.notifyListeners(data);
    }

    // Любые другие данные
    else {
      console.log("Generic WebSocket event:", data);
      this.notifyListeners({
        ...data,
        timestamp: new Date().toISOString(),
      });
    }
  }

  parseWidgetData(widgetData) {
    const result = {};

    if (!widgetData || typeof widgetData !== "object") {
      console.warn("Invalid widgetData in parseWidgetData:", widgetData);
      return result;
    }

    console.log("Parsing widget data, keys:", Object.keys(widgetData));

    Object.keys(widgetData).forEach((serverWidgetId) => {
      const widgetItem = widgetData[serverWidgetId];

      // Если данные уже обработаны (не массив), просто копируем
      if (
        widgetItem &&
        typeof widgetItem === "object" &&
        !Array.isArray(widgetItem)
      ) {
        const parsedInfo = this.parseEventInfo(widgetItem.event_info);

        const widgetDataItem = {
          ...parsedInfo,
          event_date: widgetItem.event_date,
          image_id: widgetItem.image_id,
          server_id: serverWidgetId,
          timestamp: widgetItem.event_date || new Date().toISOString(),
        };

        result[serverWidgetId] = widgetDataItem;

        console.log(`Parsed widget ${serverWidgetId}:`, widgetDataItem);
      }
      // Если это массив, берем первый элемент
      else if (Array.isArray(widgetItem) && widgetItem.length > 0) {
        const widgetInfo = widgetItem[0];

        if (widgetInfo) {
          const parsedInfo = this.parseEventInfo(widgetInfo.event_info);

          const widgetDataItem = {
            ...parsedInfo,
            event_date: widgetInfo.event_date,
            image_id: widgetInfo.image_id,
            server_id: serverWidgetId,
            timestamp: widgetInfo.event_date || new Date().toISOString(),
          };

          result[serverWidgetId] = widgetDataItem;

          console.log(`Parsed widget ${serverWidgetId} from array:`, {
            event_info: widgetInfo.event_info,
            image_id: widgetInfo.image_id,
            parsed: parsedInfo,
            full_data: widgetDataItem,
          });
        } else {
          console.log(`Widget ${serverWidgetId} has no data:`, widgetInfo);
        }
      } else {
        console.log(`Widget ${serverWidgetId} has invalid data:`, widgetItem);
      }
    });

    return result;
  }

  parseEventInfo(eventInfo) {
    if (!eventInfo || typeof eventInfo !== "string") {
      console.warn("Invalid event_info:", eventInfo);
      return {
        percentage: 0,
        value: 0,
        event: null,
      };
    }

    try {
      // Проверяем события опасности
      const lowerEventInfo = eventInfo.toLowerCase().trim();

      if (lowerEventInfo === "fire" || lowerEventInfo === "smoke") {
        return {
          event: lowerEventInfo,
          raw_event_info: eventInfo,
          hasDangerEvent: true,
          timestamp: new Date().toISOString(),
        };
      }

      // Оригинальная логика для числовых данных
      const parts = eventInfo.split(",").map((part) => part.trim());

      if (parts.length >= 2) {
        const percentage = parseFloat(parts[0]);
        const value = parseInt(parts[1], 10);

        console.log(`Parsing event_info "${eventInfo}":`, {
          parts,
          percentage,
          value,
        });

        return {
          percentage: isNaN(percentage) ? 0 : percentage,
          value: isNaN(value) ? 0 : value,
          raw_event_info: eventInfo,
          event: null,
        };
      }
    } catch (error) {
      console.error("Error parsing event_info:", eventInfo, error);
    }

    return {
      percentage: 0,
      value: 0,
      raw_event_info: eventInfo,
      event: null,
    };
  }
}

export const webSocketService = new WebSocketService();
