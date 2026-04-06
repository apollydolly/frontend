import React from "react";
import styles from "./CheckoutWidget.module.scss";
import CheckoutIcon from "@icons/checkout.svg";
import ArrowIcon from "@icons/widget_button_icon.svg?react";

export const CheckoutWidget = ({ data = {}, widgetId, widgetType }) => {
  const {
    peopleCount = 0,
    occupancyPercentage = 0,
    name = "Кассовая зона",
    description = "Загруженность",
  } = data;

  // Определение класса в зависимости от уровня загруженности
  const getOccupancyClass = () => {
    if (occupancyPercentage <= 30) return styles.low;
    if (occupancyPercentage <= 69) return styles.medium;
    return styles.high;
  };

  const getOccupancyLevel = () => {
    if (occupancyPercentage <= 30) return "низкая";
    if (occupancyPercentage <= 69) return "средняя";
    return "высокая";
  };

  return (
    <div className={styles.widgetContent}>
      <div className={styles.widgetHeader}>
        <img src={CheckoutIcon} title="checkout" alt="checkout" />
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
          <p>{getOccupancyLevel()}</p>
          <ArrowIcon />
        </button>
      </div>
    </div>
  );
};
