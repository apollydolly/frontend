import React from "react";
import styles from "../widgets.module.scss";
import Icon from "@icons/queue_icon.svg";

export const MeetingInfoWidget = ({}) => {
  return (
    <div className={styles.widgetContent}>
      <div className={styles.widgetHeader}>
        <img src={Icon} alt="icon" />
        <div className={styles.headerText}>
          <h2>Информация о встрече</h2>
          <p>Название, длительность, участники</p>
        </div>
      </div>
      <div className={styles.widgetBody}>
        <div className={styles.widgetText}>
          <h2>Название встречи:</h2>
          <p>Собеседование на должность Junior Frontend-разработчика</p>
        </div>
        <div className={styles.widgetText}>
          <h2>Длительность:</h2>
          <p>6 мин. 56 сек.</p>
        </div>
        <div className={styles.widgetText}>
          <h2>Участники:</h2>
          <p>Кандидат (Головачева Полина), Рекрутер (разговорный ассистент)</p>
        </div>
      </div>
    </div>
  );
};
