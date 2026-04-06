import React, { useEffect } from "react";
import { Widget } from "@dashboard/Widget";

export const WidgetFullscreen = () => {
  const [widgetData, setWidgetData] = React.useState(null);
  React.useEffect(() => {
    if (widgetData?.name) {
      document.title = widgetData.name;
    }
  }, [widgetData?.name]);

  useEffect(() => {
    //загружаем данные виджета из localStorage
    const savedData = localStorage.getItem("fullscreenWidgetData");
    if (savedData) {
      try {
        const data = JSON.parse(savedData);
        console.log("Загрузка данных виджета для полного экрана:", data);
        setWidgetData(data);

        //очищаем после загрузки
        localStorage.removeItem("fullscreenWidgetData");
      } catch (error) {
        console.error("Ошибка загрузки данных виджета:", error);
      }
    }
  }, []);

  if (!widgetData) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          backgroundColor: "#f5f5f5",
        }}
      >
        <div>Загрузка виджета...</div>
      </div>
    );
  }

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        padding: "20px",
      }}
    >
      <Widget widget={widgetData.widget} />
    </div>
  );
};
