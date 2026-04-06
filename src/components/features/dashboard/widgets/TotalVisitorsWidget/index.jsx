import React from "react";
import styles from "./TotalVisitorsWidget.module.scss";
import TotalVisitorsIcon from "@icons/checkout_blue_one.svg";

export const TotalVisitorsWidget = ({ data = {}, widgetId, widgetType }) => {
  const {
    peopleCount = 1267,
    occupancyPercentage = 12,
    name = "Всего посетителей",
    description = "сегодня",
  } = data;

  // Определение класса в зависимости от уровня загруженности
  const getOccupancyClass = () => {
    if (occupancyPercentage < 0) return styles.high;
    if (occupancyPercentage == 0) return styles.medium;
    return styles.low;
  };

  return (
    <div className={styles.widgetContent}>
      <div className={styles.widgetHeader}>
        <img src={TotalVisitorsIcon} alt="Total Visitors" />
        <div className={styles.headerText}>
          <h2>{name}</h2>
          <p>{description}</p>
        </div>
      </div>
      <div className={styles.widgetBody}>
        <div className={styles.numPeople}>
          <h3>{peopleCount}</h3>
          <p>чел.</p>
        </div>
        <button className={`${styles.widgetButton} ${getOccupancyClass()}`}>
          <p>
            {occupancyPercentage > 0 && "+"}
            {occupancyPercentage}% от вчера
          </p>
        </button>
      </div>
    </div>
  );
};
