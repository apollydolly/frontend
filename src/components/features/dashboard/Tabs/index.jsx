import React, { useState, useRef, useEffect } from "react";
import styles from "./Tabs.module.scss";
import AddTabIcon from "@icons/plus_icon.svg?react";

export const Tabs = ({
  activeTab,
  tabs,
  onTabAdd,
  onTabChange,
  onTabRename,
  onTabRemove,
  showAddButton = false,
  maxTabs = 5,
  isStatic = false,
}) => {
  const [editingTab, setEditingTab] = useState(null);
  const [editValue, setEditValue] = useState("");
  const widthMeasurers = useRef({});
  const [tabWidths, setTabWidths] = useState({});

  // Проверяем, можно ли добавить новую вкладку
  const canAddTab = showAddButton && tabs.length < maxTabs && !isStatic;

  const enableEdit = (tabId, currentName) => {
    if (!isStatic) {
      setEditingTab(tabId);
      setEditValue(currentName);
    }
  };

  const finishEdit = (tabId) => {
    if (editValue.trim()) {
      onTabRename(tabId, editValue.trim());
    }
    setEditingTab(null);
    setEditValue("");
  };

  const handleKeyPress = (e, tabId) => {
    if (e.key === "Enter") finishEdit(tabId);
    if (e.key === "Escape") {
      setEditingTab(null);
      setEditValue("");
    }
  };

  // Автоширина
  useEffect(() => {
    if (editingTab === null) return;

    const span = widthMeasurers.current[editingTab];
    if (!span) return;

    const w = span.offsetWidth + 20; // padding
    setTabWidths((prev) => ({ ...prev, [editingTab]: w }));
  }, [editValue, editingTab]);

  // Обработчик клика по вкладке
  const handleTabClick = (tabId) => {
    if (onTabChange) {
      onTabChange(tabId);
    }
  };

  return (
    <div className={styles.tabsContainer}>
      <div className={styles.tabsList}>
        {tabs.map((tab) => {
          const isEditing = editingTab === tab.id;

          if (isEditing) {
            return (
              <React.Fragment key={`edit-${tab.id}`}>
                <span
                  ref={(el) => (widthMeasurers.current[tab.id] = el)}
                  className={styles.widthMeasurer}
                >
                  {editValue || " "}
                </span>

                <input
                  className={`${styles.tabInput} ${
                    editValue.length >= 30 ? styles.tabInputMax : ""
                  }`}
                  value={editValue}
                  maxLength={30}
                  style={{ width: tabWidths[tab.id] || 40 }}
                  onChange={(e) => setEditValue(e.target.value)}
                  onBlur={() => finishEdit(tab.id)}
                  onKeyDown={(e) => handleKeyPress(e, tab.id)}
                  autoFocus
                />
              </React.Fragment>
            );
          }

          return (
            <div
              key={tab.id}
              className={`${styles.tab} ${
                activeTab === tab.id ? styles.active : ""
              } ${isStatic ? styles.staticTab : ""}`}
              onClick={() => handleTabClick(tab.id)}
              onDoubleClick={() => enableEdit(tab.id, tab.name)}
            >
              <span title="Редактировать" className={styles.tabName}>
                {tab.name}
              </span>

              {/* {!isStatic && tabs.length > 1 && (
                <button
                  className={styles.tabClose}
                  onClick={(e) => {
                    e.stopPropagation();
                    onTabRemove?.(tab.id);
                  }}
                >
                  ×
                </button>
              )} */}
            </div>
          );
        })}
      </div>

      {canAddTab && (
        <button className={styles.addTabBtn} onClick={onTabAdd}>
          <AddTabIcon />
        </button>
      )}
    </div>
  );
};
