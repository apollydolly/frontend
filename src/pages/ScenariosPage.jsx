import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Menu, menuItems } from "@ui/shared/Menu";
import { Scenario } from "@scenarios/Scenario";

export const ScenariosPage = () => {
  const [selectedScenario, setSelectedScenario] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const scenariosItem = menuItems.main.find(
      (item) => item.id === "scenarios",
    );
    if (scenariosItem?.subItems?.length > 0) {
      setSelectedScenario(scenariosItem.subItems[0]);
    }
  }, []);

  const handleMenuItemClick = (menuItemId) => {
    if (menuItemId === "dashboards") navigate("/dashboards");
    else if (menuItemId === "templates") navigate("/templates");
    else if (menuItemId === "videos") navigate("/videos");
    else if (menuItemId === "settings") navigate("/settings");
    else if (menuItemId === "support") navigate("/support");
    else if (menuItemId === "my-scenarios") navigate("/my-scenarios");
  };

  const handleScenarioSelect = (scenario) => {
    setSelectedScenario(scenario);
  };

  const renderContent = () => {
    return selectedScenario ? (
      <Scenario title={selectedScenario.title} />
    ) : (
      <div className="empty-state">
        <h2>Выберите сценарий</h2>
        <p>Выберите готовый сценарий из меню слева</p>
      </div>
    );
  };

  return (
    <div
      style={{ display: "flex", width: "100vw", height: "min(100vh, 56.25vw)" }}
    >
      <Menu
        activeItem="scenarios"
        onMenuItemClick={handleMenuItemClick}
        onTemplateSelect={() => {}}
        onDashboardSelect={() => {}}
        onScenarioSelect={handleScenarioSelect}
        onMyScenarioSelect={() => {}}
        onCreateDashboard={() => navigate("/create_dashboard")}
        selectedTemplate={null}
        selectedDashboard={null}
        selectedScenario={selectedScenario}
        selectedMyScenario={null}
        dashboards={[]}
        myScenarios={[]}
      />
      {renderContent()}
    </div>
  );
};
