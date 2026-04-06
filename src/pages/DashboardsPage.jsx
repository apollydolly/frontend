import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Menu } from "@ui/shared/Menu";
import { MyDashboards } from "@dashboard/MyDashboards";
import { dashboardService } from "@services/dashboardService";
import { DashboardViewer } from "@dashboard/DashboardViewer";

export const DashboardsPage = () => {
  const [selectedDashboard, setSelectedDashboard] = useState(null);
  const [dashboards, setDashboards] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const hasLoaded = useRef(false);
  const location = useLocation();

  const handleDashboardSelected = useCallback((dashboard) => {
    setSelectedDashboard(dashboard);
    setDashboards((prev) =>
      prev.map((d) =>
        d.dashboard_id === dashboard.dashboard_id ? dashboard : d,
      ),
    );
  }, []);

  useEffect(() => {
    if (
      location.state &&
      location.state.selectedDashboardId &&
      dashboards.length > 0
    ) {
      const targetDashboard = dashboards.find(
        (d) => d.dashboard_id === location.state.selectedDashboardId,
      );
      if (targetDashboard) {
        setSelectedDashboard(targetDashboard);
        navigate(location.pathname, { replace: true, state: {} });
      }
    }
  }, [dashboards, location.state, location.pathname, navigate]);

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
    if (menuItemId === "templates") navigate("/templates");
    else if (menuItemId === "videos") navigate("/videos");
    else if (menuItemId === "settings") navigate("/settings");
    else if (menuItemId === "support") navigate("/support");
    else if (menuItemId === "scenarios") navigate("/scenarios");
    else if (menuItemId === "my-scenarios") navigate("/my-scenarios");
  };

  const handleDashboardSelect = (dashboard) => {
    setSelectedDashboard(dashboard);
  };

  const handleDashboardDeleted = async (deletedDashboardId) => {
    const dashboardsData = await dashboardService.getUserDashboards();
    setDashboards(dashboardsData);
    if (dashboardsData.length > 0) setSelectedDashboard(dashboardsData[0]);
    else setSelectedDashboard(null);
  };

  const handleCreateDashboard = () => {
    navigate("/create_dashboard");
  };

  const handleEditDashboard = () => {
    if (selectedDashboard) {
      navigate(`/edit_dashboard/${selectedDashboard.dashboard_id}`);
    }
  };

  const hasDashboards = () => dashboards.length > 0;

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
        onScenarioSelect={() => {}}
        onMyScenarioSelect={() => {}}
        onCreateDashboard={handleCreateDashboard}
        selectedTemplate={null}
        selectedDashboard={selectedDashboard}
        selectedScenario={null}
        selectedMyScenario={null}
        dashboards={dashboards}
        myScenarios={[]}
        isLoadingDashboards={isLoading}
      />
      {renderContent()}
    </div>
  );
};
