import React from "react";
import styles from "./Tabs.module.scss";

export const Tabs = ({
  tabs,
  activeTab,
  onTabClick,
  disabledTabs = [],
  className = "",
  minWidth = 0,
  tabWidth = "auto",
}) => {
  const isTabDisabled = (tabId) => {
    const tab = tabs.find((t) => t.id === tabId);
    return disabledTabs.includes(tabId) || (tab && tab.disabled);
  };

  return (
    <div
      className={`${styles.tabsContainer} ${className}`}
      style={{ minWidth: minWidth }}
    >
      {tabs.map((tab) => (
        <button
          key={tab.id}
          className={`${styles.tab} ${
            activeTab === tab.id ? styles.tabActive : styles.tabInactive
          } ${isTabDisabled(tab.id) ? styles.tabDisabled : ""}`}
          style={{ width: tabWidth }}
          onClick={() => !isTabDisabled(tab.id) && onTabClick(tab.id)}
          disabled={isTabDisabled(tab.id)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
};
