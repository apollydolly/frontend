import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from "react";
import { useNavigate } from "react-router-dom";
import { Responsive, WidthProvider } from "react-grid-layout";
import styles from "./DashboardViewer.module.scss";
import { Widget } from "@dashboard/Widget";
import { Tabs } from "@dashboard/Tabs";
import { PrimaryButton } from "@ui/buttons/PrimaryButton";
import { SmallButton } from "@ui/buttons/SmallButton";
import { UploadVideoModal } from "@ui/shared/UploadVideoModal";
import { ConfirmModal } from "@ui/shared/ConfirmModal";
import { webSocketService } from "@services/websocketService";
import { widgetMappingService } from "@services/widgetMappingService";
import { dashboardService } from "@services/dashboardService";
import { WidgetModal } from "@ui/shared/WidgetModal";
import ConnectVideo from "@icons/camera.svg?react";
import EditIcon from "@icons/edit.svg?react";
import VideoIcon from "@icons/video_camera.svg?react";
import DownloadIcon from "@icons/download.svg?react";
import FullScreenIcon from "@icons/open_fullscreen.svg?react";
import SmallMenuIcon from "@icons/icon_small_menu.svg?react";

const ResponsiveGridLayout = WidthProvider(Responsive);

// Функция для восстановления и парсинга поврежденного JSON
const parseDashboardData = (dataString) => {
  if (!dataString || typeof dataString !== "string") {
    return { version: 1, tabs: [], activeTab: null };
  }

  console.log("Parsing dashboard data string, length:", dataString.length);

  try {
    // Пытаемся распарсить как есть
    return JSON.parse(dataString);
  } catch (error) {
    console.log("Initial parse failed, attempting repair...");

    // Создаем копию строки для восстановления
    let repaired = dataString;

    // Находим и исправляем обрезанный activeTab
    // Ищем "activeTab":"значение без закрывающей кавычки
    const activeTabRegex = /"activeTab":"([^"]*?)(?="|,|$)/g;
    let match;
    while ((match = activeTabRegex.exec(repaired)) !== null) {
      const start = match.index;
      const end = start + match[0].length;
      const value = match[1];

      // Если после значения нет кавычки, добавляем её
      if (repaired[end] !== '"') {
        repaired = repaired.substring(0, end) + '"' + repaired.substring(end);
        console.log("Fixed activeTab quote");
      }
    }

    // Закрываем JSON если он обрезан
    if (!repaired.trim().endsWith("}")) {
      // Считаем незакрытые скобки
      const openBraces = (repaired.match(/\{/g) || []).length;
      const closeBraces = (repaired.match(/\}/g) || []).length;

      // Добавляем недостающие закрывающие скобки
      for (let i = 0; i < openBraces - closeBraces; i++) {
        repaired += "}";
      }

      // Закрываем JSON объект
      if (!repaired.trim().endsWith("}")) {
        repaired += "}";
      }
    }

    console.log("Repaired string:", repaired.substring(0, 200) + "...");

    try {
      // Пробуем распарсить восстановленную строку
      return JSON.parse(repaired);
    } catch (secondError) {
      console.log("Second parse failed, trying alternative approach...");

      // Альтернативный подход: находим и парсим только вкладки
      // Ищем начало и конец массива tabs
      const tabsStartIndex = repaired.indexOf('"tabs":[');
      if (tabsStartIndex !== -1) {
        // Начинаем с начала tabs массива
        let tabsSubstring = repaired.substring(tabsStartIndex);

        // Находим конец массива tabs
        let bracketCount = 0;
        let inQuotes = false;
        let escapeNext = false;
        let tabsEndIndex = -1;

        for (let i = 0; i < tabsSubstring.length; i++) {
          const char = tabsSubstring[i];

          if (escapeNext) {
            escapeNext = false;
            continue;
          }

          if (char === "\\") {
            escapeNext = true;
            continue;
          }

          if (char === '"' && !escapeNext) {
            inQuotes = !inQuotes;
            continue;
          }

          if (!inQuotes) {
            if (char === "[") {
              bracketCount++;
            } else if (char === "]") {
              bracketCount--;
              if (bracketCount === 0) {
                tabsEndIndex = i + 1;
                break;
              }
            }
          }
        }

        if (tabsEndIndex !== -1) {
          // Извлекаем полный JSON для tabs
          const tabsJson = tabsSubstring.substring(0, tabsEndIndex);

          try {
            // Парсим только tabs часть
            const tabsData = JSON.parse(`{${tabsJson}}`);
            return {
              version: 1,
              tabs: tabsData.tabs || [],
              activeTab: null,
            };
          } catch (tabsParseError) {
            console.log("Failed to parse tabs:", tabsParseError);
          }
        }
      }

      // Последняя попытка: простой regex для извлечения вкладок
      try {
        // Ищем все объекты вкладок с помощью регулярного выражения
        const tabRegex =
          /\{"id":"([^"]+)","name":"([^"]+)","widgets":\[(.*?)\]}/g;
        const tabs = [];
        let tabMatch;

        while ((tabMatch = tabRegex.exec(dataString)) !== null) {
          try {
            // Собираем JSON для вкладки
            const tabJson = `{"id":"${tabMatch[1]}","name":"${tabMatch[2]}","widgets":[${tabMatch[3]}]}`;
            const tab = JSON.parse(tabJson);
            tabs.push(tab);
          } catch (tabError) {
            console.log("Skipping malformed tab:", tabError);
          }
        }

        if (tabs.length > 0) {
          return {
            version: 1,
            tabs: tabs,
            activeTab: null,
          };
        }
      } catch (finalError) {
        console.log("Final extraction failed:", finalError);
      }

      // Если ничего не помогло, возвращаем пустую структуру
      return { version: 1, tabs: [], activeTab: null };
    }
  }
};

export const DashboardViewer = ({
  dashboardData,
  title,
  onEdit,
  onDashboardDeleted,
  dashboardId,
  dashboardInfo,
  onDashboardSelected,
}) => {
  const COLS = 10;
  const ROWS = 6;
  const FIXED_CELL_WIDTH = 136;
  const FIXED_CELL_HEIGHT = 136;
  const COLUMN_GAP = 20;
  const ROW_GAP = 23;

  const navigate = useNavigate();
  const [parsedData, setParsedData] = useState({
    version: 1,
    tabs: [],
    activeTab: null,
  });
  const [activeTabId, setActiveTabId] = useState(null);
  const [hasError, setHasError] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState(null);
  const [widgetsData, setWidgetsData] = useState({});
  const widgetsDataRef = useRef({});
  const widgetMappingRef = useRef({});
  const [wsStatus, setWsStatus] = useState("Не подключено");
  const currentDashboardIdRef = useRef(null);
  const isConnectingRef = useRef(false);
  const cleanupRef = useRef(null);
  const wsListenerRef = useRef(null);
  const [localDashboardInfo, setLocalDashboardInfo] = useState(dashboardInfo);
  const [isWidgetModalOpen, setIsWidgetModalOpen] = useState(false);
  const [currentEventData, setCurrentEventData] = useState(null);

  useEffect(() => {
    setLocalDashboardInfo(dashboardInfo);
  }, [dashboardInfo]);

  // Функция для обновления данных дашборда
  const updateDashboardInfo = useCallback(async () => {
    if (!dashboardId) return;

    console.log("Обновление данных дашборда:", dashboardId);

    try {
      // Получаем обновленный список дашбордов
      const dashboards = await dashboardService.getUserDashboards();
      const updatedDashboard = dashboards.find(
        (d) => d.dashboard_id === dashboardId
      );

      if (updatedDashboard) {
        console.log("Данные дашборда обновлены:", {
          id: updatedDashboard.dashboard_id,
          videoCount: updatedDashboard.video_id?.length || 0,
        });

        // Уведомляем родительский компонент об обновленном дашборде
        if (onDashboardSelected) {
          onDashboardSelected(updatedDashboard);
        }

        return updatedDashboard;
      }

      console.warn("Дашборд не найден в списке:", dashboardId);
      return null;
    } catch (error) {
      console.error("Ошибка при обновлении данных дашборда:", error);
      return null;
    }
  }, [dashboardId, onDashboardSelected]);

  const handleVideoUploadSuccess = useCallback(async () => {
    console.log("Видео успешно подключено, обновляем данные дашборда...");

    // Обновляем данные дашборда
    await updateDashboardInfo();
  }, [updateDashboardInfo]);

  // Получаем текущую активную вкладку
  const currentTab = useMemo(() => {
    if (!parsedData?.tabs || parsedData.tabs.length === 0) {
      return null;
    }

    let tab = null;
    if (activeTabId) {
      tab = parsedData.tabs.find((tab) => tab.id === activeTabId);
    }
    if (!tab) {
      tab = parsedData.tabs[0];
    }

    if (!tab) return null;

    const updatedWidgets =
      tab.widgets?.map((widget) => ({
        ...widget,
        data: widgetsData[widget.i] || widget.data || {},
      })) || [];

    return {
      ...tab,
      widgets: updatedWidgets,
    };
  }, [parsedData, activeTabId, widgetsData]);

  const handleEditClick = useCallback(() => {
    if (onEdit) {
      onEdit(); // Вызываем callback если передан
    } else {
      // Или переходим по умолчанию
      navigate(`/edit_dashboard/${dashboardId}`);
    }
  }, [navigate, dashboardId, onEdit]);

  const handleOpenWidgetModal = (eventData) => {
    console.log(
      "DashboardViewer: открытие модального окна с данными события:",
      {
        eventData,
        hasImageId: !!eventData?.image_id,
        imageId: eventData?.image_id,
      }
    );

    const safeEventData = eventData || {
      event: "unknown",
      timestamp: new Date().toISOString(),
    };

    setCurrentEventData(safeEventData);
    setIsWidgetModalOpen(true);
  };

  const handleCloseWidgetModal = () => {
    setIsWidgetModalOpen(false);
    setCurrentEventData(null);
  };

  // Функция удаления дашборда
  const deleteDashboard = useCallback(async () => {
    if (!dashboardId) {
      console.error("Не указан ID дашборда для удаления");
      setDeleteError("ID дашборда не указан");
      return;
    }

    setIsDeleting(true);
    setDeleteError(null);

    try {
      await dashboardService.deleteDashboard(dashboardId);

      // Закрываем модальное окно подтверждения
      setIsDeleteConfirmOpen(false);

      console.log("Дашборд успешно удален");

      // Вызываем callback, если он передан
      if (onDashboardDeleted) {
        onDashboardDeleted(dashboardId);
      }

      navigate("/dashboards");
    } catch (error) {
      console.error("Ошибка при удалении дашборда:", error);

      setDeleteError(
        error.message || "Не удалось удалить дашборд. Попробуйте позже."
      );
    } finally {
      setIsDeleting(false);
    }
  }, [dashboardId, navigate, onDashboardDeleted]);

  // Функция для открытия модального окна подтверждения удаления
  const handleDeleteClick = useCallback(() => {
    setIsDeleteConfirmOpen(true);
  }, []);

  // Функция для закрытия модального окна подтверждения удаления
  const handleCloseDeleteConfirm = useCallback(() => {
    setIsDeleteConfirmOpen(false);
    setDeleteError(null);
  }, []);

  // Проверяем условия для подключения WebSocket
  const shouldConnectWebSocket = useMemo(() => {
    if (!dashboardId || !dashboardInfo) {
      return false;
    }

    const connectedVideos = dashboardInfo.video_id || [];
    const hasWidgets = currentTab?.widgets?.length > 0;

    const shouldConnect = connectedVideos.length > 0 && hasWidgets;

    console.log("Проверка условий для WebSocket:", {
      dashboardId,
      connectedVideosCount: connectedVideos.length,
      hasWidgets,
      shouldConnect,
      widgetCount: currentTab?.widgets?.length || 0,
    });

    return shouldConnect;
  }, [dashboardId, dashboardInfo, currentTab]);

  // Функция для обработки данных WebSocket
  const handleWebSocketData = useCallback((data) => {
    if (!currentDashboardIdRef.current) return;

    console.log("WebSocket data received:", data);

    if (
      data.event_type === "widget_update" &&
      data.dashboard_id === currentDashboardIdRef.current
    ) {
      if (data.widget_data) {
        console.log("Обновление данных виджетов:", data.widget_data);

        const transformedData = {};
        const currentMapping = widgetMappingRef.current;
        const imageIdsToPreload = [];

        Object.keys(data.widget_data).forEach((serverWidgetId) => {
          const clientWidgetId = currentMapping[serverWidgetId];
          const widgetData = data.widget_data[serverWidgetId];

          if (clientWidgetId) {
            transformedData[clientWidgetId] = widgetData;

            // Предзагружаем изображение, если оно есть
            if (widgetData.image_id) {
              imageIdsToPreload.push(widgetData.image_id);
            }
          }
        });

        // Предзагружаем изображения в фоне
        if (imageIdsToPreload.length > 0) {
          console.log("Предзагрузка изображений:", imageIdsToPreload);
          imageIdsToPreload.forEach((imageId) => {
            eventService.getEventImage(imageId).catch((err) => {
              console.log(
                `Не удалось предзагрузить изображение ${imageId}:`,
                err.message
              );
            });
          });
        }

        if (Object.keys(transformedData).length > 0) {
          console.log("Итоговые преобразованные данные:", transformedData);
          setWidgetsData((prev) => ({
            ...prev,
            ...transformedData,
          }));
        }
      }
    }
  }, []);

  // Загружаем маппинг виджетов
  useEffect(() => {
    let isMounted = true;

    const loadMapping = async () => {
      try {
        // Загружаем маппинг только один раз
        await widgetMappingService.loadMapping();

        if (isMounted) {
          console.log("Маппинг виджетов успешно загружен");
        }
      } catch (error) {
        console.error("Ошибка при загрузке маппинга виджетов:", error);
      }
    };

    loadMapping();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (currentTab?.widgets && widgetMappingService.isLoaded) {
      console.log("Создание маппинга для виджетов:", {
        widgets: currentTab.widgets.map((w) => ({ i: w.i, type: w.type })),
        mappingServiceLoaded: widgetMappingService.isLoaded,
      });

      const newMapping = widgetMappingService.convertWidgetsForWebSocket(
        currentTab.widgets
      );

      widgetMappingRef.current = newMapping;
      console.log("Маппинг обновлен в ref:", widgetMappingRef.current);
    }
  }, [currentTab, widgetMappingService.isLoaded]);

  // Управление WebSocket соединением - ТОЛЬКО при изменении условий подключения
  useEffect(() => {
    const userId = getUserId();

    // Если ничего не изменилось, не делаем ничего
    if (
      dashboardId === currentDashboardIdRef.current &&
      isConnectingRef.current === shouldConnectWebSocket
    ) {
      return;
    }

    console.log("WebSocket эффект сработал:", {
      dashboardId,
      previousDashboardId: currentDashboardIdRef.current,
      shouldConnect: shouldConnectWebSocket,
      previousConnectionState: isConnectingRef.current,
    });

    // Очищаем предыдущее соединение
    if (cleanupRef.current) {
      console.log(
        "Очистка предыдущего WebSocket соединения для дашборда:",
        currentDashboardIdRef.current
      );
      cleanupRef.current();
      cleanupRef.current = null;
    }

    currentDashboardIdRef.current = dashboardId;
    isConnectingRef.current = shouldConnectWebSocket;

    if (userId && dashboardId && shouldConnectWebSocket) {
      console.log("Подключение WebSocket для дашборда:", {
        dashboardId,
        userId,
      });

      // Проверяем, не подключены ли мы уже к этому дашборду
      const currentStatus = webSocketService.getStatus();
      if (
        currentStatus.currentDashboardId === dashboardId &&
        currentStatus.isActive
      ) {
        console.log("WebSocket уже подключен к этому дашборду");
        setWsStatus("Подключено");

        // Но все равно добавляем слушатель
        webSocketService.addListener(dashboardId, handleWebSocketData);
        wsListenerRef.current = handleWebSocketData;

        // Проверяем статус соединения
        const checkConnectionStatus = () => {
          const status = webSocketService.getStatus();
          if (status.currentDashboardId === dashboardId) {
            setWsStatus(status.isActive ? "Подключено" : "Отключено");
          }
        };

        const statusInterval = setInterval(checkConnectionStatus, 5000);

        // Функция очистки
        cleanupRef.current = () => {
          console.log("Очистка WebSocket для дашборда:", dashboardId);
          clearInterval(statusInterval);
          webSocketService.removeListener(dashboardId, wsListenerRef.current);
        };

        return cleanupRef.current;
      }

      // Добавляем слушатель для этого дашборда
      webSocketService.addListener(dashboardId, handleWebSocketData);
      wsListenerRef.current = handleWebSocketData;

      // Подключаем WebSocket для этого дашборда
      webSocketService.connectForDashboard(userId, dashboardId);

      // Проверяем статус соединения
      const checkConnectionStatus = () => {
        const status = webSocketService.getStatus();
        console.log("Статус WebSocket:", status);

        if (status.currentDashboardId === dashboardId) {
          setWsStatus(status.isActive ? "Подключено" : "Отключено");
        }
      };

      // Первоначальная проверка
      checkConnectionStatus();

      // Периодическая проверка статуса
      const statusInterval = setInterval(checkConnectionStatus, 5000);

      // Функция очистки
      const cleanup = () => {
        console.log("Очистка WebSocket для дашборда:", dashboardId);
        clearInterval(statusInterval);
        webSocketService.removeListener(dashboardId, wsListenerRef.current);

        // Отключаем соединение только если это текущий дашборд
        const currentStatus = webSocketService.getStatus();
        if (currentStatus.currentDashboardId === dashboardId) {
          console.log("Отключаем WebSocket для дашборда:", dashboardId);
          webSocketService.disconnect();
        }
      };

      cleanupRef.current = cleanup;

      // Возвращаем функцию очистки
      return cleanup;
    } else if (!shouldConnectWebSocket) {
      console.log("⏸WebSocket не подключен: условия не выполнены", {
        dashboardId,
        hasVideo: dashboardInfo?.video_id?.length > 0,
        hasWidgets: currentTab?.widgets?.length > 0,
      });
      setWsStatus("Не подключено");
    }

    return () => {}; // Пустая функция очистки
  }, [dashboardId, shouldConnectWebSocket, dashboardInfo]);

  // Отдельный эффект для обновления слушателя при изменении маппинга
  useEffect(() => {
    if (!dashboardId) return;

    console.log("Обновление WebSocket слушателя для dashboardId:", dashboardId);

    const newHandler = (data) => {
      if (
        data.event_type === "widget_update" &&
        data.dashboard_id === dashboardId
      ) {
        if (data.widget_data) {
          console.log("Обновление данных виджетов:", data.widget_data);

          const transformedData = {};
          const currentMapping = widgetMappingRef.current; // Используем ref

          Object.keys(data.widget_data).forEach((serverWidgetId) => {
            const clientWidgetId = currentMapping[serverWidgetId];
            const widgetData = data.widget_data[serverWidgetId];

            if (clientWidgetId) {
              transformedData[clientWidgetId] = widgetData;
            }
          });

          if (Object.keys(transformedData).length > 0) {
            console.log("Преобразованные данные:", transformedData);
            setWidgetsData((prev) => ({
              ...prev,
              ...transformedData,
            }));
          }
        }
      }
    };

    // Удаляем старый слушатель и добавляем новый
    if (wsListenerRef.current) {
      webSocketService.removeListener(dashboardId, wsListenerRef.current);
    }

    webSocketService.addListener(dashboardId, newHandler);
    wsListenerRef.current = newHandler;

    return () => {
      if (wsListenerRef.current) {
        webSocketService.removeListener(dashboardId, wsListenerRef.current);
      }
    };
  }, [dashboardId]);

  // Очистка при размонтировании компонента
  useEffect(() => {
    return () => {
      console.log("Компонент DashboardViewer размонтируется");
      if (cleanupRef.current) {
        cleanupRef.current();
        cleanupRef.current = null;
      }
      currentDashboardIdRef.current = null;
      isConnectingRef.current = false;
      wsListenerRef.current = null;
    };
  }, []);

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  // Обновляем ref при изменении widgetsData
  useEffect(() => {
    widgetsDataRef.current = widgetsData;
  }, [widgetsData]);

  // Функция для получения ID пользователя
  const getUserId = () => {
    const token = localStorage.getItem("access_token");
    if (token) {
      try {
        const payload = token.split(".")[1];
        const decoded = JSON.parse(atob(payload));
        return decoded.user?.id || null;
      } catch (error) {
        console.error("Error decoding token:", error);
        return null;
      }
    }
    return null;
  };

  // Парсинг данных дашборда
  useEffect(() => {
    if (!dashboardData) {
      setParsedData({ version: 1, tabs: [], activeTab: null });
      setActiveTabId(null);
      setHasError(false);
      return;
    }

    console.log("Dashboard data received, type:", typeof dashboardData);

    try {
      const data =
        typeof dashboardData === "string"
          ? parseDashboardData(dashboardData)
          : dashboardData;

      console.log("Successfully parsed dashboard data:", {
        tabsCount: data.tabs?.length || 0,
        hasTabs: !!data.tabs,
        tabs: data.tabs,
      });

      const firstTabId =
        data.tabs && data.tabs.length > 0 ? data.tabs[0].id : null;

      setParsedData({
        ...data,
        activeTab: firstTabId,
      });
      setActiveTabId(firstTabId);
      setHasError(false);
    } catch (error) {
      console.error("Error parsing dashboard data:", error);
      setParsedData({ version: 1, tabs: [], activeTab: null });
      setActiveTabId(null);
      setHasError(true);
    }
  }, [dashboardData]);

  // Обработчик изменения вкладки
  const handleTabChange = (tabId) => {
    console.log("Changing tab to:", tabId);
    setActiveTabId(tabId);
  };

  const getLayouts = useCallback(
    (widgets) => ({
      lg: widgets,
      md: widgets,
      sm: widgets,
      xs: widgets,
      xxs: widgets,
    }),
    []
  );

  const hasTabs = parsedData.tabs && parsedData.tabs.length > 0;

  // Проверяем, активна ли кнопка подключения видео
  const isConnectVideoButtonEnabled = useMemo(() => {
    if (!dashboardInfo) return true;

    const hasConnectedVideos = dashboardInfo.video_id?.length > 0;
    return !hasConnectedVideos;
  }, [dashboardInfo]);

  console.log("Рендерим DashboardViewer:", {
    dashboardId,
    currentTab: currentTab?.id,
    widgetsCount: currentTab?.widgets?.length || 0,
    shouldConnectWebSocket,
    isConnectVideoButtonEnabled,
    videoCount: dashboardInfo?.video_id?.length || 0,
  });

  return (
    <div className={styles.mainArea}>
      <div className={styles.header}>
        <div className={styles.dashboardInfo}>
          <h2>{title || "Дашборд"}</h2>
        </div>
        {isConnectVideoButtonEnabled ? (
          <div className={styles.buttonsContainer}>
            <SmallButton
              icon={EditIcon}
              onClick={handleEditClick}
              disabled={isModalOpen}
              title="Редактировать дашборд"
            />
            <PrimaryButton
              text="Подключить видео"
              icon={ConnectVideo}
              onClick={handleOpenModal}
              disabled={!isConnectVideoButtonEnabled || isModalOpen}
              title={!isConnectVideoButtonEnabled ? "Видео уже подключено" : ""}
            />
          </div>
        ) : (
          <div className={`${styles.buttonsContainer} ${styles.small}`}>
            <SmallButton
              icon={VideoIcon}
              disabled={isModalOpen || isDeleteConfirmOpen}
            />
            <SmallButton
              icon={DownloadIcon}
              disabled={isModalOpen || isDeleteConfirmOpen}
            />
            <SmallButton
              icon={FullScreenIcon}
              disabled={isModalOpen || isDeleteConfirmOpen}
            />
            <SmallButton
              icon={SmallMenuIcon}
              onClick={handleDeleteClick}
              disabled={isModalOpen || isDeleteConfirmOpen}
              title="Удалить дашборд"
            />
          </div>
        )}
      </div>

      {hasTabs && (
        <Tabs
          activeTab={activeTabId}
          tabs={parsedData.tabs.map((tab) => ({
            id: tab.id,
            name: tab.name || "Без названия",
            widgets: tab.widgets || [],
          }))}
          onTabChange={handleTabChange}
          isStatic={true}
        />
      )}
      {hasTabs && (
        <div className={styles.dashboard}>
          <div className={styles.dashboardContainer}>
            <div className={styles.layout}>
              {/* Сетка для визуализации */}
              <div
                className={styles.gridContainer}
                style={{
                  width: `1540px`,
                  height: `931px`,
                  display: "grid",
                  gridTemplateColumns: `repeat(${COLS}, ${FIXED_CELL_WIDTH}px)`,
                  gridTemplateRows: `repeat(${ROWS}, ${FIXED_CELL_HEIGHT}px)`,
                  rowGap: `${ROW_GAP}px`,
                  columnGap: `${COLUMN_GAP}px`,
                }}
              >
                {Array.from({ length: COLS * ROWS }).map((_, index) => (
                  <div
                    key={`cell-${index}`}
                    className={styles.gridCell}
                    style={{
                      width: FIXED_CELL_WIDTH,
                      height: FIXED_CELL_HEIGHT,
                    }}
                  />
                ))}
              </div>

              {/* React Grid Layout для виджетов */}
              <div
                className={styles.gridLayoutContainer}
                style={{
                  width: `1540px`,
                  height: `931px`,
                }}
              >
                <ResponsiveGridLayout
                  layouts={getLayouts(currentTab.widgets)}
                  breakpoints={{ lg: 1200 }}
                  cols={{ lg: COLS }}
                  rowHeight={FIXED_CELL_HEIGHT}
                  margin={[COLUMN_GAP, ROW_GAP]}
                  containerPadding={[0, 0]}
                  isDraggable={false}
                  isResizable={false}
                  compactType={null}
                  autoSize={false}
                  isBounded={true}
                  useCSSTransforms={false}
                  transformScale={1}
                >
                  {currentTab.widgets.map((widget) => {
                    const widgetRealTimeData = widgetsData[widget.i] || {};

                    // Проверяем тип виджета, если это DangerWidget
                    const isDangerWidget =
                      widget.type === "danger" ||
                      widget.widgetType === "danger";

                    return (
                      <div key={widget.i} data-grid={widget}>
                        <Widget
                          widget={widget}
                          onRemove={null}
                          isStatic={true}
                          realTimeData={widgetRealTimeData}
                          onViewDetails={
                            isDangerWidget ? handleOpenWidgetModal : undefined
                          }
                        />
                      </div>
                    );
                  })}
                </ResponsiveGridLayout>
              </div>
            </div>
          </div>
        </div>
      )}
      <UploadVideoModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        fromDashboard={true}
        dashboardId={dashboardId}
        onSuccess={handleVideoUploadSuccess}
      />
      <WidgetModal
        isOpen={isWidgetModalOpen}
        onClose={handleCloseWidgetModal}
        eventData={currentEventData}
      />
      <ConfirmModal
        isOpen={isDeleteConfirmOpen}
        onClose={handleCloseDeleteConfirm}
        onConfirm={deleteDashboard}
        title="Удаление дашборда"
        message={`Вы уверены, что хотите удалить дашборд "${
          title || "Без названия"
        }"? Это действие нельзя отменить.`}
        confirmText={isDeleting ? "Удаление..." : "Удалить"}
        cancelText="Отмена"
        isConfirmDisabled={isDeleting}
        isCancelDisabled={isDeleting}
        error={deleteError}
        type="danger"
      />
    </div>
  );
};
