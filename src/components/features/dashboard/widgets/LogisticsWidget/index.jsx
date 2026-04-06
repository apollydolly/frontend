import React, { useState } from "react";
import SimpleBar from "simplebar-react";
import styles from "./LogisticsWidget.module.scss";
import LogisticsIcon from "@icons/logistics_icon.svg";
import CarIcon from "@icons/car_icon.svg";
import CarArriveIcon from "@icons/car_arrive.svg";
import TruckTimeIcon from "@icons/truck-time.svg";
import TruckTickIcon from "@icons/truck-tick.svg";
import ArrowIcon from "@icons/widget_button_icon.svg?react";

// Тестовые данные
const TEST_DATA = [
  {
    id: 1,
    carNumber: "А012АА",
    number: 78,
    unloadingProgress: 0,
    startTime: null,
    endTime: null,
    zoneId: 1,
  },
  {
    id: 2,
    carNumber: "В123ВС",
    number: 45,
    unloadingProgress: 65,
    startTime: "14:20",
    endTime: null,
    zoneId: 1,
  },
  {
    id: 3,
    carNumber: "С456СЕ",
    number: 92,
    unloadingProgress: 30,
    startTime: "15:10",
    endTime: null,
    zoneId: 2,
  },
  {
    id: 4,
    carNumber: "Е789ЕК",
    number: 23,
    unloadingProgress: 100,
    startTime: "13:45",
    endTime: "16:15",
    zoneId: 2,
  },
  {
    id: 5,
    carNumber: "К012КТ",
    number: 57,
    unloadingProgress: 100,
    startTime: "12:30",
    endTime: "14:45",
    zoneId: 3,
  },
  {
    id: 6,
    carNumber: "М345МА",
    number: 81,
    unloadingProgress: 45,
    startTime: "16:00",
    endTime: null,
    zoneId: 4,
  },
  {
    id: 7,
    carNumber: "Н678НО",
    number: 12,
    unloadingProgress: 100,
    startTime: "11:15",
    endTime: "13:30",
    zoneId: 5,
  },
];

// Функция для получения уникальных зон из данных
const getZonesFromData = () => {
  const zoneIds = [...new Set(TEST_DATA.map((item) => item.zoneId))];
  return zoneIds.map((id) => ({
    id,
    name: `Зона ${id}`,
  }));
};

// Функция для определения статуса
const getStatus = (unloadingProgress) => {
  if (unloadingProgress === 0) return "arrival";
  if (unloadingProgress === 100) return "completed";
  return "unloading";
};

// Функция для получения данных статуса
const getStatusData = (unloadingProgress) => {
  const status = getStatus(unloadingProgress);

  switch (status) {
    case "arrival":
      return {
        status: "arrival",
        icon: CarArriveIcon,
        text: "Прибытие",
        label: "Прибытие",
        className: styles.statusArrival,
      };
    case "unloading":
      return {
        status: "unloading",
        icon: TruckTimeIcon,
        text: `Разгрузка ${unloadingProgress}%`,
        label: "Разгрузка",
        className: styles.statusUnloading,
      };
    case "completed":
      return {
        status: "completed",
        icon: TruckTickIcon,
        text: "Завершено",
        label: "Завершено",
        className: styles.statusCompleted,
      };
    default:
      return {
        status: "arrival",
        icon: CarArriveIcon,
        text: "Прибытие",
        label: "Прибытие",
        className: styles.statusArrival,
      };
  }
};

// Компонент зоны
const ZoneTabs = ({ zones, activeZone, onZoneChange }) => {
  const containerRef = React.useRef(null);
  const [showLeftGradient, setShowLeftGradient] = useState(false);
  const [showRightGradient, setShowRightGradient] = useState(false);

  // Проверяем, можно ли прокручивать
  const checkScroll = () => {
    const container = containerRef.current;
    if (container) {
      const { scrollLeft, scrollWidth, clientWidth } = container;
      setShowLeftGradient(scrollLeft > 0);
      setShowRightGradient(scrollLeft + clientWidth < scrollWidth - 1);
    }
  };

  // Прячем нативные полосы прокрутки
  React.useEffect(() => {
    const container = containerRef.current;
    if (container) {
      container.style.overflow = "hidden";

      const handleWheel = (e) => {
        e.preventDefault();
        container.scrollLeft += e.deltaY;
        checkScroll();
      };

      const handleScroll = () => {
        checkScroll();
      };

      container.addEventListener("wheel", handleWheel, { passive: false });
      container.addEventListener("scroll", handleScroll);

      // Инициализируем состояние градиентов
      checkScroll();

      return () => {
        container.removeEventListener("wheel", handleWheel);
        container.removeEventListener("scroll", handleScroll);
      };
    }
  }, []);

  // Добавляем resize observer для изменения размеров контейнера
  React.useEffect(() => {
    const container = containerRef.current;
    if (container) {
      const resizeObserver = new ResizeObserver(() => {
        checkScroll();
      });
      resizeObserver.observe(container);
      return () => resizeObserver.disconnect();
    }
  }, []);

  return (
    <div className={styles.zonesWrapper}>
      {showLeftGradient && (
        <div
          className={`${styles.scrollGradient} ${styles.scrollGradientLeft}`}
        />
      )}
      <div ref={containerRef} className={styles.zonesContainer}>
        {zones.map((zone) => (
          <button
            key={zone.id}
            className={`${styles.zoneItem} ${
              activeZone === zone.id ? styles.zoneItemActive : ""
            }`}
            onClick={() => onZoneChange(zone.id)}
          >
            <p>{zone.name}</p>
          </button>
        ))}
      </div>
      {showRightGradient && (
        <div
          className={`${styles.scrollGradient} ${styles.scrollGradientRight}`}
        />
      )}
    </div>
  );
};

export const LogisticsWidget = () => {
  const [activeZone, setActiveZone] = useState(0);
  const allZones = [
    { id: 0, name: "Все зоны" },
    ...getZonesFromData(),
    { id: 6, name: "Зона 6" }, // Пустые зоны (без данных)
    { id: 7, name: "Зона 7" },
  ];

  // Получаем данные для активной зоны
  const getDataForZone = () => {
    if (activeZone === 0) {
      // Все зоны - показываем все данные
      return TEST_DATA;
    }
    // Конкретная зона - фильтруем по zoneId
    return TEST_DATA.filter((item) => item.zoneId === activeZone);
  };

  const currentData = getDataForZone();
  const total = currentData.length;

  return (
    <div className={styles.widgetContent}>
      <div className={styles.widgetHeader}>
        <img src={LogisticsIcon} alt="logistics" />
        <div className={styles.headerText}>
          <h2>Логистика</h2>
          <p>Разгрузка транспортных средств</p>
        </div>
      </div>
      <div className={styles.total}>
        <ZoneTabs
          zones={allZones}
          activeZone={activeZone}
          onZoneChange={setActiveZone}
        />
        <button className={styles.widgetButton}>
          <p>подробнее</p>
          <ArrowIcon />
        </button>
      </div>
      <div className={styles.widgetBody}>
        <SimpleBar
          className={styles.simplebarContainer}
          style={{
            width: "100%",
            height: "475px",
          }}
          autoHide={false}
          forceVisible="y"
        >
          <div className={styles.totalText}>
            <h3>Всего:</h3>
            <p>{total}</p>
          </div>
          <div className={styles.graphsContainer}>
            {currentData.map((item) => {
              const statusData = getStatusData(item.unloadingProgress);
              const percentage = item.unloadingProgress;

              const fillClassName = `${styles.fill} ${
                statusData.status === "completed"
                  ? styles.fillCompleted
                  : statusData.status === "arrival"
                  ? styles.fillArrival
                  : ""
              }`;

              return (
                <div key={item.id} className={styles.graphBlock}>
                  <div className={styles.lineHeader}>
                    <div className={styles.lineHeaderText}>
                      <img src={CarIcon} alt="car" />
                      <div className={styles.lineHeaderText_text}>
                        <h4>{item.carNumber}</h4>
                        <p>{item.number}</p>
                      </div>
                    </div>
                    <div className={`${styles.status} ${statusData.className}`}>
                      <img src={statusData.icon} alt={statusData.label} />
                      <p>{statusData.text}</p>
                    </div>
                  </div>
                  <div className={styles.lineGraph}>
                    <div
                      className={fillClassName}
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                  {(item.startTime || item.endTime) && (
                    <div className={styles.graphSign}>
                      <div className={styles.signTime}>
                        {item.startTime && (
                          <>
                            <h3>Начало:</h3>
                            <p>{item.startTime}</p>
                          </>
                        )}
                      </div>
                      <div className={styles.signTime}>
                        {item.endTime && (
                          <>
                            <h3>Конец:</h3>
                            <p>{item.endTime}</p>
                          </>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
            {currentData.length === 0 && (
              <div className={styles.emptyState}>
                <p>В этой зоне нет транспортных средств</p>
              </div>
            )}
          </div>
        </SimpleBar>
      </div>
    </div>
  );
};
