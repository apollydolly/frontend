import React from "react";
import styles from "./NotificationsWidget.module.scss";
import NotificationsIcon from "@icons/notifications.svg";
import ArrowIcon from "@icons/widget_button_icon.svg?react";

export const NotificationsWidget = ({ data = {}, widgetId, widgetType }) => {
  const {
    numberNotifications = 127,
    name = "Уведомления",
    description = "сегодня",
  } = data;

  return (
    <div className={styles.widgetContent}>
      <div className={styles.widgetHeader}>
        <img src={NotificationsIcon} alt="Notifications" />
        <div className={styles.headerText}>
          <h2>{name}</h2>
          <p>{description}</p>
        </div>
      </div>
      <div className={styles.widgetBody}>
        <div className={styles.numPeople}>
          <h3>{numberNotifications}</h3>
        </div>
        <button className={`${styles.widgetButton} ${styles.medium}`}>
          <p>все уведомления</p>
          <ArrowIcon />
        </button>
      </div>
    </div>
  );
};
