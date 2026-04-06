import React from "react";
import styles from "./QueueCheckoutWidget.module.scss";
import QueueIcon from "@icons/queue_icon.svg";
import ArrowIcon from "@icons/widget_button_icon.svg?react";

export const QueueCheckoutWidget = ({ data = {}, widgetId, widgetType }) => {
  const {
    checkoutNumber = 1,
    peopleCount = 0,
    occupancyPercentage = 0,
    isOpen = true,
    name = `Касса №${checkoutNumber}`,
    description = "Текущая очередь",
  } = data;

  // Определение класса в зависимости от уровня загруженности
  const getOccupancyClass = () => {
    if (!isOpen) return styles.closed;
    if (peopleCount === 0) return styles.empty;
    if (occupancyPercentage <= 30) return styles.low;
    if (occupancyPercentage <= 69) return styles.medium;
    return styles.high;
  };

  const getOccupancyLevel = () => {
    if (!isOpen) return "закрыто";
    if (peopleCount === 0) return "свободно";
    if (occupancyPercentage <= 30) return `${occupancyPercentage}% от max`;
    if (occupancyPercentage <= 69) return `${occupancyPercentage}% от max`;
    return `${occupancyPercentage}% от max`;
  };

  return (
    <div className={styles.widgetContent}>
      <div className={styles.widgetHeader}>
        <img src={QueueIcon} alt="checkout" />
        <div className={styles.headerText}>
          <h2>{name}</h2>
          <p>{description}</p>
        </div>
      </div>
      <div className={styles.widgetBody}>
        <div className={styles.numPeople}>
          {!isOpen ? (
            <p className={styles.closedText}>Закрыто</p>
          ) : peopleCount === 0 ? (
            <p className={styles.emptyText}>Свободно</p>
          ) : (
            <>
              <h3>{peopleCount}</h3>
              <p>чел.</p>
            </>
          )}
        </div>
        <button className={`${styles.widgetButton} ${getOccupancyClass()}`}>
          <p>{getOccupancyLevel()}</p>
          <ArrowIcon />
        </button>
      </div>
    </div>
  );
};
