import React, { useState, useEffect, useRef } from "react";
import styles from "./DangersLargeWidget.module.scss";
import FireIcon from "@icons/fire.svg?react";
import ViolationsIcon from "@icons/violations.svg?react";
import ThreatsIcon from "@icons/threats.svg?react";
import EventIcon from "@icons/event_empty.svg?react";
import ArrowIcon from "@icons/widget_button_icon.svg?react";
import SimpleBar from "simplebar-react";

// Компонент для текста с обрезкой
const TruncatedText = ({ text, className = "" }) => {
  const textRef = useRef(null);
  const [isTruncated, setIsTruncated] = useState(false);

  // Проверяем, обрезан ли текст
  useEffect(() => {
    const checkTruncation = () => {
      if (textRef.current) {
        const element = textRef.current;
        const isTextTruncated = element.scrollWidth > element.clientWidth;
        setIsTruncated(isTextTruncated);
      }
    };

    checkTruncation();
    // Повторно проверяем при изменении размера окна
    window.addEventListener("resize", checkTruncation);
    return () => window.removeEventListener("resize", checkTruncation);
  }, [text]);

  return (
    <p
      ref={textRef}
      className={`${styles.truncate} ${className}`}
      title={isTruncated ? text : undefined}
    >
      {text}
    </p>
  );
};

// определение типа события
const getEventType = (event) => {
  switch (event) {
    case "fire":
      return {
        type: "danger",
        icon: FireIcon,
        title: "Опасность для жизни",
        description: "Обнаружен огонь!",
        shouldBlink: true,
      };
    case "smoke":
      return {
        type: "danger",
        icon: FireIcon,
        title: "Опасность для жизни",
        description: "Обнаружен дым!",
        shouldBlink: true,
      };
    case "nohelmet":
      return {
        type: "violation",
        icon: ViolationsIcon,
        title: "Нарушения",
        description: "Нет каски!",
        shouldBlink: false,
      };
    case "novest":
      return {
        type: "violation",
        icon: ViolationsIcon,
        title: "Нарушения",
        description: "Нет жилета!",
        shouldBlink: false,
      };
    case "conflict":
      return {
        type: "threat",
        icon: ThreatsIcon,
        title: "Угрозы",
        description: "Конфликт!",
        shouldBlink: false,
      };
    case "crowd":
      return {
        type: "threat",
        icon: ThreatsIcon,
        title: "Угрозы",
        description: "Скопление толпы!",
        shouldBlink: false,
      };
    default:
      return {
        type: "unknown",
        icon: EventIcon,
        title: "Неизвестное событие",
        description: "Неизвестное событие",
        shouldBlink: false,
      };
  }
};

// Функция для форматирования даты
const formatDate = (dateString) => {
  const date = dateString ? new Date(dateString) : new Date();
  const days = [
    "Воскресенье",
    "Понедельник",
    "Вторник",
    "Среда",
    "Четверг",
    "Пятница",
    "Суббота",
  ];
  const months = [
    "января",
    "февраля",
    "марта",
    "апреля",
    "мая",
    "июня",
    "июля",
    "августа",
    "сентября",
    "октября",
    "ноября",
    "декабря",
  ];

  const dayName = days[date.getDay()];
  const day = date.getDate();
  const month = months[date.getMonth()];

  return `${dayName}, ${day} ${month}`;
};

// Функция для форматирования времени
const formatTime = (dateString) => {
  if (!dateString) return "Н/Д";
  const date = new Date(dateString);
  return date.toLocaleTimeString("ru-RU", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

// Тестовые данные для истории событий
const historyEventsData = [
  {
    date: "Понедельник, 15 января",
    events: [
      {
        event: "fire",
        eventDate: "2024-01-15T11:30:00",
        location: "Склад",
      },
      {
        event: "nohelmet",
        eventDate: "2024-01-15T11:30:00",
        location: "Подъездная дорога с очень длинным названием",
      },
      {
        event: "smoke",
        eventDate: "2024-01-15T10:15:00",
        location: "Цех №3",
      },
    ],
  },
  {
    date: "Воскресенье, 14 января",
    events: [
      {
        event: "conflict",
        eventDate: "2024-01-14T14:20:00",
        location: "Офисное помещение для совещаний и переговоров",
      },
    ],
  },
  {
    date: "Суббота, 13 января",
    events: [], // Пустой день без событий
  },
];

// Тестовые данные для текущего события
const testEvents = [
  {
    event: "fire",
    eventDate: "2024-01-20T15:00:00",
    timestamp: "2024-01-20T15:00:00",
    location: "Склад Северный с очень длинным названием",
    image_id: "img_fire_001",
    server_id: "server_1",
  },
  {
    event: "nohelmet",
    eventDate: "2024-01-20T14:30:00",
    timestamp: "2024-01-20T14:30:00",
    location: "Строительная площадка",
    image_id: "img_nohelmet_001",
    server_id: "server_1",
  },
  {
    event: "conflict",
    eventDate: "2024-01-20T14:00:00",
    timestamp: "2024-01-20T14:00:00",
    location: "Офисный корпус",
    image_id: "img_conflict_001",
    server_id: "server_1",
  },
  {
    event: "smoke",
    eventDate: "2024-01-20T13:45:00",
    timestamp: "2024-01-20T13:45:00",
    location: "Комната серверов",
    image_id: "img_smoke_001",
    server_id: "server_1",
  },
  null, // Для случая отсутствия события
];

export const DangersLargeWidget = ({
  data = {},
  widgetId,
  widgetType,
  onViewDetails,
}) => {
  const [event, setEvent] = useState(null);
  const [eventData, setEventData] = useState(null);
  const [timer, setTimer] = useState(null);
  const [currentEventIndex, setCurrentEventIndex] = useState(0);

  // Тестовый эффект для имитации получения событий
  useEffect(() => {
    // Имитация получения данных с сервера - циклическое переключение между тестовыми событиями
    const interval = setInterval(() => {
      const testEvent = testEvents[currentEventIndex];

      if (testEvent) {
        console.log(`Новое событие в виджете ${widgetId}:`, testEvent.event);
        setEvent(testEvent.event);
        setEventData(testEvent);
      } else {
        console.log(`Событие сброшено в виджете ${widgetId}`);
        setEvent(null);
        setEventData(null);
      }

      // Сбрасываем предыдущий таймер
      if (timer) {
        clearTimeout(timer);
      }

      // Устанавливаем таймер сброса только для не-null событий
      if (testEvent) {
        const newTimer = setTimeout(() => {
          console.log(`Событие ${testEvent.event} сброшено через 5 секунд`);
          setEvent(null);
          setEventData(null);
        }, 5000);
        setTimer(newTimer);
      }

      // Переход к следующему тестовому событию
      setCurrentEventIndex((prev) => (prev + 1) % testEvents.length);
    }, 8000); // Новое событие каждые 8 секунд

    return () => {
      clearInterval(interval);
      if (timer) {
        clearTimeout(timer);
      }
    };
  }, [currentEventIndex, timer, widgetId]);

  // Очистка таймера при размонтировании
  useEffect(() => {
    return () => {
      if (timer) {
        clearTimeout(timer);
      }
    };
  }, [timer]);

  const handleButtonClick = () => {
    if (event && eventData) {
      const fullEventData = {
        event: event,
        event_date: eventData.eventDate || eventData.timestamp,
        image_id: eventData.image_id,
        server_id: eventData.server_id,
        rawData: eventData,
      };

      if (onViewDetails) {
        onViewDetails(fullEventData);
      }
    }
  };

  // Получаем информацию о текущем событии
  const getCurrentEventInfo = () => {
    if (!event) {
      return {
        hasEvent: false,
        date: formatDate(new Date()),
        description: "Сейчас нет событий",
        icon: EventIcon,
        showIcon: true,
        showTimeAndLocation: false,
        isDanger: false,
        isThreat: false,
        isViolation: false,
        shouldBlink: false,
      };
    }

    const eventType = getEventType(event);
    const location = eventData?.location || "Неизвестное место";
    const time = eventData ? formatTime(eventData.eventDate) : "Н/Д";
    const date = eventData
      ? formatDate(eventData.eventDate)
      : formatDate(new Date());

    return {
      hasEvent: true,
      date,
      description: eventType.description,
      location,
      time,
      icon: eventType.icon,
      showIcon: true,
      showTimeAndLocation: true,
      isDanger: eventType.type === "danger",
      isThreat: eventType.type === "threat",
      isViolation: eventType.type === "violation",
      shouldBlink: eventType.shouldBlink,
    };
  };

  const currentEventInfo = getCurrentEventInfo();
  const CurrentIcon = currentEventInfo.icon;

  return (
    <div className={styles.widgetContent}>
      <div className={styles.widgetHeader}>
        <ThreatsIcon className={styles.fireIcon} />
        <div className={styles.headerText}>
          <h2>Нарушения, угрозы и опасность для жизни</h2>
          <p>События, влияющие на здоровье и жизнь людей</p>
        </div>
      </div>
      <div className={styles.widgetBody}>
        <div
          className={`${styles.currentEvent} ${currentEventInfo.isDanger ? styles.currentEventDanger : ""}`}
        >
          <CurrentIcon
            className={`${styles.fireIcon} ${styles.current} ${currentEventInfo.hasEvent ? styles.dangerActive : ""} ${currentEventInfo.shouldBlink ? styles.iconBlink : ""}`}
          />
          <div className={`${styles.eventInfo} ${styles.first}`}>
            <h3>{currentEventInfo.date}</h3>
            <p
              className={
                currentEventInfo.hasEvent ? styles.dangerText : styles.emptyText
              }
            >
              {currentEventInfo.description}
            </p>
          </div>
          {currentEventInfo.showTimeAndLocation && (
            <div className={`${styles.eventInfo} ${styles.second}`}>
              <h3>{currentEventInfo.time}</h3>
              <TruncatedText text={currentEventInfo.location} />
            </div>
          )}
          {currentEventInfo.hasEvent && (
            <button
              className={`${styles.widgetButton} ${currentEventInfo.isDanger ? styles.dangerButton : ""}`}
              onClick={handleButtonClick}
            >
              <p>перейти</p>
              <ArrowIcon />
            </button>
          )}
        </div>
        <div className={styles.eventHistory}>
          <div className={styles.eventHistoryHeader}>
            <h3>История событий</h3>
          </div>
          <SimpleBar
            className={styles.simplebarContainer}
            style={{
              width: "100%",
              height: "219px",
            }}
            autoHide={false}
            forceVisible="y"
          >
            <div className={styles.historyList}>
              {historyEventsData.map((day, dayIndex) => (
                <div key={dayIndex} className={styles.historyDate}>
                  <h2>{day.date}</h2>
                  {day.events.length > 0 ? (
                    day.events.map((historyEvent, eventIndex) => {
                      const eventType = getEventType(historyEvent.event);
                      const HistoryIcon = eventType.icon;
                      const isDangerEvent = eventType.type === "danger";

                      return (
                        <div key={eventIndex} className={styles.historyItem}>
                          <HistoryIcon
                            className={`${styles.fireIcon} ${isDangerEvent ? styles.historyDanger : ""}`}
                          />
                          <div className={styles.historyEventData}>
                            <div
                              className={`${styles.historyEventInfo} ${styles.first}`}
                            >
                              <h3>{eventType.title}</h3>
                              <p>{eventType.description}</p>
                            </div>
                            <div
                              className={`${styles.historyEventInfo} ${styles.second}`}
                            >
                              <h3>Время</h3>
                              <p>{formatTime(historyEvent.eventDate)}</p>
                            </div>
                            <div
                              className={`${styles.historyEventInfo} ${styles.third}`}
                            >
                              <h3>Помещение</h3>
                              <TruncatedText text={historyEvent.location} />
                            </div>
                          </div>
                          <button className={styles.historyWdgetButton}>
                            <ArrowIcon />
                          </button>
                        </div>
                      );
                    })
                  ) : (
                    <p>Событий и угроз не обнаружено.</p>
                  )}
                </div>
              ))}
            </div>
          </SimpleBar>
        </div>
      </div>
    </div>
  );
};
