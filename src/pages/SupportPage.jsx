import React from "react";
import { useNavigate } from "react-router-dom";
import { Menu } from "@ui/shared/Menu";

export const SupportPage = () => {
  const navigate = useNavigate();

  const handleMenuItemClick = (menuItemId) => {
    if (menuItemId === "dashboards") {
      navigate("/dashboards");
    } else if (menuItemId === "templates") {
      navigate("/templates");
    } else if (menuItemId === "videos") {
      navigate("/videos");
    } else if (menuItemId === "settings") {
      navigate("/settings");
    } else if (menuItemId === "support") {
      // Остаемся на этой странице
      console.log("Already on support page");
    }
  };

  const handleCreateDashboard = () => {
    navigate("/create_dashboard");
  };

  return (
    <div style={{ display: "flex", width: "1920px", height: "1080px" }}>
      <Menu
        activeItem="support"
        onMenuItemClick={handleMenuItemClick}
        onTemplateSelect={() => {}}
        onDashboardSelect={() => {}}
        onCreateDashboard={handleCreateDashboard}
        selectedTemplate={null}
        selectedDashboard={null}
      />
      <div>Поддержка</div>
    </div>
  );
};
