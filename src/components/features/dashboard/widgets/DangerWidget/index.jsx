import React, { useState, useEffect } from "react";
import styles from "./DangerWidget.module.scss";
import FireIcon from "@icons/fire.svg?react";
import ArrowIcon from "@icons/widget_button_icon.svg?react";

export const DangerWidget = ({
  data = {},
  widgetId,
  widgetType,
  onViewDetails,
}) => {
  const [event, setEvent] = useState(data.event || null);
  const [eventData, setEventData] = useState(data);
  const [timer, setTimer] = useState(null);

  useEffect(() => {
    console.log(`DangerWidget ${widgetId} received data:`, data);
  }, [data, widgetId]);

  // Эффект для обработки входящих данных
  useEffect(() => {
    console.log(`Processing data for DangerWidget ${widgetId}:`, {
      event: data.event,
      event_info: data.event_info,
      eventDate: data.eventDate,
      timestamp: data.timestamp,
      image_id: data.image_id,
      rawData: data,
    });

    let newEvent = data.event;

    if (!newEvent && data.event_info) {
      const lowerEventInfo = data.event_info.toLowerCase().trim();
      if (lowerEventInfo === "fire" || lowerEventInfo === "smoke") {
        newEvent = lowerEventInfo;
      }
    }

    if (newEvent && (newEvent === "fire" || newEvent === "smoke")) {
      console.log(
        `Опасность обнаружена в виджете ${widgetId}: ${newEvent}`,
        data
      );

      setEvent(newEvent);
      setEventData(data);

      // Сбрасываем предыдущий таймер
      if (timer) {
        clearTimeout(timer);
      }

      const newTimer = setTimeout(() => {
        console.log(`Событие ${newEvent} сброшено через 5 секунд`);
        setEvent(null);
      }, 5000); // 5 секунд

      setTimer(newTimer);
    }
  }, [
    data.event,
    data.event_info,
    data.eventDate,
    data.timestamp,
    data.image_id,
    widgetId,
  ]);

  // Очистка таймера при размонтировании
  useEffect(() => {
    return () => {
      if (timer) {
        clearTimeout(timer);
      }
    };
  }, [timer]);

  const handleButtonClick = () => {
    if (event) {
      const fullEventData = {
        event: event,
        event_date: eventData.eventDate || eventData.timestamp,
        image_id: eventData.image_id,
        server_id: eventData.server_id,
        rawData: eventData,
      };

      // Вызываем обработчик для открытия модального окна
      if (onViewDetails) {
        onViewDetails(fullEventData);
      }
    }
  };

  return (
    <div className={styles.widgetContent}>
      <div className={styles.widgetHeader}>
        <FireIcon
          className={`${styles.fireIcon} ${event ? styles.dangerActive : ""}`}
        />
        <div className={styles.headerText}>
          <h2>Опасность для жизни</h2>
          <p>Задымление, огонь</p>
        </div>
      </div>
      <div className={styles.widgetBody}>
        {event === "fire" ? (
          <p className={styles.dangerText}>Обнаружен огонь!</p>
        ) : event === "smoke" ? (
          <p className={styles.dangerText}>Обнаружен дым!</p>
        ) : event == null ? (
          <p className={styles.emptyText}>Не обнаружено.</p>
        ) : (
          <p className={styles.emptyText}>Неизвестное событие.</p>
        )}
        {event && (
          <button className={styles.widgetButton} onClick={handleButtonClick}>
            <p>перейти</p>
            <ArrowIcon />
          </button>
        )}
      </div>
    </div>
  );
};
