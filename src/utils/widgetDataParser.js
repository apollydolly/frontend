export const parseEventInfo = (eventInfo) => {
  if (!eventInfo || typeof eventInfo !== "string") {
    return {
      peopleCount: 0,
      occupancyPercentage: 0,
      isOpen: true,
      event: null,
    };
  }

  try {
    // Проверяем, не является ли это событием опасности
    const dangerEvents = ["fire", "smoke"];
    const lowerEventInfo = eventInfo.toLowerCase();

    if (dangerEvents.some((event) => lowerEventInfo.includes(event))) {
      let eventType = null;
      if (lowerEventInfo.includes("fire")) {
        eventType = "fire";
      } else if (lowerEventInfo.includes("smoke")) {
        eventType = "smoke";
      }

      return {
        event: eventType,
        rawEventInfo: eventInfo,
        timestamp: new Date().toISOString(),
      };
    }

    // Пытаемся распарсить как JSON
    try {
      const parsed = JSON.parse(eventInfo);

      // Проверяем разные форматы данных
      if (Array.isArray(parsed)) {
        const [peopleCount, occupancyPercentage] = parsed;

        return {
          peopleCount: peopleCount || 0,
          occupancyPercentage: (occupancyPercentage || 0) * 100,
          isOpen: peopleCount >= 0,
          rawEventInfo: eventInfo,
          event: null,
        };
      } else if (typeof parsed === "object") {
        const keys = Object.keys(parsed);
        if (keys.length > 0 && Array.isArray(parsed[keys[0]])) {
          const [peopleCount, occupancyPercentage] = parsed[keys[0]];

          return {
            peopleCount: peopleCount || 0,
            occupancyPercentage: (occupancyPercentage || 0) * 100,
            isOpen: peopleCount >= 0,
            rawEventInfo: eventInfo,
            event: null,
            zoneName: keys[0],
          };
        }
      }
    } catch (jsonError) {
      console.log("Не JSON, пробуем исходный парсинг:", eventInfo);
    }

    const parts = eventInfo.split(",").map((part) => part.trim());

    if (parts.length >= 2) {
      const peopleCount = parseInt(parts[0], 10) || 0;
      const occupancyPercentage = parseFloat(parts[1]) * 100 || 0;

      return {
        peopleCount: peopleCount,
        occupancyPercentage: occupancyPercentage,
        isOpen: peopleCount >= 0,
        rawEventInfo: eventInfo,
        event: null,
      };
    }
  } catch (error) {
    console.error("Error parsing event_info:", error, eventInfo);
  }

  return {
    peopleCount: 0,
    occupancyPercentage: 0,
    isOpen: true,
    event: null,
  };
};

export const transformWidgetData = (widgetType, webSocketData) => {
  if (!webSocketData) {
    console.log(`No WebSocket data for widget type: ${widgetType}`);
    return {};
  }

  console.log(
    `Transforming data for widget type: ${widgetType}`,
    webSocketData
  );

  const { peopleCount, occupancyPercentage, isOpen, event, zoneName } =
    parseEventInfo(webSocketData.event_info);

  console.log(`Parsed event info:`, {
    event_info: webSocketData.event_info,
    peopleCount: peopleCount,
    occupancyPercentage: occupancyPercentage,
    isOpen: isOpen,
    event: event,
    zoneName: zoneName,
    image_id: webSocketData.image_id,
  });

  switch (widgetType) {
    case "checkout":
      return {
        peopleCount: peopleCount,
        name: "Кассовая зона",
        description: "Загруженность",
        occupancyPercentage: occupancyPercentage,
        rawData: webSocketData,
      };

    case "queueCheckout":
      return {
        checkoutNumber: 1,
        peopleCount: peopleCount,
        isOpen: isOpen,
        name: `Касса №1`,
        description: "Текущая очередь",
        occupancyPercentage: occupancyPercentage,
        rawData: webSocketData,
      };

    case "danger":
      return {
        event: event,
        eventDate: webSocketData.event_date,
        timestamp: webSocketData.event_date || new Date().toISOString(),
        rawData: webSocketData,
        event_info: webSocketData.event_info,
        image_id: webSocketData.image_id,
      };

    default:
      return {
        peopleCount: peopleCount,
        isOpen: isOpen,
        occupancyPercentage: occupancyPercentage,
        rawData: webSocketData,
      };
  }
};
