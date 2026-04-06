import React from "react";
import styles from "./ViolationsWidget.module.scss";
import ViolationsIcon from "@icons/violations.svg?react";
import ArrowIcon from "@icons/widget_button_icon.svg?react";

export const ViolationsWidget = ({ data = {}, widgetId, widgetType }) => {
  // Используем данные из пропсов или значения по умолчанию
  const { event = "nohelmet" } = data;

  return (
    <div className={styles.widgetContent}>
      <div className={styles.widgetHeader}>
        <ViolationsIcon
          className={`${styles.fireIcon} ${event ? styles.dangerActive : ""}`}
        />
        <div className={styles.headerText}>
          <h2>Нарушения</h2>
          <p>Правила, стиль и ТБ</p>
        </div>
      </div>
      <div className={styles.widgetBody}>
        {event == "nohelmet" ? (
          <p className={styles.dangerText}>Нет каски!</p>
        ) : event == "novest" ? (
          <p className={styles.dangerText}>Нет жилета!</p>
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
