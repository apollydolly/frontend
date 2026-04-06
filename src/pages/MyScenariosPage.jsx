import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Menu } from "@ui/shared/Menu";

export const MyScenariosPage = () => {
  const [selectedScenario, setSelectedScenario] = useState(null);
  const [scenarios, setScenarios] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const hasLoaded = useRef(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (hasLoaded.current) return;
    const loadScenarios = async () => {
      try {
        setIsLoading(true);
        const data = [];
        setScenarios(data);
        if (data.length > 0 && !selectedScenario) {
          setSelectedScenario(data[0]);
        }
        hasLoaded.current = true;
      } catch (error) {
        console.error("Ошибка загрузки сценариев:", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadScenarios();
  }, []);

  const handleMenuItemClick = (menuItemId) => {
    if (menuItemId === "dashboards") navigate("/dashboards");
    else if (menuItemId === "templates") navigate("/templates");
    else if (menuItemId === "videos") navigate("/videos");
    else if (menuItemId === "settings") navigate("/settings");
    else if (menuItemId === "support") navigate("/support");
    else if (menuItemId === "scenarios") navigate("/scenarios");
  };

  const handleMyScenarioSelect = (scenario) => {
    setSelectedScenario(scenario);
  };

  const renderContent = () => {
    if (!isLoading && scenarios.length === 0) {
      return (
        <div style={{ padding: "20px" }}>
          <h2>Нет сценариев</h2>
        </div>
      );
    }
    if (!selectedScenario) {
      return <div style={{ padding: "20px" }}>Выберите сценарий из списка</div>;
    }
    return (
      <div style={{ padding: "20px" }}>
        <h1>{selectedScenario.title}</h1>
        <p>ID: {selectedScenario.id}</p>
      </div>
    );
  };

  return (
    <div style={{ display: "flex", width: "1920px", height: "1080px" }}>
      <Menu
        activeItem="my-scenarios"
        onMenuItemClick={handleMenuItemClick}
        onTemplateSelect={() => {}}
        onDashboardSelect={() => {}}
        onScenarioSelect={() => {}}
        onMyScenarioSelect={handleMyScenarioSelect}
        onCreateDashboard={() => navigate("/create_dashboard")}
        selectedTemplate={null}
        selectedDashboard={null}
        selectedScenario={null}
        selectedMyScenario={selectedScenario}
        dashboards={[]}
        myScenarios={scenarios}
        isLoadingMyScenarios={isLoading}
      />
      {renderContent()}
    </div>
  );
};
