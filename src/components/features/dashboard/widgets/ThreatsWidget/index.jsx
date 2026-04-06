import React from "react";
import styles from "./ThreatsWidget.module.scss";
import ThreatsIcon from "@icons/threats.svg?react";
import ArrowIcon from "@icons/widget_button_icon.svg?react";

export const ThreatsWidget = ({ data = {}, widgetId, widgetType }) => {
  // Используем данные из пропсов или значения по умолчанию
  const { event = "crowd" } = data;

  return (
    <div className={styles.widgetContent}>
      <div className={styles.widgetHeader}>
        <ThreatsIcon
          className={`${styles.fireIcon} ${event ? styles.dangerActive : ""}`}
        />
        <div className={styles.headerText}>
          <h2>Угрозы</h2>
          <p>Конфликтные ситуации</p>
        </div>
      </div>
      <div className={styles.widgetBody}>
        {event == "conflict" ? (
          <p className={styles.dangerText}>Конфликт!</p>
        ) : event == "crowd" ? (
          <p className={styles.dangerText}>Скопление толпы!</p>
        ) : event == null ? (
          <p className={styles.emptyText}>Не обнаружено.</p>
        ) : (
          <p className={styles.emptyText}>Неизвестное событие.</p>
        )}
        {event && (
          <button className={styles.widgetButton}>
            <p>перейти</p>
            <ArrowIcon />
          </button>
        )}
      </div>
    </div>
  );
};
