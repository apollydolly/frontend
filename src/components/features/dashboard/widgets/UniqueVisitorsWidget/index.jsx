import React from "react";
import styles from "./UniqueVisitorsWidget.module.scss";
import UniqueVisitorsIcon from "@icons/star_yellow.svg";

export const UniqueVisitorsWidget = ({ data = {}, widgetId, widgetType }) => {
  const {
    peopleCount = 8,
    occupancyPercentage = 76,
    name = "Уникальные",
    description = "посетители",
  } = data;

  return (
    <div className={styles.widgetContent}>
      <div className={styles.widgetHeader}>
        <img src={UniqueVisitorsIcon} alt="Unique Visitors" />
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
