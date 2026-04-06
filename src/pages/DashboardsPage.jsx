import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Menu } from "@ui/shared/Menu";
import { MyDashboards } from "@dashboard/MyDashboards";
import { Template } from "@templates/Template";
import { dashboardService } from "@services/dashboardService";
import { DashboardViewer } from "@dashboard/DashboardViewer";

export const DashboardsPage = () => {
  const [selectedDashboard, setSelectedDashboard] = useState(null);
  const [dashboards, setDashboards] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const hasLoaded = useRef(false);
  const location = useLocation();

  // Обработчик обновления выбранного дашборда
  const handleDashboardSelected = useCallback((dashboard) => {
    console.log("Дашборд обновлен в родительском компоненте:", {
      id: dashboard.dashboard_id,
      name: dashboard.name,
      videoCount: dashboard.video_id?.length || 0,
    });

    // Обновляем выбранный дашборд
    setSelectedDashboard(dashboard);

    // Также обновляем список дашбордов
    setDashboards((prev) =>
      prev.map((d) =>
        d.dashboard_id === dashboard.dashboard_id ? dashboard : d
      )
    );
  }, []);

  useEffect(() => {
    if (
      location.state &&
      location.state.selectedDashboardId &&
      dashboards.length > 0
    ) {
      const targetDashboard = dashboards.find(
        (d) => d.dashboard_id === location.state.selectedDashboardId
      );
      if (targetDashboard) {
        console.log("дашборд: ", targetDashboard.name);
        setSelectedDashboard(targetDashboard);
        navigate(location.pathname, { replace: true, state: {} });
      }
    }
  }, [dashboards, location.state, location.pathname, navigate]);

  // Загружаем дашборды при монтировании
  useEffect(() => {
    if (hasLoaded.current) return;
    const loadDashboards = async () => {
      try {
        setIsLoading(true);
        hasLoaded.current = true;
        const dashboardsData = await dashboardService.getUserDashboards();
        setDashboards(dashboardsData);

        if (!(location.state && location.state.selectedDashboardId)) {
          if (dashboardsData.length > 0 && !selectedDashboard) {
            setSelectedDashboard(dashboardsData[0]);
          }
        }
      } catch (error) {
        console.error("Ошибка загрузки дашбордов:", error);
        hasLoaded.current = false;
      } finally {
        setIsLoading(false);
      }
    };
    loadDashboards();
    return () => {
      hasLoaded.current = false;
    };
  }, [selectedDashboard, location.state]);

  const handleMenuItemClick = (menuItemId) => {
    if (menuItemId === "templates") {
      navigate("/templates");
    } else if (menuItemId === "videos") {
      navigate("/videos");
    } else if (menuItemId === "settings") {
      navigate("/settings");
    } else if (menuItemId === "support") {
      navigate("/support");
    }
  };

  const handleDashboardSelect = (dashboard) => {
    console.log("Выбор дашборда на странице:", {
      id: dashboard.dashboard_id,
      name: dashboard.name,
    });
    setSelectedDashboard(dashboard);
  };

  const handleDashboardDeleted = async (deletedDashboardId) => {
    console.log(`Дашборд ${deletedDashboardId} удален`);

    try {
      // Перезагружаем список дашбордов
      const dashboardsData = await dashboardService.getUserDashboards();
      setDashboards(dashboardsData);

      // Выбираем первый дашборд, если есть
      if (dashboardsData.length > 0) {
        setSelectedDashboard(dashboardsData[0]);
      } else {
        setSelectedDashboard(null);
      }

      console.log("Список дашбордов обновлен после удаления");
    } catch (error) {
      console.error("Ошибка при обновлении списка дашбордов:", error);
    }
  };

  const handleCreateDashboard = () => {
    navigate("/create_dashboard");
  };

  // Обновляем handleEditDashboard для перехода на страницу редактирования
  const handleEditDashboard = () => {
    if (selectedDashboard) {
      navigate(`/edit_dashboard/${selectedDashboard.dashboard_id}`);
    }
  };

  const hasDashboards = () => {
    return dashboards.length > 0;
  };

  const renderContent = () => {
    if (!hasDashboards()) {
      return <MyDashboards onCreateDashboard={handleCreateDashboard} />;
    }

    if (selectedDashboard) {
      return (
        <DashboardViewer
          dashboardData={selectedDashboard.data}
          title={selectedDashboard.name}
          dashboardId={selectedDashboard.dashboard_id}
          dashboardInfo={selectedDashboard}
          onEdit={handleEditDashboard}
          onDashboardDeleted={handleDashboardDeleted}
          onDashboardSelected={handleDashboardSelected}
        />
      );
    }

    return (
      <div>
        <p>Выберите дашборд из списка слева</p>
      </div>
    );
  };

  return (
    <div style={{ display: "flex", width: "1920px", height: "1080px" }}>
      <Menu
        activeItem="dashboards"
        onMenuItemClick={handleMenuItemClick}
        onTemplateSelect={() => {}}
        onDashboardSelect={handleDashboardSelect}
        onCreateDashboard={handleCreateDashboard}
        selectedTemplate={null}
        selectedDashboard={selectedDashboard}
        dashboards={dashboards}
        isLoadingDashboards={isLoading}
      />
      {renderContent()}
    </div>
  );
};
