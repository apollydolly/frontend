import React from "react";
import styles from "../Menu/Menu.module.scss";
import Arrow from "@icons/small_arrow.svg?react";
import CreateIcon from "@icons/create.svg?react";
import { SecondaryButton } from "@ui/buttons/SecondaryButton";

export const Submenu = ({
  item,
  isExpanded,
  selectedTemplate,
  selectedDashboard,
  onTemplateSelect,
  onDashboardSelect,
  onShowAllTemplates,
  onShowAllDashboards,
  onCreateDashboard,
  renderListItem,
}) => {
  if (
    !item.hasSubmenu ||
    !isExpanded ||
    !item.subItems ||
    item.subItems.length === 0
  )
    return null;

  let itemsToShow = item.subItems;
  let showShowAllButton = false;

  if (item.subItems.length > 5) {
    itemsToShow = item.subItems.slice(0, 5);
    showShowAllButton = true;
  }

  const shouldShowCreateButton = item.id === "dashboards";

  return (
    <div className={styles.submenu}>
      {itemsToShow.map((subItem, index) => {
        const isLast = showShowAllButton
          ? index === 4
          : index === itemsToShow.length - 1;

        let isSelected = false;

        if (item.id === "templates") {
          // Для шаблонов сравниваем id
          isSelected = selectedTemplate?.id === subItem.id;
        } else {
          // Для дашбордов сравниваем dashboard_id
          isSelected = selectedDashboard?.dashboard_id === subItem.dashboard_id;
        }

        const handleSelect =
          item.id === "templates" ? onTemplateSelect : onDashboardSelect;

        return (
          <React.Fragment
            key={`${item.id}-${subItem.dashboard_id || subItem.id}-${index}`}
          >
            {renderListItem(subItem, isLast, isSelected, handleSelect)}
          </React.Fragment>
        );
      })}

      <div className={styles.afterList}>
        {showShowAllButton && (
          <div
            key="show-all-button"
            className={styles.showAllButton}
            onClick={
              item.id === "templates" ? onShowAllTemplates : onShowAllDashboards
            }
          >
            <p className={styles.showAllText}>Показать все</p>
            <Arrow className={styles.showAllArrow} />
          </div>
        )}

        {item.id === "dashboards" && shouldShowCreateButton && (
          <SecondaryButton
            key="create-dashboard-button"
            text="Создать дашборд"
            icon={CreateIcon}
            onClick={onCreateDashboard}
          />
        )}
      </div>
    </div>
  );
};
