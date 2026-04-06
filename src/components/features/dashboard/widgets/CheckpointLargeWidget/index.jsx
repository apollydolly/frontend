import React, { useState, useMemo, useRef, useEffect } from "react";
import SimpleBar from "simplebar-react";
import styles from "./CheckpointLargeWidget.module.scss";
import CheckpointIcon from "@icons/checkpoint.svg";
import CarIcon from "@icons/car_icon.svg";
import TruckIcon from "@icons/car_arrive.svg";
import BusIcon from "@icons/bus.svg";
import MotoIcon from "@icons/moto.svg";
import ArrowIcon from "@icons/widget_button_icon.svg?react";

// Тестовые данные
const TEST_DATA = [
  {
    id: 1,
    dateGroup: "Сегодня",
    vehicleType: "Грузовой автомобиль",
    carNumber: "А012АА",
    cargoNumber: 78,
    checkpoint: "КПП 1",
    entryTime: "11:30",
    exitTime: "12:30",
    icon: TruckIcon,
  },
  {
    id: 2,
    dateGroup: "Сегодня",
    vehicleType: "Легковой автомобиль",
    carNumber: "В123ВС",
    cargoNumber: 45,
    checkpoint: "Главный вход",
    entryTime: "14:20",
    exitTime: "15:45",
    icon: CarIcon,
  },
  {
    id: 3,
    dateGroup: "Сегодня",
    vehicleType: "Автобус",
    carNumber: "С456СЕ",
    cargoNumber: 92,
    checkpoint: "КПП 2",
    entryTime: "15:10",
    exitTime: "16:30",
    icon: BusIcon,
  },
  {
    id: 4,
    dateGroup: "Сегодня",
    vehicleType: "Мотоцикл",
    carNumber: "Е789ЕК",
    cargoNumber: 23,
    checkpoint: "Въезд к складским помещениям",
    entryTime: "13:45",
    exitTime: "16:15",
    icon: MotoIcon,
  },
  {
    id: 5,
    dateGroup: "Вчера",
    vehicleType: "Грузовой автомобиль",
    carNumber: "К012КТ",
    cargoNumber: 57,
    checkpoint: "КПП 1",
    entryTime: "12:30",
    exitTime: "14:45",
    icon: TruckIcon,
  },
  {
    id: 6,
    dateGroup: "Вчера",
    vehicleType: "Легковой автомобиль",
    carNumber: "М345МА",
    cargoNumber: 81,
    checkpoint: "КПП 3",
    entryTime: "16:00",
    exitTime: "17:20",
    icon: CarIcon,
  },
  {
    id: 7,
    dateGroup: "Понедельник, 15 января",
    vehicleType: "Грузовой автомобиль",
    carNumber: "Н678НО",
    cargoNumber: 12,
    checkpoint: "КПП 1",
    entryTime: "11:15",
    exitTime: "13:30",
    icon: TruckIcon,
  },
  {
    id: 8,
    dateGroup: "Понедельник, 15 января",
    vehicleType: "Автобус",
    carNumber: "Р901РУ",
    cargoNumber: 34,
    checkpoint: "КПП 2",
    entryTime: "09:45",
    exitTime: "11:10",
    icon: BusIcon,
  },
  {
    id: 9,
    dateGroup: "Понедельник, 15 января",
    vehicleType: "Мотоцикл",
    carNumber: "Т234ТВ",
    cargoNumber: 67,
    checkpoint: "КПП 3",
    entryTime: "14:20",
    exitTime: "15:40",
    icon: MotoIcon,
  },
  {
    id: 10,
    dateGroup: "Воскресенье, 14 января",
  },
];

// Функция для получения уникальных КПП из данных
const getCheckpointsFromData = () => {
  const checkpoints = TEST_DATA.filter(
    (item) => item.checkpoint && item.checkpoint !== "",
  ).map((item) => item.checkpoint);

  const uniqueCheckpoints = [...new Set(checkpoints)];

  // Создаем объекты для вкладок
  return uniqueCheckpoints.map((checkpoint, index) => ({
    id: index + 1,
    name: checkpoint,
    value: checkpoint, // Используем название КПП как значение для фильтрации
  }));
};

// Компонент для отображения записи транспортного средства
const VehicleRecord = ({ vehicle }) => {
  if (!vehicle || !vehicle.vehicleType) {
    return null;
  }

  const checkpointRef = useRef(null);
  const [isTextTruncated, setIsTextTruncated] = useState(false);

  useEffect(() => {
    const checkTextTruncation = () => {
      if (checkpointRef.current) {
        const element = checkpointRef.current;
        const isTruncated = element.scrollWidth > element.clientWidth;
        setIsTextTruncated(isTruncated);
      }
    };

    checkTextTruncation();

    let resizeObserver;
    if (checkpointRef.current) {
      resizeObserver = new ResizeObserver(checkTextTruncation);
      resizeObserver.observe(checkpointRef.current);
    }

    window.addEventListener("resize", checkTextTruncation);

    return () => {
      if (resizeObserver && checkpointRef.current) {
        resizeObserver.unobserve(checkpointRef.current);
      }
      window.removeEventListener("resize", checkTextTruncation);
    };
  }, [vehicle.checkpoint]);

  return (
    <div className={styles.dayRecordsContainer}>
      <div className={styles.recordBlock}>
        <div className={styles.autoInfo}>
          <h3>{vehicle.vehicleType}</h3>
          <div className={styles.carInfo}>
            <img src={vehicle.icon} alt={vehicle.vehicleType} />
            <h3>{vehicle.carNumber}</h3>
            <p>{vehicle.cargoNumber}</p>
          </div>
        </div>
        <div className={styles.checkpointInfo}>
          <h3>КПП</h3>
          <div className={styles.checkpointTextContainer}>
            <span
              ref={checkpointRef}
              className={styles.checkpointText}
              title={isTextTruncated ? vehicle.checkpoint : undefined}
            >
              {vehicle.checkpoint}
            </span>
          </div>
        </div>
        <div className={styles.timeInfo}>
          <div className={styles.timeInfoBlock}>
            <h3>Въезд</h3>
            <p>{vehicle.entryTime}</p>
          </div>
          <div className={styles.timeInfoBlock}>
            <h3>Выезд</h3>
            <p>{vehicle.exitTime}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Компонент для отображения группы по дате
const DateGroup = ({ date, vehicles }) => {
  const isEmpty = vehicles.length === 0;

  return (
    <div className={styles.dayRecords}>
      <p>{date}</p>
      {isEmpty ? (
        <div className={styles.emptyText}>
          <p>Транспортных средств не обнаружено.</p>
        </div>
      ) : (
        vehicles.map((vehicle) => (
          <VehicleRecord key={vehicle.id} vehicle={vehicle} />
        ))
      )}
    </div>
  );
};

// Компонент вкладки КПП
const ZoneTabItem = ({ checkpoint, isActive, onClick }) => {
  const zoneRef = useRef(null);
  const textRef = useRef(null);
  const [isTextTruncated, setIsTextTruncated] = useState(false);

  useEffect(() => {
    const checkTextTruncation = () => {
      if (textRef.current) {
        const element = textRef.current;
        const isTruncated = element.scrollWidth > element.clientWidth;
        setIsTextTruncated(isTruncated);
      }
    };

    checkTextTruncation();

    let resizeObserver;
    if (textRef.current) {
      resizeObserver = new ResizeObserver(checkTextTruncation);
      resizeObserver.observe(textRef.current);
    }

    window.addEventListener("resize", checkTextTruncation);

    return () => {
      if (resizeObserver && textRef.current) {
        resizeObserver.unobserve(textRef.current);
      }
      window.removeEventListener("resize", checkTextTruncation);
    };
  }, [checkpoint.name]);

  return (
    <button
      ref={zoneRef}
      className={`${styles.zoneItem} ${isActive ? styles.zoneItemActive : ""}`}
      onClick={() => onClick(checkpoint.value)}
      title={isTextTruncated ? checkpoint.name : undefined}
    >
      <span ref={textRef} className={styles.zoneItemText}>
        {checkpoint.name}
      </span>
    </button>
  );
};

// Компонент вкладок КПП
const CheckpointTabs = ({
  checkpoints,
  activeCheckpoint,
  onCheckpointChange,
}) => {
  const containerRef = useRef(null);
  const [showLeftGradient, setShowLeftGradient] = useState(false);
  const [showRightGradient, setShowRightGradient] = useState(false);

  const checkScroll = () => {
    const container = containerRef.current;
    if (container) {
      const { scrollLeft, scrollWidth, clientWidth } = container;

      const epsilon = 2;
      const isAtStart = scrollLeft <= epsilon;
      const isAtEnd = scrollLeft + clientWidth >= scrollWidth - epsilon;

      setShowLeftGradient(!isAtStart);
      setShowRightGradient(!isAtEnd);
    }
  };

  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      container.style.overflow = "hidden";

      const handleWheel = (e) => {
        e.preventDefault();
        container.scrollLeft += e.deltaY;
      };

      const handleScroll = () => {
        checkScroll();
      };

      container.addEventListener("wheel", handleWheel, { passive: false });
      container.addEventListener("scroll", handleScroll);
      const timer = setTimeout(() => {
        checkScroll();
      }, 100);

      return () => {
        clearTimeout(timer);
        container.removeEventListener("wheel", handleWheel);
        container.removeEventListener("scroll", handleScroll);
      };
    }
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      const resizeObserver = new ResizeObserver(() => {});
      resizeObserver.observe(container);
      return () => resizeObserver.disconnect();
    }
  }, []);

  // Проверяем при изменении списка вкладок
  useEffect(() => {
    const timer = setTimeout(() => {
      checkScroll();
    }, 50);
    return () => clearTimeout(timer);
  }, [checkpoints]);

  return (
    <div className={styles.zonesWrapper}>
      {showLeftGradient && (
        <div
          className={`${styles.scrollGradient} ${styles.scrollGradientLeft}`}
        />
      )}
      <div ref={containerRef} className={styles.zonesContainer}>
        {checkpoints.map((checkpoint) => (
          <ZoneTabItem
            key={checkpoint.id}
            checkpoint={checkpoint}
            isActive={activeCheckpoint === checkpoint.value}
            onClick={onCheckpointChange}
          />
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

export const CheckpointLargeWidget = () => {
  const [activeCheckpoint, setActiveCheckpoint] = useState("Все КПП");

  // Получаем уникальные КПП из данных
  const realCheckpoints = getCheckpointsFromData();

  // Создаем все вкладки
  const allCheckpoints = useMemo(
    () => [{ id: 0, name: "Все КПП", value: "Все КПП" }, ...realCheckpoints],
    [],
  );

  // Функция фильтрации данных по выбранному КПП
  const getFilteredData = useMemo(() => {
    if (activeCheckpoint === "Все КПП") {
      return TEST_DATA;
    }

    return TEST_DATA.filter((item) => item.checkpoint === activeCheckpoint);
  }, [activeCheckpoint]);

  // Группируем отфильтрованные данные по датам
  const groupedData = useMemo(() => {
    const groups = getFilteredData.reduce((acc, item) => {
      const date = item.dateGroup || "Без даты";
      if (!acc[date]) {
        acc[date] = [];
      }
      if (item.vehicleType) {
        acc[date].push(item);
      }
      return acc;
    }, {});

    return Object.entries(groups).map(([date, vehicles]) => ({
      date,
      vehicles,
    }));
  }, [getFilteredData]);

  return (
    <div className={styles.widgetContent}>
      <div className={styles.widgetHeader}>
        <img src={CheckpointIcon} alt="checkpoint" />
        <div className={styles.headerText}>
          <h2>Движение транспортных средств</h2>
          <p>Проезд КПП</p>
        </div>
      </div>
      <div className={styles.total}>
        <CheckpointTabs
          checkpoints={allCheckpoints}
          activeCheckpoint={activeCheckpoint}
          onCheckpointChange={setActiveCheckpoint}
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
          <div className={styles.recordsContainer}>
            {groupedData.length > 0 ? (
              groupedData.map((group) => (
                <DateGroup
                  key={group.date}
                  date={group.date}
                  vehicles={group.vehicles}
                />
              ))
            ) : (
              <div className={styles.dayRecords}>
                <div className={styles.emptyText}>
                  <p>Транспортных средств не обнаружено.</p>
                </div>
              </div>
            )}
          </div>
        </SimpleBar>
      </div>
    </div>
  );
};
