import React from "react";
import { useNavigate } from "react-router-dom";
import { Menu } from "@ui/shared/Menu";
import { Support } from "@others/Support";

export const SupportPage = () => {
  const navigate = useNavigate();

  const handleMenuItemClick = (menuItemId) => {
    if (menuItemId === "dashboards") navigate("/dashboards");
    else if (menuItemId === "templates") navigate("/templates");
    else if (menuItemId === "videos") navigate("/videos");
    else if (menuItemId === "settings") navigate("/settings");
    else if (menuItemId === "scenarios") navigate("/scenarios");
    else if (menuItemId === "my-scenarios") navigate("/my-scenarios");
  };

  const handleCreateDashboard = () => {
    navigate("/create_dashboard");
  };

  return (
    <div
      style={{ display: "flex", width: "100vw", height: "min(100vh, 56.25vw)" }}
    >
      <Menu
        activeItem="support"
        onMenuItemClick={handleMenuItemClick}
        onTemplateSelect={() => {}}
        onDashboardSelect={() => {}}
        onCreateDashboard={handleCreateDashboard}
        selectedTemplate={null}
        selectedDashboard={null}
      />
      <Support />
    </div>
  );
};
