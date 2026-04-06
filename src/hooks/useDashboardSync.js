import { useEffect } from "react";

export const useDashboardSync = ({
  isFullscreen,
  isInitialized,
  lastUpdate,
  setLastUpdate,
  updateDashboardState,
  saveDashboardState,
  tabs,
  activeTab,
  nextTabNumber,
}) => {
  //загрузка данных при монтировании для полного экрана
  useEffect(() => {
    if (isFullscreen) {
      const savedData = localStorage.getItem("fullscreenDashboardData");
      if (savedData) {
        const dashboardData = JSON.parse(savedData);
        console.log("Загрузка данных для полного экрана", dashboardData);
        updateDashboardState(dashboardData);
        localStorage.removeItem("fullscreenDashboardData");
      }
    }
  }, [isFullscreen, updateDashboardState]);

  //Storage Event
  useEffect(() => {
    if (!isInitialized) return;

    const handleStorageChange = (event) => {
      if (event.key === "dashboardState" && event.newValue) {
        try {
          const newState = JSON.parse(event.newValue);

          //игнорируем собственные обновления
          if (newState.source === (isFullscreen ? "fullscreen" : "main")) {
            return;
          }

          if (newState.timestamp > lastUpdate) {
            console.log("Storage Event: Обновление дашборда", newState);
            updateDashboardState(newState);
            setLastUpdate(newState.timestamp);
          }
        } catch (error) {
          console.error("Ошибка парсинга dashboardState:", error);
        }
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [lastUpdate, isFullscreen, updateDashboardState, isInitialized]);

  //Polling резервное обновление
  useEffect(() => {
    if (!isInitialized) return;

    const interval = setInterval(() => {
      const savedState = localStorage.getItem("dashboardState");
      if (savedState) {
        try {
          const newState = JSON.parse(savedState);

          //игнорируем собственные обновления
          if (newState.source === (isFullscreen ? "fullscreen" : "main")) {
            return;
          }

          if (newState.timestamp > lastUpdate + 2000) {
            console.log("Polling: Обновление дашборда", newState);
            updateDashboardState(newState);
            setLastUpdate(newState.timestamp);
          }
        } catch (error) {
          console.error("Ошибка парсинга dashboardState:", error);
        }
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [lastUpdate, isFullscreen, updateDashboardState, isInitialized]);

  //сохраняем при каждом изменении
  useEffect(() => {
    if (isInitialized) {
      const state = { tabs, activeTab, nextTabNumber };
      saveDashboardState(state);
    }
  }, [tabs, activeTab, nextTabNumber, saveDashboardState, isInitialized]);
};
