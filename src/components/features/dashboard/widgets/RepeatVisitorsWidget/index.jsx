import React from "react";
import styles from "./RepeatVisitorsWidget.module.scss";
import RepeatVisitorsIcon from "@icons/checkout_blue.svg";

export const RepeatVisitorsWidget = ({ data = {}, widgetId, widgetType }) => {
  const {
    peopleCount = 4,
    occupancyPercentage = 40,
    name = "Повторные",
    description = "посетители",
  } = data;

  return (
    <div className={styles.widgetContent}>
      <div className={styles.widgetHeader}>
        <img src={RepeatVisitorsIcon} alt="Repeat Visitors" />
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
        <button className={`${styles.widgetButton} ${styles.medium}`}>
          <p>{occupancyPercentage}% от общего</p>
        </button>
      </div>
    </div>
  );
};
