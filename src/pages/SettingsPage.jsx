import React from "react";
import { useNavigate } from "react-router-dom";
import { Menu } from "@ui/shared/Menu";

export const SettingsPage = () => {
  const navigate = useNavigate();

  const handleMenuItemClick = (menuItemId) => {
    if (menuItemId === "dashboards") navigate("/dashboards");
    else if (menuItemId === "templates") navigate("/templates");
    else if (menuItemId === "videos") navigate("/videos");
    else if (menuItemId === "support") navigate("/support");
    else if (menuItemId === "scenarios") navigate("/scenarios");
    else if (menuItemId === "my-scenarios") navigate("/my-scenarios");
  };

  const handleCreateDashboard = () => {
    navigate("/create_dashboard");
  };

  return (
    <div style={{ display: "flex", width: "1920px", height: "1080px" }}>
      <Menu
        activeItem="settings"
        onMenuItemClick={handleMenuItemClick}
        onTemplateSelect={() => {}}
        onDashboardSelect={() => {}}
        onCreateDashboard={handleCreateDashboard}
        selectedTemplate={null}
        selectedDashboard={null}
      />
      <div>Настройки</div>
    </div>
  );
};
