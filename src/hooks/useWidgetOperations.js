import { useCallback } from "react";
import { generateId } from "@utils/generateId";
import {
  getDefaultWidgetSize,
  getAvailableSizes,
  getWidgetConstraints,
} from "@utils/widgets-config";

export const useWidgetOperations = (
  activeTab,
  maxRows,
  setTabs,
  COLS,
  ROWS
) => {
  const addWidget = (type, position) => {
    const defaultSize = getDefaultWidgetSize(type);
    const constraints = getWidgetConstraints(type);

    setTabs((prevTabs) =>
      prevTabs.map((tab) =>
        tab.id === activeTab
          ? {
              ...tab,
              widgets: [
                ...tab.widgets,
                {
                  i: `widget-${Date.now()}`,
                  type,
                  x: position.x,
                  y: position.y,
                  w: defaultSize.w,
                  h: defaultSize.h,
                  // Добавляем ограничения для react-grid-layout
                  minW: constraints.minW,
                  minH: constraints.minH,
                  maxW: constraints.maxW,
                  maxH: constraints.maxH,
                  // Сохраняем доступные размеры для логики ресайза
                  availableSizes: getAvailableSizes(type),
                },
              ],
            }
          : tab
      )
    );
  };

  const removeWidget = useCallback(
    (widgetId) => {
      setTabs((prev) =>
        prev.map((tab) =>
          tab.id === activeTab
            ? {
                ...tab,
                widgets: tab.widgets.filter((widget) => widget.i !== widgetId),
              }
            : tab
        )
      );
    },
    [activeTab, setTabs]
  );

  // Обновите функцию onLayoutChange:
  const onLayoutChange = (newLayout) => {
    setTabs((prevTabs) =>
      prevTabs.map((tab) => {
        if (tab.id === activeTab) {
          const validatedWidgets = tab.widgets.map((widget) => {
            const layoutItem = newLayout.find((item) => item.i === widget.i);
            if (layoutItem) {
              // Проверяем, соответствует ли размер допустимым значениям
              const availableSizes = getAvailableSizes(widget.type);
              const isValidSize = availableSizes.some(
                (size) => size.w === layoutItem.w && size.h === layoutItem.h
              );

              if (!isValidSize) {
                // Если размер недопустимый, находим ближайший допустимый
                const closestSize = availableSizes.reduce((closest, size) => {
                  const currentDiff =
                    Math.abs(layoutItem.w - closest.w) +
                    Math.abs(layoutItem.h - closest.h);
                  const newDiff =
                    Math.abs(layoutItem.w - size.w) +
                    Math.abs(layoutItem.h - size.h);
                  return newDiff < currentDiff ? size : closest;
                });

                console.log(
                  `🛠️ Correcting widget ${widget.i} size to:`,
                  closestSize
                );
                return {
                  ...widget,
                  ...layoutItem,
                  w: closestSize.w,
                  h: closestSize.h,
                };
              }

              return { ...widget, ...layoutItem };
            }
            return widget;
          });

          return { ...tab, widgets: validatedWidgets };
        }
        return tab;
      })
    );
  };

  return {
    addWidget,
    removeWidget,
    onLayoutChange,
  };
};
