import React from "react";
import styles from "./AverageTimeWidget.module.scss";
import AverageTimeIcon from "@icons/clock.svg";
import ArrowIcon from "@icons/arrow-trend-down.svg?react";

export const AverageTimeWidget = ({ data = {}, widgetId, widgetType }) => {
  const {
    numberMinutes = 14,
    trend = "увеличено",
    name = "Среднее время",
    description = "в магазине",
  } = data;

  return (
    <div className={styles.widgetContent}>
      <div className={styles.widgetHeader}>
        <img src={AverageTimeIcon} alt="Average Time" />
        <div className={styles.headerText}>
          <h2>{name}</h2>
          <p>{description}</p>
        </div>
      </div>
      <div className={styles.widgetBody}>
        <div className={styles.numPeople}>
          <h3>{numberMinutes}</h3>
          <p>мин.</p>
        </div>
        <button className={`${styles.widgetButton} ${styles.medium}`}>
          <ArrowIcon />
          <p>{trend}</p>
        </button>
      </div>
    </div>
  );
};
