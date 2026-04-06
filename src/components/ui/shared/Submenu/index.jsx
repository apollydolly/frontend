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
  selectedScenario,
  selectedMyScenario,
  onTemplateSelect,
  onDashboardSelect,
  onScenarioSelect,
  onMyScenarioSelect,
  onShowAllTemplates,
  onShowAllDashboards,
  onShowAllScenarios,
  onShowAllMyScenarios,
  onCreateDashboard,
  onCreateScenario,
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
  if (item.subItems.length > 4) {
    itemsToShow = item.subItems.slice(0, 4);
    showShowAllButton = true;
  }

  const shouldShowCreateButton =
    item.id === "dashboards" || item.id === "my-scenarios";

  return (
    <div className={styles.submenu}>
      {itemsToShow.map((subItem, index) => {
        const isLast = showShowAllButton
          ? index === 4
          : index === itemsToShow.length - 1;

        let isSelected = false;
        let handleSelect = null;

        switch (item.id) {
          case "templates":
            isSelected = selectedTemplate?.id === subItem.id;
            handleSelect = onTemplateSelect;
            break;
          case "dashboards":
            isSelected =
              selectedDashboard?.dashboard_id === subItem.dashboard_id;
            handleSelect = onDashboardSelect;
            break;
          case "scenarios":
            isSelected = selectedScenario?.id === subItem.id;
            handleSelect = onScenarioSelect;
            break;
          case "my-scenarios":
            isSelected = selectedMyScenario?.id === subItem.id;
            handleSelect = onMyScenarioSelect;
            break;
          default:
            return null;
        }

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
            className={styles.showAllButton}
            onClick={() => {
              if (item.id === "templates") onShowAllTemplates();
              else if (item.id === "dashboards") onShowAllDashboards();
              else if (item.id === "scenarios") onShowAllScenarios();
              else if (item.id === "my-scenarios") onShowAllMyScenarios();
            }}
          >
            <p className={styles.showAllText}>Показать все</p>
            <Arrow className={styles.showAllArrow} />
          </div>
        )}

        {item.id === "dashboards" && (
          <SecondaryButton
            text="Создать дашборд"
            icon={CreateIcon}
            onClick={onCreateDashboard}
          />
        )}
        {item.id === "my-scenarios" && onCreateScenario && (
          <SecondaryButton
            text="Создать сценарий"
            icon={CreateIcon}
            onClick={onCreateScenario}
          />
        )}
      </div>
    </div>
  );
};
