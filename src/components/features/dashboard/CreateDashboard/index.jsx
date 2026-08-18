import React, {
  useRef,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import { Responsive, WidthProvider } from "react-grid-layout";
import { useNavigate, useParams } from "react-router-dom";
import { useDrop } from "react-dnd";
import styles from "./CreateDashboard.module.scss";
import { Tabs } from "@dashboard/Tabs";
import { Widget } from "@dashboard/Widget";
import { useDashboardState } from "@hooks/useDashboardState";
import { useTabOperations } from "@hooks/useTabOperations";
import { useWidgetOperations } from "@hooks/useWidgetOperations";
import { useDashboardSync } from "@hooks/useDashboardSync";
import { PrimaryButton } from "@ui/buttons/PrimaryButton";
import { SecondaryButton } from "@ui/buttons/SecondaryButton";
import { UploadVideoModal } from "@ui/shared/UploadVideoModal";
import { dashboardService } from "@services/dashboardService";
import { videoService } from "@services/videoService";
import { webSocketService } from "@services/websocketService";
import { widgetMappingService } from "@services/widgetMappingService";
import {
  getDefaultWidgetSize,
  getAvailableSizes,
  getWidgetConstraints,
} from "@utils/widgets-config";
import ConnectVideo from "@icons/camera.svg?react";
import SaveDash from "@icons/create.svg?react";

const ResponsiveGridLayout = WidthProvider(Responsive);

// Функция парсинга из DashboardViewer
const parseDashboardData = (dataString) => {
  if (!dataString || typeof dataString !== "string") {
    return { version: 1, tabs: [], activeTab: null };
  }

  try {
    return JSON.parse(dataString);
  } catch (error) {
    console.log("Initial parse failed, attempting repair...");
    let repaired = dataString;

    const activeTabRegex = /"activeTab":"([^"]*?)(?="|,|$)/g;
    let match;
    while ((match = activeTabRegex.exec(repaired)) !== null) {
      const start = match.index;
      const end = start + match[0].length;
      const value = match[1];

      if (repaired[end] !== '"') {
        repaired = repaired.substring(0, end) + '"' + repaired.substring(end);
      }
    }

    if (!repaired.trim().endsWith("}")) {
      const openBraces = (repaired.match(/\{/g) || []).length;
      const closeBraces = (repaired.match(/\}/g) || []).length;

      for (let i = 0; i < openBraces - closeBraces; i++) {
        repaired += "}";
      }

      if (!repaired.trim().endsWith("}")) {
        repaired += "}";
      }
    }

    try {
      return JSON.parse(repaired);
    } catch (secondError) {
      console.log("Second parse failed, trying alternative approach...");

      const tabsStartIndex = repaired.indexOf('"tabs":[');
      if (tabsStartIndex !== -1) {
        let tabsSubstring = repaired.substring(tabsStartIndex);
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
          const tabsJson = tabsSubstring.substring(0, tabsEndIndex);
          try {
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

      try {
        const tabRegex =
          /\{"id":"([^"]+)","name":"([^"]+)","widgets":\[(.*?)\]}/g;
        const tabs = [];
        let tabMatch;

        while ((tabMatch = tabRegex.exec(dataString)) !== null) {
          try {
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

      return { version: 1, tabs: [], activeTab: null };
    }
  }
};

export const CreateDashboard = ({
  isFullscreen = false,
  editMode = false,
  dashboardId = null,
  fromVideo = false,
  videoId = null,
  videoName = "",
  onSave = null,
  isLoading = false,
}) => {
  const COLS = 10;
  const ROWS = 6;
  const MIN_CELL_SIZE = 10;
  const GAP_RATIO = 0.14;
  const MAX_TABS = 5;

  const layoutRef = useRef(null);
  const titleInputRef = useRef(null);
  const navigate = useNavigate();

  // Получаем dashboardId из URL параметров, если не передан через props
  const params = useParams();
  const dashboardIdFromParams = params.dashboardId;
  const finalDashboardId = dashboardId || dashboardIdFromParams;

  const {
    tabs,
    setTabs,
    activeTab,
    setActiveTab,
    nextTabNumber,
    setNextTabNumber,
  } = useDashboardState();

  const [cellSize, setCellSize] = useState({
    width: MIN_CELL_SIZE,
    height: MIN_CELL_SIZE,
  });
  const [gap, setGap] = useState(8);
  const [rowHeight, setRowHeight] = useState(MIN_CELL_SIZE);
  const [maxRows, setMaxRows] = useState(ROWS);
  const [lastUpdate, setLastUpdate] = useState(0);
  const [isInitialized, setIsInitialized] = useState(false);
  const [lastSavedState, setLastSavedState] = useState("");
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [dashboardTitle, setDashboardTitle] = useState("Дашборд FK39221P");
  const [dropPreview, setDropPreview] = useState(null);
  const [isHeaderCollapsed, setIsHeaderCollapsed] = useState(false);
  const titleMeasureRef = useRef(null);
  const [inputWidth, setInputWidth] = useState(400);
  const initialDashboardTitle = useRef(dashboardTitle);
  const [resizePreview, setResizePreview] = useState(null);
  const [dragPreview, setDragPreview] = useState(null);
  const [activeDrag, setActiveDrag] = useState(null);
  const [activeResize, setActiveResize] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [currentDashboardId, setCurrentDashboardId] = useState(null);
  const [widgetsMap, setWidgetsMap] = useState({});
  const [isLoadingWidgets, setIsLoadingWidgets] = useState(false);
  const [dashboardInfo, setDashboardInfo] = useState(null);
  const [isLoadingDashboard, setIsLoadingDashboard] = useState(editMode);
  const [connectedVideos, setConnectedVideos] = useState([]);
  const [videoInfo, setVideoInfo] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSavingBeforeConnect, setIsSavingBeforeConnect] = useState(false);
  const [tempDashboardId, setTempDashboardId] = useState(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [widgetsData, setWidgetsData] = useState({});
  const [wsStatus, setWsStatus] = useState("Не подключено");
  const currentDashboardIdRef = useRef(null);
  const isConnectingRef = useRef(false);
  const cleanupRef = useRef(null);
  const wsListenerRef = useRef(null);
  const [widgetMapping, setWidgetMapping] = useState({});

  const currentTab = tabs.find((tab) => tab.id === activeTab) || tabs[0];

  console.log("CreateDashboard render", {
    editMode,
    dashboardId: finalDashboardId,
    dashboardTitle,
    tabsCount: tabs.length,
    activeTab,
    currentTabId: currentTab?.id,
    widgetsCount: currentTab?.widgets?.length || 0,
  });

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

  // Функция для обработки данных WebSocket
  const handleWebSocketData = useCallback((data) => {
    if (!currentDashboardIdRef.current) return;

    if (
      data.event_type === "widget_update" &&
      data.dashboard_id === currentDashboardIdRef.current
    ) {
      if (data.widget_data) {
        console.log("Обновление данных виджетов:", data.widget_data);

        const transformedData = {};
        const currentMapping = widgetMapping; // используем текущий маппинг

        Object.keys(data.widget_data).forEach((serverWidgetId) => {
          const clientWidgetId = currentMapping[serverWidgetId];
          if (clientWidgetId) {
            transformedData[clientWidgetId] = data.widget_data[serverWidgetId];
          } else {
            transformedData[serverWidgetId] = data.widget_data[serverWidgetId];
          }
        });

        if (Object.keys(transformedData).length > 0) {
          setWidgetsData((prev) => ({
            ...prev,
            ...transformedData,
          }));
        }
      }
    }
  }, []);

  // Проверка условий для подключения WebSocket
  const shouldConnectWebSocket = useMemo(() => {
    if (!tempDashboardId && !finalDashboardId) return false;

    const currentDashboardId = tempDashboardId || finalDashboardId;
    const hasConnectedVideos =
      dashboardInfo?.video_id?.length > 0 || connectedVideos?.length > 0;
    const hasWidgets = currentTab?.widgets?.length > 0;

    const shouldConnect = hasConnectedVideos && hasWidgets;

    console.log("Проверка условий для WebSocket (Create):", {
      dashboardId: currentDashboardId,
      hasConnectedVideos,
      hasWidgets,
      shouldConnect,
      videoCount:
        dashboardInfo?.video_id?.length || connectedVideos?.length || 0,
      widgetCount: currentTab?.widgets?.length || 0,
    });

    return shouldConnect;
  }, [
    tempDashboardId,
    finalDashboardId,
    dashboardInfo,
    connectedVideos,
    currentTab,
  ]);

  // Эффект для управления WebSocket подключением
  useEffect(() => {
    const userId = getUserId();
    const currentDashboardId = tempDashboardId || finalDashboardId;

    if (
      currentDashboardId === currentDashboardIdRef.current &&
      isConnectingRef.current === shouldConnectWebSocket
    ) {
      return;
    }

    console.log("WebSocket эффект сработал (Create):", {
      dashboardId: currentDashboardId,
      previousDashboardId: currentDashboardIdRef.current,
      shouldConnect: shouldConnectWebSocket,
      previousConnectionState: isConnectingRef.current,
    });

    if (cleanupRef.current) {
      console.log(
        "Очистка предыдущего WebSocket соединения для дашборда:",
        currentDashboardIdRef.current,
      );
      cleanupRef.current();
      cleanupRef.current = null;
    }

    currentDashboardIdRef.current = currentDashboardId;
    isConnectingRef.current = shouldConnectWebSocket;

    if (userId && currentDashboardId && shouldConnectWebSocket) {
      console.log("Подключение WebSocket для дашборда (Create):", {
        dashboardId: currentDashboardId,
        userId,
      });

      webSocketService.addListener(currentDashboardId, handleWebSocketData);
      wsListenerRef.current = handleWebSocketData;

      webSocketService.connectForDashboard(userId, currentDashboardId);

      const checkConnectionStatus = () => {
        const status = webSocketService.getStatus();
        console.log("Статус WebSocket (Create):", status);

        if (status.currentDashboardId === currentDashboardId) {
          setWsStatus(status.isActive ? "Подключено" : "Отключено");
        }
      };

      checkConnectionStatus();

      const statusInterval = setInterval(checkConnectionStatus, 5000);

      const cleanup = () => {
        console.log(
          "Очистка WebSocket для дашборда (Create):",
          currentDashboardId,
        );
        clearInterval(statusInterval);
        webSocketService.removeListener(
          currentDashboardId,
          wsListenerRef.current,
        );

        const currentStatus = webSocketService.getStatus();
        if (currentStatus.currentDashboardId === currentDashboardId) {
          console.log(
            "Отключаем WebSocket для дашборда (Create):",
            currentDashboardId,
          );
          webSocketService.disconnect();
        }
      };

      cleanupRef.current = cleanup;

      return cleanup;
    } else if (!shouldConnectWebSocket) {
      console.log("⏸WebSocket не подключен (Create): условия не выполнены", {
        dashboardId: currentDashboardId,
        hasVideo:
          (dashboardInfo?.video_id?.length || connectedVideos?.length) > 0,
        hasWidgets: currentTab?.widgets?.length > 0,
      });
      setWsStatus("Не подключено");
    }

    return () => {};
  }, [tempDashboardId, finalDashboardId, shouldConnectWebSocket]);

  // Отдельный эффект для обновления слушателя при изменении маппинга
  useEffect(() => {
    const currentDashboardId = tempDashboardId || finalDashboardId;
    if (!currentDashboardId || !wsListenerRef.current) return;

    console.log(
      "Обновление WebSocket слушателя из-за изменения маппинга (Create)",
    );

    webSocketService.removeListener(currentDashboardId, wsListenerRef.current);

    const newHandler = (data) => {
      if (
        data.event_type === "widget_update" &&
        data.dashboard_id === currentDashboardId
      ) {
        if (data.widget_data) {
          console.log(
            "Обновление данных виджетов (новый маппинг, Create):",
            data.widget_data,
          );

          const transformedData = {};

          Object.keys(data.widget_data).forEach((serverWidgetId) => {
            const clientWidgetId = widgetMapping[serverWidgetId];
            if (clientWidgetId) {
              transformedData[clientWidgetId] =
                data.widget_data[serverWidgetId];
            } else {
              transformedData[serverWidgetId] =
                data.widget_data[serverWidgetId];
            }
          });

          if (Object.keys(transformedData).length > 0) {
            setWidgetsData((prev) => ({
              ...prev,
              ...transformedData,
            }));
          }
        }
      }
    };

    webSocketService.addListener(currentDashboardId, newHandler);
    wsListenerRef.current = newHandler;

    return () => {
      webSocketService.removeListener(currentDashboardId, newHandler);
    };
  }, [tempDashboardId, finalDashboardId, widgetMapping]);

  // Очистка при размонтировании компонента
  useEffect(() => {
    return () => {
      console.log("Компонент CreateDashboard размонтируется");
      if (cleanupRef.current) {
        cleanupRef.current();
        cleanupRef.current = null;
      }
      currentDashboardIdRef.current = null;
      isConnectingRef.current = false;
      wsListenerRef.current = null;
    };
  }, []);

  // Проверяем, нужно ли показывать кнопку подключения видео
  const shouldShowConnectVideoButton = useMemo(() => {
    const hasConnectedVideos = connectedVideos.length > 0;
    const hasDashboardId = !!(tempDashboardId || finalDashboardId);

    console.log("Проверка кнопки подключения видео:", {
      connectedVideos,
      hasConnectedVideos,
      tempDashboardId,
      finalDashboardId,
      hasDashboardId,
      show: !hasConnectedVideos && hasDashboardId,
    });

    return !hasConnectedVideos;
  }, [connectedVideos, tempDashboardId, finalDashboardId]);

  // Функция для обновления информации о дашборде после подключения видео
  const updateDashboardInfoAfterVideoConnect = useCallback(async () => {
    if (!tempDashboardId && !finalDashboardId) return;

    try {
      const currentDashboardId = tempDashboardId || finalDashboardId;
      const dashboards = await dashboardService.getUserDashboards();
      const dashboard = dashboards.find(
        (d) => d.dashboard_id === currentDashboardId,
      );

      if (dashboard) {
        setDashboardInfo(dashboard);
        setConnectedVideos(dashboard.video_id || []);
        console.log(
          "Информация о дашборде обновлена после подключения видео:",
          dashboard,
        );
      }
    } catch (error) {
      console.error("Ошибка обновления информации о дашборде:", error);
    }
  }, [tempDashboardId, finalDashboardId]);

  // Эффект для отслеживания изменений
  useEffect(() => {
    const currentState = JSON.stringify({ tabs, dashboardTitle });
    setHasUnsavedChanges(true);
  }, [tabs, dashboardTitle]);

  // Эффект для загрузки информации о видео при монтировании
  useEffect(() => {
    if (fromVideo && videoId) {
      setVideoInfo({
        id: videoId,
        name: videoName,
      });

      localStorage.setItem(
        "creatingDashboardForVideo",
        JSON.stringify({
          videoId,
          videoName,
          timestamp: Date.now(),
        }),
      );
    }

    return () => {
      localStorage.removeItem("creatingDashboardForVideo");
    };
  }, [fromVideo, videoId, videoName]);

  // Загружаем виджеты при монтировании
  useEffect(() => {
    const loadWidgets = async () => {
      try {
        setIsLoadingWidgets(true);
        const widgets = await dashboardService.getWidgets();

        const mapping = {};
        widgets.forEach((widget) => {
          mapping[widget.code] = widget.id;
        });

        setWidgetsMap(mapping);
        console.log("Загружены виджеты:", {
          count: widgets.length,
          mapping,
        });
      } catch (error) {
        console.error("Ошибка загрузки виджетов:", error);
      } finally {
        setIsLoadingWidgets(false);
      }
    };

    loadWidgets();
  }, []);

  // Загружаем данные дашборда для редактирования
  useEffect(() => {
    const loadDashboardData = async () => {
      if (!editMode || !finalDashboardId) return;

      try {
        setIsLoadingDashboard(true);
        console.log(
          "Загружаем данные дашборда для редактирования:",
          finalDashboardId,
        );

        const dashboards = await dashboardService.getUserDashboards();
        const dashboard = dashboards.find(
          (d) => d.dashboard_id === finalDashboardId,
        );

        if (dashboard) {
          setDashboardInfo(dashboard);
          setDashboardTitle(dashboard.name || "Дашборд");
          setConnectedVideos(dashboard.video_id || []);

          if (dashboard.data) {
            const parsedData = parseDashboardData(dashboard.data);
            console.log("Парсированные данные:", {
              tabsCount: parsedData.tabs?.length || 0,
              activeTabFromData: parsedData.activeTab,
              tabs: parsedData.tabs?.map((t) => ({
                id: t.id,
                name: t.name,
                widgetsCount: t.widgets?.length || 0,
              })),
            });

            if (parsedData && parsedData.tabs && parsedData.tabs.length > 0) {
              const transformedTabs = parsedData.tabs.map((tab) => ({
                id: tab.id,
                name: tab.name,
                widgets: tab.widgets || [],
              }));

              console.log(
                "Загруженные вкладки:",
                transformedTabs.map((t) => ({
                  id: t.id,
                  name: t.name,
                  widgetsCount: t.widgets.length,
                })),
              );

              const firstTabId = transformedTabs[0].id;
              console.log(
                "Игнорируем поврежденный activeTab из данных, используем первую вкладку:",
                firstTabId,
              );

              setTabs(transformedTabs);
              setActiveTab(firstTabId);
              setNextTabNumber(transformedTabs.length + 1);

              console.log("Активная вкладка установлена:", firstTabId);
            } else {
              console.warn("Нет вкладок в данных дашборда");
              const defaultTab = {
                id: "tab-1",
                name: "Вкладка 1",
                widgets: [],
              };
              setTabs([defaultTab]);
              setActiveTab(defaultTab.id);
              setNextTabNumber(2);
            }
          } else {
            console.warn("Нет данных дашборда");
            const defaultTab = {
              id: "tab-1",
              name: "Вкладка 1",
              widgets: [],
            };
            setTabs([defaultTab]);
            setActiveTab(defaultTab.id);
            setNextTabNumber(2);
          }
        } else {
          console.error("Дашборд не найден:", finalDashboardId);
          navigate("/dashboards");
        }
      } catch (error) {
        console.error("Ошибка загрузки дашборда:", error);
      } finally {
        setIsLoadingDashboard(false);
      }
    };

    if (editMode && finalDashboardId) {
      loadDashboardData();
    }
  }, [
    editMode,
    finalDashboardId,
    setTabs,
    setActiveTab,
    setNextTabNumber,
    navigate,
  ]);

  // Функция для подготовки данных дашборда
  const prepareDashboardData = useCallback(() => {
    const widgetCodes = [
      ...new Set(
        tabs.flatMap((tab) => tab.widgets.map((widget) => widget.type)),
      ),
    ];

    const widgetIds = widgetCodes
      .map((code) => widgetsMap[code])
      .filter((id) => id);

    console.log("Преобразование виджетов:", {
      codes: widgetCodes,
      ids: widgetIds,
      mapping: widgetsMap,
    });

    if (widgetIds.length !== widgetCodes.length) {
      const missingCodes = widgetCodes.filter((code) => !widgetsMap[code]);
      console.warn("Некоторые виджеты не найдены:", missingCodes);
    }

    const dashboardLayout = {
      version: 1,
      tabs: tabs.map((tab) => ({
        id: tab.id,
        name: tab.name,
        widgets: tab.widgets.map((widget) => {
          const widgetData = {
            i: widget.i,
            type: widget.type,
            x: widget.x,
            y: widget.y,
            w: widget.w,
            h: widget.h,
            minW: widget.minW,
            minH: widget.minH,
            maxW: widget.maxW,
            maxH: widget.maxH,
            static: widget.static || false,
          };

          if (widget.config && Object.keys(widget.config).length > 0) {
            widgetData.config = widget.config;
          }

          return widgetData;
        }),
      })),
      activeTab,
    };

    const dataString = JSON.stringify(dashboardLayout);

    if (editMode) {
      return {
        dashboard_id: finalDashboardId,
        name: dashboardTitle,
        data: dataString,
        widget_id: widgetIds,
        video_id: connectedVideos,
      };
    } else {
      const dashboardId = tempDashboardId || finalDashboardId;

      if (dashboardId) {
        return {
          dashboard_id: dashboardId,
          name: dashboardTitle,
          data: dataString,
          widget_id: widgetIds,
          video_id: connectedVideos,
        };
      } else {
        return {
          name: dashboardTitle,
          data: dataString,
          widgetIds: widgetIds,
        };
      }
    }
  }, [
    tabs,
    dashboardTitle,
    activeTab,
    widgetsMap,
    editMode,
    finalDashboardId,
    connectedVideos,
    tempDashboardId,
  ]);

  // Функция для поиска созданного дашборда
  const findCreatedDashboard = async (dashboardData) => {
    try {
      console.log("Поиск созданного дашборда:", {
        name: dashboardData.name,
        dataLength: dashboardData.data?.length,
      });

      const dashboards = await dashboardService.getUserDashboards();

      if (dashboards.length === 0) {
        console.warn("У пользователя нет дашбордов");
        return null;
      }

      for (const dashboard of dashboards) {
        if (dashboard.name === dashboardData.name) {
          if (dashboard.data) {
            try {
              const parsedData = JSON.parse(dashboard.data);
              const newData = JSON.parse(dashboardData.data);

              if (parsedData.tabs?.length === newData.tabs?.length) {
                console.log(
                  "Найден дашборд с совпадающими данными:",
                  dashboard.dashboard_id,
                );
                return dashboard.dashboard_id;
              }
            } catch (e) {}
          }
        }
      }

      const lastDashboard = dashboards[dashboards.length - 1];
      console.log(
        "Берем последний дашборд в списке:",
        lastDashboard.dashboard_id,
      );
      return lastDashboard.dashboard_id;
    } catch (error) {
      console.error("Ошибка при поиске дашборда:", error);
      return null;
    }
  };

  // Обработчик сохранения дашборда
  const handleSaveDashboard = useCallback(
    async (navigateAfterSave = true) => {
      try {
        setIsSaving(true);
        console.log("Начало сохранения дашборда", {
          editMode,
          fromVideo,
          tempDashboardId,
          connectedVideosCount: connectedVideos.length,
        });

        const dashboardData = prepareDashboardData();
        console.log("Данные для сохранения:", {
          name: dashboardData.name,
          widgetCount: dashboardData.widget_id?.length || 0,
          videoCount: dashboardData.video_id?.length || 0,
          hasDashboardId: !!dashboardData.dashboard_id,
        });

        let result;
        let savedDashboardId = null;

        const shouldUpdate = editMode || tempDashboardId;

        if (shouldUpdate) {
          console.log("Обновление дашборда:", {
            dashboard_id: dashboardData.dashboard_id,
            videoCount: dashboardData.video_id?.length,
          });

          result = await dashboardService.updateDashboard(dashboardData);
          console.log("Результат обновления дашборда:", result);
          savedDashboardId = dashboardData.dashboard_id;
          setTempDashboardId(savedDashboardId);
        } else {
          console.log("Создание нового дашборда...");
          result = await dashboardService.saveDashboard(dashboardData);
          console.log("Результат создания дашборда:", result);

          await new Promise((resolve) => setTimeout(resolve, 1000));
          const dashboards = await dashboardService.getUserDashboards();

          if (dashboards.length > 0) {
            const matchingDashboards = dashboards.filter(
              (d) => d.name === dashboardData.name,
            );

            if (matchingDashboards.length > 0) {
              const lastDashboard =
                matchingDashboards[matchingDashboards.length - 1];
              savedDashboardId = lastDashboard.dashboard_id;
            } else {
              const lastDashboard = dashboards[dashboards.length - 1];
              savedDashboardId = lastDashboard.dashboard_id;
            }
          }

          if (!savedDashboardId) {
            throw new Error("Не удалось получить ID созданного дашборда");
          }

          setTempDashboardId(savedDashboardId);
          console.log("Установлен tempDashboardId:", savedDashboardId);

          if (videoInfo?.id && savedDashboardId) {
            await attachDashboardToVideo(videoInfo.id, {
              dashboard_id: savedDashboardId,
            });
          }
        }

        setHasUnsavedChanges(false);

        if (navigateAfterSave) {
          if (fromVideo && videoInfo) {
            navigate(`/video/${videoInfo.id}/view`, {
              state: {
                dashboardCreated: true,
                newDashboardId: savedDashboardId || dashboardData.dashboard_id,
                dashboardName: dashboardData.name,
              },
            });
          } else {
            console.log("Переход на страницу дашбордов");
            navigate("/dashboards");
          }
        }

        return {
          dashboard_id: savedDashboardId || dashboardData.dashboard_id,
          ...result,
        };
      } catch (error) {
        console.error(
          `Ошибка при ${editMode ? "обновлении" : "создании"} дашборда:`,
          error,
        );
        throw error;
      } finally {
        setIsSaving(false);
      }
    },
    [
      prepareDashboardData,
      editMode,
      tempDashboardId,
      finalDashboardId,
      navigate,
      videoInfo,
      fromVideo,
      onSave,
      connectedVideos,
    ],
  );

  // Функция для сохранения и открытия модального окна
  const handleConnectVideoClick = async () => {
    console.log("Нажата кнопка подключения видео:", {
      editMode,
      finalDashboardId,
      tempDashboardId,
      hasUnsavedChanges,
    });

    try {
      setIsSavingBeforeConnect(true);

      console.log(
        "Режим редактирования, используем существующий ID:",
        finalDashboardId,
      );
      setTempDashboardId(finalDashboardId);
      setIsModalOpen(true);
      setIsSavingBeforeConnect(false);
    } catch (error) {
      console.error("Ошибка при сохранении дашборда:", error);
    } finally {
      setIsSavingBeforeConnect(false);
    }
  };

  // Функция для закрытия модального окна
  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  // Обработчик успешного подключения видео
  const handleVideoConnected = useCallback(
    async (videoId) => {
      console.log("Видео успешно подключено, ID:", videoId);

      try {
        setConnectedVideos((prev) => {
          const updated = [...prev, videoId];
          console.log("Обновленные подключенные видео:", updated);
          return updated;
        });

        await updateDashboardInfoAfterVideoConnect();
        setIsModalOpen(false);
        console.log("Видео подключено к дашборду");
      } catch (error) {
        console.error("Ошибка в handleVideoConnected:", error);
      }
    },
    [updateDashboardInfoAfterVideoConnect],
  );

  // Функция для привязки дашборда к видео
  const attachDashboardToVideo = async (videoId, dashboardResult) => {
    try {
      const dashboardId = dashboardResult.dashboard_id || dashboardResult.id;
      if (!dashboardId) {
        console.error("Не удалось получить ID созданного дашборда");
        return;
      }

      const videoData = await videoService.getVideo(videoId);
      const currentDashboards = videoData.dashboards || [];
      const updatedDashboards = [...currentDashboards, dashboardId];

      const zones = videoData.zones
        ? videoData.zones.map((zone) => ({
            name: zone.name,
            description: zone.description || "",
            color: zone.color,
            coords: zone.coords || [],
          }))
        : null;

      const masks = videoData.masks
        ? videoData.masks.map((mask) => ({
            name: mask.name,
            description: mask.description || "",
            color: mask.color,
            coords: mask.coords || [],
          }))
        : null;

      await videoService.setVideoData({
        videoId: videoId,
        name: videoData.name || "Без названия",
        description: videoData.description || "",
        dashboards: updatedDashboards,
        zones: zones,
        masks: masks,
      });

      console.log("Дашборд успешно привязан к видео:", {
        videoId,
        dashboardId,
        totalDashboards: updatedDashboards.length,
      });

      return true;
    } catch (error) {
      console.error("Ошибка при привязке дашборда к видео:", error);
      return false;
    }
  };

  useEffect(() => {
    if (titleMeasureRef.current) {
      const newWidth = titleMeasureRef.current.offsetWidth + 20;
      setInputWidth(newWidth);
    }
  }, [dashboardTitle]);

  useEffect(() => {
    setIsInitialized(true);
    setMaxRows(ROWS);
  }, []);

  useEffect(() => {
    if (isEditingTitle && titleInputRef.current) {
      titleInputRef.current.focus();
      titleInputRef.current.select();
    }
  }, [isEditingTitle]);

  const shouldShowAddButton = useCallback(() => {
    if (tabs.length >= MAX_TABS) {
      return false;
    }
    const lastTab = tabs[tabs.length - 1];
    if (!lastTab) {
      return false;
    }
    return lastTab.widgets && lastTab.widgets.length > 0;
  }, [tabs]);

  const showAddButton = shouldShowAddButton();

  // === РАСЧЁТ РАЗМЕРОВ СЕТКИ (исправлено: используем layoutRef) ===
  useEffect(() => {
    if (!layoutRef.current) return;

    const updateSizes = () => {
      const container = layoutRef.current;
      if (!container || !document.body.contains(container)) {
        console.warn("Layout element not found");
        return;
      }

      try {
        const containerRect = container.getBoundingClientRect();
        let availableWidth, availableHeight;

        if (isFullscreen) {
          // В полноэкранном режиме высота шапки в пикселях = 2.5vw, переводим в px относительно ширины окна
          const headerHeightPx = (2.5 * window.innerWidth) / 100;
          availableWidth = window.innerWidth;
          availableHeight = window.innerHeight - headerHeightPx;
        } else {
          availableWidth = containerRect.width;
          availableHeight = containerRect.height;
        }

        // Вычисляем адаптивный gap (один для обоих направлений)
        const avgCellSize = Math.min(
          availableWidth / COLS,
          availableHeight / ROWS,
        );
        const adaptiveGap = Math.max(
          4,
          Math.min(16, Math.floor(avgCellSize * GAP_RATIO)),
        );

        const cellWidth = (availableWidth - (COLS - 1) * adaptiveGap) / COLS;
        const cellHeight = (availableHeight - (ROWS - 1) * adaptiveGap) / ROWS;

        const finalCellWidth = Math.max(MIN_CELL_SIZE, Math.floor(cellWidth));
        const finalCellHeight = Math.max(MIN_CELL_SIZE, Math.floor(cellHeight));

        setCellSize({
          width: finalCellWidth,
          height: finalCellHeight,
        });
        setGap(adaptiveGap);
        setRowHeight(finalCellHeight + adaptiveGap);

        console.log("Grid calculated:", {
          cellWidth: finalCellWidth,
          cellHeight: finalCellHeight,
          gap: adaptiveGap,
          totalWidth: finalCellWidth * COLS + adaptiveGap * (COLS - 1),
          totalHeight: finalCellHeight * ROWS + adaptiveGap * (ROWS - 1),
        });
      } catch (error) {
        console.error("Error in updateSizes:", error);
      }
    };

    updateSizes();

    const resizeObserver = new ResizeObserver(() => {
      if (layoutRef.current && document.body.contains(layoutRef.current)) {
        updateSizes();
      }
    });

    let cleanupObserver = null;

    if (isFullscreen) {
      window.addEventListener("resize", updateSizes);
      if (document.body) {
        resizeObserver.observe(document.body);
        cleanupObserver = () => resizeObserver.unobserve(document.body);
      }
    } else {
      if (layoutRef.current) {
        resizeObserver.observe(layoutRef.current);
        cleanupObserver = () => {
          if (layoutRef.current) {
            resizeObserver.unobserve(layoutRef.current);
          }
        };
      }
    }

    return () => {
      if (cleanupObserver) {
        cleanupObserver();
      }
      resizeObserver.disconnect();
      if (isFullscreen) {
        window.removeEventListener("resize", updateSizes);
      }
    };
  }, [COLS, ROWS, MIN_CELL_SIZE, GAP_RATIO, isFullscreen]);

  // Операции с вкладками
  const { handleAddTab, handleTabChange, handleTabRename, handleTabRemove } =
    useTabOperations(
      tabs,
      activeTab,
      nextTabNumber,
      setTabs,
      setActiveTab,
      setNextTabNumber,
    );

  // Операции с виджетами
  const { addWidget, removeWidget, onLayoutChange } = useWidgetOperations(
    activeTab,
    maxRows,
    setTabs,
    COLS,
    ROWS,
  );

  // Функции синхронизации
  const updateDashboardState = useCallback(
    (newState) => {
      const newStateString = JSON.stringify({
        tabs: newState.tabs,
        activeTab: newState.activeTab,
        nextTabNumber: newState.nextTabNumber,
      });

      if (newStateString === lastSavedState) {
        console.log("Пропускаем обновление - данные идентичны");
        return;
      }

      console.log("Обновление состояния дашборда", newState);
      setTabs(newState.tabs);
      setActiveTab(newState.activeTab);
      setNextTabNumber(newState.nextTabNumber);
      setLastSavedState(newStateString);
    },
    [
      lastSavedState,
      setTabs,
      setActiveTab,
      setNextTabNumber,
      setLastSavedState,
    ],
  );

  const saveDashboardState = useCallback(
    (newData) => {
      if (!isInitialized) return;

      const state = {
        ...newData,
        timestamp: Date.now(),
        source: isFullscreen ? "fullscreen" : "main",
      };

      const stateString = JSON.stringify({
        tabs: state.tabs,
        activeTab: state.activeTab,
        nextTabNumber: state.nextTabNumber,
      });

      if (stateString !== lastSavedState) {
        console.log("Сохранение состояния:", state);
        localStorage.setItem("dashboardState", JSON.stringify(state));
        setLastUpdate(state.timestamp);
        setLastSavedState(stateString);
      }
    },
    [
      isFullscreen,
      isInitialized,
      lastSavedState,
      setLastUpdate,
      setLastSavedState,
    ],
  );

  const openDashboardFullscreen = useCallback(() => {
    const dashboardData = { tabs, activeTab, nextTabNumber };
    console.log("Открытие полного экрана с данными:", dashboardData);
    localStorage.setItem(
      "fullscreenDashboardData",
      JSON.stringify(dashboardData),
    );
    const randomParam = `t=${Date.now()}`;
    window.open(
      `${window.location.origin}/dashboard-fullscreen?${randomParam}`,
      "_blank",
    );
  }, [tabs, activeTab, nextTabNumber]);

  // Редактирование названия
  const handleTitleDoubleClick = () => {
    setIsEditingTitle(true);
    requestAnimationFrame(() => {
      if (titleMeasureRef.current) {
        const newWidth = titleMeasureRef.current.offsetWidth + 20;
        setInputWidth(newWidth);
      }
    });
  };

  const handleTitleSave = () => {
    if (!dashboardTitle.trim()) {
      setDashboardTitle(initialDashboardTitle.current);
    } else {
      initialDashboardTitle.current = dashboardTitle.trim();
    }
    setIsEditingTitle(false);
  };

  const handleTitleChange = (e) => {
    setDashboardTitle(e.target.value);
  };

  const handleTitleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleTitleSave();
    }
  };

  const handleTitleBlur = () => {
    handleTitleSave();
  };

  const toggleHeader = () => {
    setIsHeaderCollapsed(!isHeaderCollapsed);
  };

  // === DROP TARGET (используем layoutRef) ===
  const [{ isOver }, drop] = useDrop({
    accept: "widget",
    drop: (item, monitor) => {
      if (!layoutRef.current) return;

      const offset = monitor.getClientOffset();
      const rect = layoutRef.current.getBoundingClientRect();

      if (offset && rect) {
        const relativeX = offset.x - rect.left;
        const relativeY = offset.y - rect.top;

        const cellWidthWithGap = cellSize.width + gap;
        const cellHeightWithGap = cellSize.height + gap;

        const gridX = Math.floor(relativeX / cellWidthWithGap);
        const gridY = Math.floor(relativeY / cellHeightWithGap);

        const defaultSize = getDefaultWidgetSize(item.type);
        const boundedX = Math.max(0, Math.min(gridX, COLS - defaultSize.w));
        const boundedY = Math.max(0, Math.min(gridY, ROWS - defaultSize.h));

        addWidget(item.type, {
          x: boundedX,
          y: boundedY,
          w: defaultSize.w,
          h: defaultSize.h,
        });
        setDropPreview(null);
      }
    },
    hover: (item, monitor) => {
      if (!layoutRef.current) return;

      const offset = monitor.getClientOffset();
      const rect = layoutRef.current.getBoundingClientRect();

      if (offset && rect) {
        const relativeX = offset.x - rect.left;
        const relativeY = offset.y - rect.top;

        const cellWidthWithGap = cellSize.width + gap;
        const cellHeightWithGap = cellSize.height + gap;

        const gridX = Math.floor(relativeX / cellWidthWithGap);
        const gridY = Math.floor(relativeY / cellHeightWithGap);

        const defaultSize = getDefaultWidgetSize(item.type);
        const boundedX = Math.max(0, Math.min(gridX, COLS - defaultSize.w));
        const boundedY = Math.max(0, Math.min(gridY, ROWS - defaultSize.h));

        setDropPreview({
          x: boundedX,
          y: boundedY,
          w: defaultSize.w,
          h: defaultSize.h,
          type: item.type,
        });
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  });

  useDashboardSync({
    isFullscreen,
    isInitialized,
    lastUpdate,
    setLastUpdate,
    updateDashboardState,
    saveDashboardState,
    tabs,
    activeTab,
    nextTabNumber,
  });

  const getLayouts = useCallback(
    (widgets) => ({
      lg: widgets,
      md: widgets,
      sm: widgets,
      xs: widgets,
      xxs: widgets,
    }),
    [],
  );

  const gridWidth = cellSize.width * COLS + gap * (COLS - 1);
  const gridHeight = Math.floor(cellSize.height * ROWS + gap * (ROWS - 1));

  // === PREVIEW CELLS (используем динамические размеры) ===
  const getPreviewCells = () => {
    const preview = resizePreview || dragPreview || dropPreview;
    if (!preview) return null;

    const cells = [];
    const color = "#1776E026";

    for (let y = 0; y < preview.h; y++) {
      for (let x = 0; x < preview.w; x++) {
        const cellX = preview.x + x;
        const cellY = preview.y + y;
        if (cellX >= COLS || cellY >= ROWS) continue;

        cells.push(
          <div
            key={`${preview.type}-${cellX}-${cellY}-${Date.now()}`}
            style={{
              position: "absolute",
              left: cellX * (cellSize.width + gap),
              top: cellY * (cellSize.height + gap),
              width: cellSize.width,
              height: cellSize.height,
              backgroundColor: color,
              borderRadius: "0.4167vw",
              pointerEvents: "none",
              zIndex: 1000,
            }}
          />,
        );
      }
    }
    return cells;
  };

  // === ОБРАБОТЧИКИ DRAG/RESIZE ===
  const handleDragStart = useCallback(
    (widgetId, layoutItem) => {
      const widget = currentTab.widgets.find((w) => w.i === widgetId);
      if (widget) {
        setActiveDrag(widgetId);
        setDragPreview({
          x: layoutItem.x,
          y: layoutItem.y,
          w: layoutItem.w,
          h: layoutItem.h,
          type: widget.type,
        });
      }
    },
    [currentTab.widgets],
  );

  const handleDrag = useCallback(
    (layout, oldItem, newItem) => {
      const widget = currentTab.widgets.find((w) => w.i === newItem.i);
      if (widget) {
        setDragPreview({
          x: newItem.x,
          y: newItem.y,
          w: newItem.w,
          h: newItem.h,
          type: widget.type,
        });
      }
    },
    [currentTab.widgets],
  );

  const handleDragStop = useCallback(() => {
    setActiveDrag(null);
    setDragPreview(null);
  }, []);

  const handleResizeStart = useCallback(
    (widgetId, layoutItem) => {
      const widget = currentTab.widgets.find((w) => w.i === widgetId);
      if (widget) {
        setActiveResize(widgetId);
        setResizePreview({
          x: layoutItem.x,
          y: layoutItem.y,
          w: layoutItem.w,
          h: layoutItem.h,
          type: widget.type,
        });
      }
    },
    [currentTab.widgets],
  );

  const handleResize = useCallback(
    (layout, oldItem, newItem) => {
      const widget = currentTab.widgets.find((w) => w.i === newItem.i);
      if (widget) {
        const availableSizes = getAvailableSizes(widget.type);
        const closestSize = availableSizes.reduce((closest, size) => {
          const currentDiff =
            Math.abs(newItem.w - closest.w) + Math.abs(newItem.h - closest.h);
          const newDiff =
            Math.abs(newItem.w - size.w) + Math.abs(newItem.h - size.h);
          return newDiff < currentDiff ? size : closest;
        });

        setResizePreview({
          x: newItem.x,
          y: newItem.y,
          w: closestSize.w,
          h: closestSize.h,
          type: widget.type,
        });
      }
    },
    [currentTab.widgets],
  );

  const handleResizeStop = useCallback(
    (layout, oldItem, newItem) => {
      const widget = currentTab.widgets.find((w) => w.i === newItem.i);

      if (widget) {
        const availableSizes = getAvailableSizes(widget.type);
        const closestSize = availableSizes.reduce((closest, size) => {
          const currentDiff =
            Math.abs(newItem.w - closest.w) + Math.abs(newItem.h - closest.h);
          const newDiff =
            Math.abs(newItem.w - size.w) + Math.abs(newItem.h - size.h);
          return newDiff < currentDiff ? size : closest;
        });

        if (closestSize.w !== newItem.w || closestSize.h !== newItem.h) {
          const updatedWidgets = currentTab.widgets.map((w) =>
            w.i === newItem.i
              ? { ...w, w: closestSize.w, h: closestSize.h }
              : w,
          );
          onLayoutChange(updatedWidgets);
        }
      }

      setActiveResize(null);
      setResizePreview(null);
    },
    [currentTab.widgets, onLayoutChange],
  );

  const findClosestSize = (availableSizes, targetSize) => {
    const targetArea = targetSize.w * targetSize.h;
    return availableSizes.reduce((closest, size) => {
      const currentAreaDiff = Math.abs(closest.w * closest.h - targetArea);
      const newAreaDiff = Math.abs(size.w * size.h - targetArea);

      if (newAreaDiff < currentAreaDiff) {
        return size;
      }

      if (newAreaDiff === currentAreaDiff) {
        const currentSizeDiff =
          Math.abs(targetSize.w - closest.w) +
          Math.abs(targetSize.h - closest.h);
        const newSizeDiff =
          Math.abs(targetSize.w - size.w) + Math.abs(targetSize.h - size.h);
        return newSizeDiff < currentSizeDiff ? size : closest;
      }

      return closest;
    });
  };

  // === РЕНДЕР ===
  return (
    <div
    // className={isFullscreen ? styles.dashboardFullscreen : styles.dashboard}
    >
      <div
      // className={
      //   isFullscreen
      //     ? styles.dashboardContainerFullscreen
      //     : styles.dashboardContainer
      // }
      >
        <div className={styles.mainArea}>
          <div
            className={`${styles.header} ${
              isFullscreen ? styles.headerFullscreen : ""
            } ${isHeaderCollapsed ? styles.headerCollapsed : ""}`}
          >
            <div className={styles.dashboardInfo}>
              {isEditingTitle ? (
                <>
                  <span ref={titleMeasureRef} className={styles.titleMeasure}>
                    {dashboardTitle || " "}
                  </span>
                  <input
                    ref={titleInputRef}
                    type="text"
                    value={dashboardTitle}
                    onChange={handleTitleChange}
                    onKeyPress={handleTitleKeyPress}
                    onBlur={handleTitleBlur}
                    maxLength={60}
                    className={`${styles.titleInput} ${
                      dashboardTitle.length >= 60 ? styles.titleInputMax : ""
                    }`}
                    style={{ width: `${inputWidth}px` }}
                  />
                </>
              ) : (
                <h2
                  className={styles.titleDisplay}
                  onDoubleClick={handleTitleDoubleClick}
                  title="Редактировать"
                >
                  {dashboardTitle}
                </h2>
              )}
            </div>
            <div className={styles.buttonsContainer}>
              {shouldShowConnectVideoButton && (
                <SecondaryButton
                  text="Подключить видео"
                  icon={ConnectVideo}
                  onClick={handleConnectVideoClick}
                  disabled={isSavingBeforeConnect || isSaving}
                  loading={isSavingBeforeConnect}
                />
              )}
              <PrimaryButton
                text="Сохранить дашборд"
                icon={SaveDash}
                onClick={() => handleSaveDashboard(true)}
                disabled={isSaving || isLoading}
                loading={isSaving || isLoading}
              />
            </div>
          </div>

          <Tabs
            activeTab={activeTab}
            tabs={tabs}
            onTabAdd={handleAddTab}
            onTabChange={handleTabChange}
            onTabRename={handleTabRename}
            onTabRemove={handleTabRemove}
            showAddButton={showAddButton}
            maxTabs={MAX_TABS}
          />

          <div
            className={
              isFullscreen ? styles.dashboardFullscreen : styles.dashboard
            }
          >
            <div
              className={
                isFullscreen
                  ? styles.dashboardContainerFullscreen
                  : styles.dashboardContainer
              }
            >
              <div
                ref={(node) => {
                  layoutRef.current = node;
                  drop(node);
                }}
                className={
                  isFullscreen ? styles.layoutFullscreen : styles.layout
                }
              >
                {/* Визуальная сетка */}
                <div
                  className={styles.gridContainer}
                  style={{
                    width: `${gridWidth}px`,
                    height: `${gridHeight}px`,
                    display: "grid",
                    gridTemplateColumns: `repeat(${COLS}, ${cellSize.width}px)`,
                    gridTemplateRows: `repeat(${ROWS}, ${cellSize.height}px)`,
                    gap: `${gap}px`,
                  }}
                >
                  {Array.from({ length: COLS * ROWS }).map((_, index) => (
                    <div
                      key={index}
                      className={styles.gridCell}
                      style={{
                        width: cellSize.width,
                        height: cellSize.height,
                      }}
                    />
                  ))}
                </div>

                {/* Подсветка дропа */}
                {getPreviewCells()}

                {/* React Grid Layout */}
                <div
                  className={styles.gridLayoutContainer}
                  style={{
                    width: `${gridWidth}px`,
                    height: `${gridHeight}px`,
                  }}
                >
                  <ResponsiveGridLayout
                    layouts={getLayouts(currentTab.widgets)}
                    breakpoints={{ lg: 1200 }}
                    cols={{ lg: COLS }}
                    rowHeight={cellSize.height}
                    margin={[gap, gap]}
                    containerPadding={[0, 0]}
                    onLayoutChange={onLayoutChange}
                    isDraggable={true}
                    isResizable={true}
                    draggableHandle=".widgetHeader, .widget-header, .header, [class*='header']"
                    draggableCancel=".noDrag, .widgetBody"
                    compactType={null}
                    autoSize={false}
                    isBounded={true}
                    useCSSTransforms={false}
                    transformScale={1}
                    resizeHandles={["se"]}
                    onDragStart={handleDragStart}
                    onDrag={handleDrag}
                    onDragStop={handleDragStop}
                    onResizeStart={handleResizeStart}
                    onResize={handleResize}
                    onResizeStop={handleResizeStop}
                  >
                    {currentTab.widgets.map((widget) => {
                      const widgetRealTimeData = widgetsData[widget.i] || {};
                      return (
                        <div key={widget.i} data-grid={widget}>
                          <Widget
                            widget={widget}
                            onRemove={() => removeWidget(widget.i)}
                            realTimeData={widgetRealTimeData}
                          />
                        </div>
                      );
                    })}
                  </ResponsiveGridLayout>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <UploadVideoModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        fromDashboard={true}
        dashboardId={tempDashboardId || finalDashboardId}
        onSuccess={handleVideoConnected}
      />
    </div>
  );
};
