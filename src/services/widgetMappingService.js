import { dashboardService } from "./dashboardService";

class WidgetMappingService {
  constructor() {
    this.codeToIdMap = new Map();
    this.idToCodeMap = new Map();
    this.isLoaded = false;
    this.loadingPromise = null;
  }

  // Загрузка маппинга
  async loadMapping() {
    if (this.isLoaded) {
      return true;
    }

    if (this.loadingPromise) {
      return this.loadingPromise;
    }

    this.loadingPromise = this._loadMappingInternal();
    return this.loadingPromise;
  }

  async _loadMappingInternal() {
    try {
      const widgets = await dashboardService.getWidgets();

      widgets.forEach((widget) => {
        this.codeToIdMap.set(widget.code, widget.id);
        this.idToCodeMap.set(widget.id, widget.code);
      });

      this.isLoaded = true;
      console.log("Маппинг виджетов загружен:", {
        codeToId: Object.fromEntries(this.codeToIdMap),
        idToCode: Object.fromEntries(this.idToCodeMap),
      });

      return true;
    } catch (error) {
      console.error("Ошибка загрузки маппинга виджетов:", error);
      this.loadingPromise = null;
      throw error;
    }
  }

  // Получить ID по коду
  getIdByCode(code) {
    return this.codeToIdMap.get(code);
  }

  // Получить код по ID
  getCodeById(id) {
    return this.idToCodeMap.get(id);
  }

  // Конвертировать виджеты дашборда для WebSocket
  convertWidgetsForWebSocket(dashboardWidgets) {
    const mapping = {};

    console.log("Конвертация виджетов для WebSocket:", {
      dashboardWidgets: dashboardWidgets.map((w) => ({ i: w.i, type: w.type })),
      codeToIdMap: Object.fromEntries(this.codeToIdMap),
    });

    dashboardWidgets.forEach((widget) => {
      // Получаем серверный ID по коду виджета
      const serverId = this.getIdByCode(widget.type);

      if (serverId) {
        // serverId → clientId
        mapping[serverId] = widget.i;
        console.log(`Маппинг: ${serverId} (${widget.type}) → ${widget.i}`);
      } else {
        console.warn(`Не найден серверный ID для кода виджета: ${widget.type}`);
      }
    });

    console.log("Итоговый маппинг:", mapping);
    return mapping;
  }

  // Конвертировать данные WebSocket для клиента
  convertWebSocketData(wsData, dashboardWidgets) {
    const result = {};

    // Сначала создаем обратный маппинг: clientId → serverId
    const clientToServerMap = {};
    dashboardWidgets.forEach((widget) => {
      const serverId = this.getIdByCode(widget.type);
      if (serverId) {
        clientToServerMap[widget.i] = serverId;
      }
    });

    // Преобразуем данные WebSocket
    Object.keys(wsData).forEach((dashboardId) => {
      const dashboardData = wsData[dashboardId];

      if (dashboardData && typeof dashboardData === "object") {
        Object.keys(dashboardData).forEach((serverWidgetId) => {
          // Находим клиентский ID через обратный маппинг
          let clientWidgetId = null;
          Object.keys(clientToServerMap).forEach((clientId) => {
            if (clientToServerMap[clientId] === serverWidgetId) {
              clientWidgetId = clientId;
            }
          });

          if (clientWidgetId) {
            const widgetDataArray = dashboardData[serverWidgetId];

            if (Array.isArray(widgetDataArray) && widgetDataArray.length > 0) {
              const widgetData = widgetDataArray[0];
              result[clientWidgetId] = widgetData;
            }
          }
        });
      }
    });

    return result;
  }

  reset() {
    this.codeToIdMap.clear();
    this.idToCodeMap.clear();
    this.isLoaded = false;
    this.loadingPromise = null;
  }
}

export const widgetMappingService = new WidgetMappingService();
