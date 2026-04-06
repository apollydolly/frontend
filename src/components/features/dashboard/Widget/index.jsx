import React, { useEffect, useState } from "react";
import styles from "./Widget.module.scss";
import { WIDGET_CONFIG } from "@utils/widgets-config";
import { transformWidgetData } from "@utils/widgetDataParser";

export const Widget = ({
  widget = {},
  onRemove,
  onDragStart,
  onResizeStart,
  isStatic = false,
  realTimeData = {},
  onViewDetails,
}) => {
  const { type = "unknown", i: widgetId } = widget;
  const widgetConfig = WIDGET_CONFIG[type];
  const widgetName = widgetConfig?.name;
  const Component = widgetConfig?.component;
  const canRemove = !!onRemove && !isStatic;

  // Состояние для данных виджета
  const [widgetData, setWidgetData] = useState({
    ...widget.data, // Статические данные из виджета
  });

  // Обновляем данные при получении новых realTimeData
  useEffect(() => {
    if (realTimeData && Object.keys(realTimeData).length > 0) {
      console.log(`Обновление данных виджета ${widgetId}:`, {
        rawWebSocketData: realTimeData,
        event_info: realTimeData.event_info,
        event_date: realTimeData.event_date,
      });

      // Преобразуем данные WebSocket в формат виджета
      const transformedData = transformWidgetData(type, realTimeData);

      console.log(`Преобразованные данные для ${widgetId}:`, transformedData);

      setWidgetData((prev) => ({
        ...prev,
        ...transformedData,
        lastUpdate: new Date().toISOString(),
      }));
    }
  }, [realTimeData, widgetId, type]);

  // Обработчики для drag handle
  const handleMouseDown = (e) => {
    if (!isStatic && onDragStart && widgetId) {
      onDragStart(widgetId, widget);
    }
  };

  // Обработчики для resize handle
  const handleResizeHandleMouseDown = (e) => {
    if (!isStatic) {
      e.stopPropagation();
      if (onResizeStart && widgetId) {
        onResizeStart(widgetId, widget);
      }
    }
  };

  // Функция для открытия виджета в полном экране
  const openWidgetFullscreen = () => {
    const widgetDataForFullscreen = {
      widget: {
        ...widget,
        data: widgetData, // Сохраняем актуальные данные
      },
      type,
      name: widgetName,
      timestamp: Date.now(),
    };

    console.log("Открытие виджета в полном экране:", widgetDataForFullscreen);
    localStorage.setItem(
      "fullscreenWidgetData",
      JSON.stringify(widgetDataForFullscreen)
    );

    // Добавляем случайный параметр чтобы избежать кеширования
    const randomParam = `t=${Date.now()}`;
    window.open(
      `${window.location.origin}/widget-fullscreen?${randomParam}`,
      "_blank"
    );
  };

  return (
    <div
      className={`${styles.widgetContainer} ${
        isStatic ? styles.staticWidget : ""
      }`}
      onMouseDown={handleMouseDown}
    >
      {!isStatic && canRemove && (
        <div className={styles.widgetActions}>
          <button
            className={`${styles.fullscreenBtn} noDrag`}
            onClick={(e) => {
              e.stopPropagation();
              openWidgetFullscreen();
            }}
            title="Развернуть в отдельном окне"
          >
            ⛶
          </button>
          <button
            className={`${styles.removeBtn} noDrag`}
            onClick={(e) => {
              e.stopPropagation();
              onRemove?.();
            }}
            title="Удалить виджет"
          >
            &times;
          </button>
        </div>
      )}
      {Component ? (
        <Component
          data={widgetData}
          widgetId={widgetId}
          widgetType={type}
          {...widgetData}
          onViewDetails={onViewDetails}
        />
      ) : (
        `Неизвестный виджет: ${type}`
      )}
      {!isStatic && (
        <div
          className={styles.resizeHandle}
          onMouseDown={handleResizeHandleMouseDown}
        />
      )}
    </div>
  );
};
