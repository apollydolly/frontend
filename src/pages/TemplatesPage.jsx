import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Menu, menuItems } from "@ui/shared/Menu";
import { Template } from "@templates/Template";

export const TemplatesPage = () => {
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const navigate = useNavigate();

  // Функция для получения первого элемента
  const getFirstItem = (itemId) => {
    const menuItem = menuItems.main.find((item) => item.id === itemId);
    return menuItem?.subItems?.[0] || null;
  };

  // Автоматически выбираем первый шаблон при загрузке
  useEffect(() => {
    const firstTemplate = getFirstItem("templates");
    setSelectedTemplate(firstTemplate);
  }, []);

  const handleMenuItemClick = (menuItemId) => {
    if (menuItemId === "dashboards") {
      navigate("/dashboards");
    } else if (menuItemId === "videos") {
      navigate("/videos");
    } else if (menuItemId === "settings") {
      navigate("/settings");
    } else if (menuItemId === "support") {
      navigate("/support");
    } else if (menuItemId === "templates") {
      console.log("Already on templates page");
    }
  };

  const handleTemplateSelect = (template) => {
    console.log("Выбран шаблон:", template);
    setSelectedTemplate(template);
  };

  const handleCreateDashboard = () => {
    navigate("/create_dashboard");
  };

  const renderContent = () => {
    return selectedTemplate ? (
      <Template title={selectedTemplate.title} />
    ) : (
      <div className="empty-state">
        <h2>Выберите шаблон</h2>
        <p>Выберите шаблон из меню слева для просмотра</p>
      </div>
    );
  };

  return (
    <div style={{ display: "flex", width: "1920px", height: "1080px" }}>
      <Menu
        activeItem="templates"
        onMenuItemClick={handleMenuItemClick}
        onTemplateSelect={handleTemplateSelect}
        onDashboardSelect={() => {}} // Не используется на этой странице
        onCreateDashboard={handleCreateDashboard}
        selectedTemplate={selectedTemplate}
        selectedDashboard={null}
        dashboards={[]} // Пустой массив для шаблонов страницы
      />
      {renderContent()}
    </div>
  );
};
