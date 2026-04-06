import React from "react";
import styles from "./AnomaliesWidget.module.scss";
import AnomaliesIcon from "@icons/anomalies.svg";
import ArrowIcon from "@icons/widget_button_icon.svg?react";

export const AnomaliesWidget = ({ data = {}, widgetId, widgetType }) => {
  const {
    numberAnomalies = 8,
    highRisk = 3,
    name = "Аномалии",
    description = "сегодня",
  } = data;

  return (
    <div className={styles.widgetContent}>
      <div className={styles.widgetHeader}>
        <img src={AnomaliesIcon} alt="Anomalies" />
        <div className={styles.headerText}>
          <h2>{name}</h2>
          <p>{description}</p>
        </div>
      </div>
      <div className={styles.widgetBody}>
        <div className={styles.numPeople}>
          <h3>{numberAnomalies}</h3>
        </div>
        <button className={`${styles.widgetButton} ${styles.high}`}>
          <p>{highRisk} высокого риска</p>
          <ArrowIcon />
        </button>
      </div>
    </div>
  );
};
