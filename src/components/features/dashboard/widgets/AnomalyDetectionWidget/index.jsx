import React, { useState, useMemo } from "react";
import SimpleBar from "simplebar-react";
import styles from "./AnomalyDetectionWidget.module.scss";
import AnomalyDetectionIcon from "@icons/anomaly_detection.svg";
import ArrowIcon from "@icons/arrow_blue.svg";
import WarningIcon from "@icons/warning.svg";

// Тестовые данные
const mockAnalyticsData = [
  {
    id: "ck0h01-1",
    name: "Посетитель ck0h01",
    entry: "14:45",
    category: "today",
    gender: "Мужчина",
    age: "45-55 лет",
    zone: "Мясо",
    activity: "Частые движения между зонами без покупок",
  },
  {
    id: "dk3s07-1",
    name: "Посетитель dk3s07",
    entry: "16:30",
    category: "today",
    gender: "Женщина",
    age: "30-40 лет",
    zone: "Напитки",
    activity: "Долгое пребывание в зоне без взаимодействия",
  },
  {
    id: "ck0h01-2",
    name: "Посетитель ck0h01",
    entry: "14:45",
    category: "yesterday",
    gender: "Мужчина",
    age: "45-55 лет",
    zone: "Мясо",
    activity: "Частые движения между зонами без покупок",
  },
  {
    id: "ck0h01-3",
    name: "Посетитель ck0h01",
    entry: "14:45",
    category: "yesterday",
    gender: "Мужчина",
    age: "45-55 лет",
    zone: "Мясо",
    activity: "Частые движения между зонами без покупок",
  },
  {
    id: "ck0h01-4",
    name: "Посетитель ck0h01",
    entry: "14:45",
    category: "yesterday",
    gender: "Мужчина",
    age: "45-55 лет",
    zone: "Мясо",
    activity: "Частые движения между зонами без покупок",
  },
  {
    id: "ck0h01-5",
    name: "Посетитель ck0h01",
    entry: "14:45",
    category: "yesterday",
    gender: "Мужчина",
    age: "45-55 лет",
    zone: "Мясо",
    activity: "Частые движения между зонами без покупок",
  },
  {
    id: "ck0h01-6",
    name: "Посетитель ck0h01",
    entry: "14:45",
    category: "yesterday",
    gender: "Мужчина",
    age: "45-55 лет",
    zone: "Мясо",
    activity: "Частые движения между зонами без покупок",
  },
  {
    id: "ck0h01-7",
    name: "Посетитель ck0h01",
    entry: "14:45",
    category: "yesterday",
    gender: "Мужчина",
    age: "45-55 лет",
    zone: "Мясо",
    activity: "Частые движения между зонами без покупок",
  },
  {
    id: "ck0h01-8",
    name: "Посетитель ck0h01",
    entry: "14:45",
    category: "week",
    gender: "Мужчина",
    age: "45-55 лет",
    zone: "Мясо",
    activity: "Частые движения между зонами без покупок",
  },
  {
    id: "ck0h01-9",
    name: "Посетитель ck0h01",
    entry: "14:45",
    category: "week",
    gender: "Мужчина",
    age: "45-55 лет",
    zone: "Мясо",
    activity: "Частые движения между зонами без покупок",
  },
  {
    id: "ck0h01-10",
    name: "Посетитель ck0h01",
    entry: "14:45",
    category: "month",
    gender: "Мужчина",
    age: "45-55 лет",
    zone: "Мясо",
    activity: "Частые движения между зонами без покупок",
  },
];

export const AnomalyDetectionWidget = () => {
  const [activeTab, setActiveTab] = useState("today");
  const [analyticsData] = useState(mockAnalyticsData);

  // Подсчет количества посетителей по категориям
  const categoryCounts = useMemo(() => {
    const routes = analyticsData || [];
    return {
      today: routes.filter((route) => route.category === "today").length,
      yesterday: routes.filter((route) => route.category === "yesterday")
        .length,
      week: routes.filter((route) => route.category === "week").length,
      month: routes.filter((route) => route.category === "month").length,
    };
  }, [analyticsData]);

  // Фильтрация посетителей по активной вкладке
  const filteredRoutes = useMemo(() => {
    const routes = analyticsData || [];
    return routes.filter((route) => route.category === activeTab);
  }, [analyticsData, activeTab]);

  const handleTabClick = (category) => {
    setActiveTab(category);
  };

  // Являются ли данные пустыми
  const isEmpty = !analyticsData || analyticsData.length === 0;

  return (
    <div className={styles.widgetContent}>
      <div className={styles.widgetHeader}>
        <img src={AnomalyDetectionIcon} alt="anomaly detection" />
        <div className={styles.headerText}>
          <h2>Детекция аномалий</h2>
          <p>Автоматическое обнаружение подозрительной активности</p>
        </div>
      </div>
      <div className={styles.widgetBody}>
        <div className={styles.movePatterns}>
          <div className={styles.patternsHeader}>
            <h3>Список аномалий</h3>
            <p>Необычное или опасное движение посетителей</p>
          </div>
          <div className={styles.patternsTabs}>
            <div
              className={`${styles.patternTab} ${activeTab === "today" ? styles.active : ""}`}
              onClick={() => handleTabClick("today")}
            >
              <h3>Сегодня</h3>
              <p>{categoryCounts.today}</p>
            </div>
            <div
              className={`${styles.patternTab} ${activeTab === "yesterday" ? styles.active : ""}`}
              onClick={() => handleTabClick("yesterday")}
            >
              <h3>Вчера</h3>
              <p>{categoryCounts.yesterday}</p>
            </div>
            <div
              className={`${styles.patternTab} ${activeTab === "week" ? styles.active : ""}`}
              onClick={() => handleTabClick("week")}
            >
              <h3>Неделя</h3>
              <p>{categoryCounts.week}</p>
            </div>
            <div
              className={`${styles.patternTab} ${activeTab === "month" ? styles.active : ""}`}
              onClick={() => handleTabClick("month")}
            >
              <h3>Месяц</h3>
              <p>{categoryCounts.month}</p>
            </div>
          </div>
        </div>
        <div className={styles.routesListContainer}>
          <SimpleBar
            className={styles.simplebarContainer}
            style={{
              width: "100%",
              height: "412px",
            }}
            autoHide={false}
            forceVisible="y"
          >
            {isEmpty ? (
              <div className={styles.emptyState}>
                <p>Анализ еще не готов.</p>
              </div>
            ) : filteredRoutes.length === 0 ? (
              <div className={styles.emptyState}>
                <p>Аномалии в этот период не обнаружены.</p>
              </div>
            ) : (
              <div className={styles.routesList}>
                {filteredRoutes.map((route) => (
                  <div key={route.id} className={styles.routeItem}>
                    <div className={styles.routeItemHeader}>
                      <div className={styles.warning}>
                        <img src={WarningIcon} alt="warning" />
                        <p>Подозрительная активность:</p>
                      </div>
                      <p>{route.activity}</p>
                    </div>
                    <div className={styles.routeItemBody}>
                      <div className={styles.routeInfo}>
                        <div className={styles.routeInfoHeader}>
                          <h3>{route.name}</h3>
                          <p>Вход: {route.entry}</p>
                        </div>
                        <button className={styles.details}>
                          <p>Подробнее</p>
                          <img src={ArrowIcon} alt="arrow" />
                        </button>
                      </div>
                      <div className={styles.line}></div>
                      <div className={styles.genderAgeBlock}>
                        <div className={styles.genderBlock}>
                          <p>{route.gender}</p>
                        </div>
                        <div className={styles.genderBlock}>
                          <p>{route.age}</p>
                        </div>
                      </div>
                      <div className={styles.line}></div>
                      <div className={styles.currentZone}>
                        <div className={styles.currentZoneInfo}>
                          <h3>Текущая зона</h3>
                          <p>{route.zone}</p>
                        </div>
                        <button className={styles.details}>
                          <p>Наблюдение</p>
                          <img src={ArrowIcon} alt="arrow" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </SimpleBar>
        </div>
      </div>
    </div>
  );
};
