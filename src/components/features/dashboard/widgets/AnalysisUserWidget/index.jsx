import React, { useState, useMemo } from "react";
import SimpleBar from "simplebar-react";
import styles from "./AnalysisUserWidget.module.scss";
import AnalysisUserIcon from "@icons/analysis_user.svg";
import ArrowIcon from "@icons/arrow_blue.svg";
import DoubleArrowIcon from "@icons/arrow_double.svg";
import AverageTimeIcon from "@icons/average_time.svg";
import AverageZonesIcon from "@icons/number_zones.svg";
import AverageAgeIcon from "@icons/average_age.svg";

// Тестовые данные
const mockAnalyticsData = {
  routes: [
    {
      id: "MK352L-1",
      name: "Маршрут №MK352L",
      visitors: 582,
      category: "popular",
      path: [
        "Вход",
        "Фрукты и овощи",
        "Рыба",
        "Алкоголь",
        "Акции",
        "Заморозка",
        "Бытовая химия",
        "Сыр",
        "Акции",
        "Касса",
      ],
    },
    {
      id: "MK352O-1",
      name: "Маршрут №MK352O",
      visitors: 700,
      category: "popular",
      path: [
        "Вход",
        "Кондитерские изделия",
        "Морепродукты",
        "Вода",
        "Специальные предложения",
        "Орехи",
        "Здоровое питание",
        "Консервы",
        "Соки",
        "Касса",
      ],
    },
    {
      id: "MK352L-2",
      name: "Маршрут №MK352L",
      visitors: 582,
      category: "highConversion",
      path: ["Вход", "Фрукты и овощи", "Акции", "Мясо", "Касса"],
    },
    {
      id: "MK352L-3",
      name: "Маршрут №MK352L",
      visitors: 582,
      category: "highConversion",
      path: ["Вход", "Молочные продукты", "Хлеб", "Акции", "Касса"],
    },
    {
      id: "MK352L-4",
      name: "Маршрут №MK352L",
      visitors: 582,
      category: "highConversion",
      path: ["Вход", "Молочные продукты", "Хлеб", "Акции", "Касса"],
    },
    {
      id: "MK352L-5",
      name: "Маршрут №MK352L",
      visitors: 582,
      category: "highConversion",
      path: ["Вход", "Молочные продукты", "Хлеб", "Акции", "Касса"],
    },
    {
      id: "MK352L-6",
      name: "Маршрут №MK352L",
      visitors: 582,
      category: "lowConversion",
      path: ["Вход", "Алкоголь", "Касса"],
    },
    {
      id: "MK352L-7",
      name: "Маршрут №MK352L",
      visitors: 582,
      category: "lowConversion",
      path: ["Вход", "Бытовая химия", "Касса"],
    },
    {
      id: "MK352L-8",
      name: "Маршрут №MK352L",
      visitors: 582,
      category: "anomaly",
      path: [
        "Вход",
        "Рыба",
        "Алкоголь",
        "Фрукты и овощи",
        "Бытовая химия",
        "Мясо",
        "Заморозка",
        "Сыр",
        "Акции",
        "Хлеб",
        "Молочные продукты",
        "Касса",
      ],
    },
  ],
  averageTime: 32,
  averageZones: 10,
  averageAge: 37,
};

export const AnalysisUserWidget = () => {
  const [activeTab, setActiveTab] = useState("popular");
  const [analyticsData] = useState(mockAnalyticsData);

  // Подсчет количества маршрутов по категориям
  const categoryCounts = useMemo(() => {
    const routes = analyticsData.routes || [];
    return {
      popular: routes.filter((route) => route.category === "popular").length,
      highConversion: routes.filter(
        (route) => route.category === "highConversion",
      ).length,
      lowConversion: routes.filter(
        (route) => route.category === "lowConversion",
      ).length,
      anomaly: routes.filter((route) => route.category === "anomaly").length,
    };
  }, [analyticsData.routes]);

  // Фильтрация маршрутов по активной вкладке
  const filteredRoutes = useMemo(() => {
    const routes = analyticsData.routes || [];
    return routes.filter((route) => route.category === activeTab);
  }, [analyticsData.routes, activeTab]);

  const handleTabClick = (category) => {
    setActiveTab(category);
  };

  // Форматирование времени
  const formattedTime =
    analyticsData.averageTime > 0 ? `${analyticsData.averageTime} мин` : "--";
  const formattedZones =
    analyticsData.averageZones > 0
      ? analyticsData.averageZones.toString()
      : "--";
  const formattedAge =
    analyticsData.averageAge > 0 ? `${analyticsData.averageAge} лет` : "--";

  // Являются ли данные пустыми
  const isEmpty = !analyticsData.routes || analyticsData.routes.length === 0;

  return (
    <div className={styles.widgetContent}>
      <div className={styles.widgetHeader}>
        <img src={AnalysisUserIcon} alt="analysisUser" />
        <div className={styles.headerText}>
          <h2>Анализ поведения посетителей</h2>
          <p>Паттерны движения и время прибывания в помещении</p>
        </div>
      </div>
      <div className={styles.widgetBody}>
        <div className={styles.movePatterns}>
          <div className={styles.patternsHeader}>
            <h3>Паттерны движения</h3>
            <p>Маршруты посетителей по зонам</p>
          </div>
          <div className={styles.patternsTabs}>
            <div
              className={`${styles.patternTab} ${activeTab === "popular" ? styles.active : ""}`}
              onClick={() => handleTabClick("popular")}
            >
              <h3>Популярные</h3>
              <p>{categoryCounts.popular}</p>
            </div>
            <div
              className={`${styles.patternTab} ${activeTab === "highConversion" ? styles.active : ""}`}
              onClick={() => handleTabClick("highConversion")}
            >
              <h3>Высокая конверсия</h3>
              <p>{categoryCounts.highConversion}</p>
            </div>
            <div
              className={`${styles.patternTab} ${activeTab === "lowConversion" ? styles.active : ""}`}
              onClick={() => handleTabClick("lowConversion")}
            >
              <h3>Низкая конверсия</h3>
              <p>{categoryCounts.lowConversion}</p>
            </div>
            <div
              className={`${styles.patternTab} ${activeTab === "anomaly" ? styles.active : ""}`}
              onClick={() => handleTabClick("anomaly")}
            >
              <h3>Аномалия поведения</h3>
              <p>{categoryCounts.anomaly}</p>
            </div>
          </div>
        </div>
        <div className={styles.routesListContainer}>
          <SimpleBar
            className={styles.simplebarContainer}
            style={{
              width: "100%",
              height: "318px",
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
                <p>Нет маршрутов в этой категории.</p>
              </div>
            ) : (
              <div className={styles.routesList}>
                {filteredRoutes.map((route) => (
                  <div key={route.id} className={styles.routeItem}>
                    <div className={styles.routeInfo}>
                      <div className={styles.routeInfoHeader}>
                        <h3>{route.name}</h3>
                        <p>{route.visitors} посетителей</p>
                      </div>
                      <button className={styles.details}>
                        <p>Подробнее</p>
                        <img src={ArrowIcon} alt="arrow" />
                      </button>
                    </div>
                    <div className={styles.line}></div>
                    <div className={styles.way}>
                      {route.path.map((point, index) => (
                        <React.Fragment key={index}>
                          {index === 0 ? (
                            <h3>{point}</h3>
                          ) : index === route.path.length - 1 ? (
                            <>
                              <img src={DoubleArrowIcon} alt="arrow double" />
                              <h3>{point}</h3>
                            </>
                          ) : (
                            <>
                              <img src={DoubleArrowIcon} alt="arrow double" />
                              <p>{point}</p>
                            </>
                          )}
                        </React.Fragment>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </SimpleBar>
        </div>
        <div className={styles.widgetFooter}>
          <div className={styles.footerBlock}>
            <div className={styles.parameter}>
              <img src={AverageTimeIcon} alt="AverageTime" />
              <div className={styles.parameterText}>
                <p>Среднее</p>
                <p>время</p>
              </div>
            </div>
            <div className={styles.value}>
              <p>{formattedTime}</p>
            </div>
          </div>
          <div className={styles.footerBlock}>
            <div className={styles.parameter}>
              <img src={AverageZonesIcon} alt="AverageZones" />
              <div className={styles.parameterText}>
                <p>Среднее</p>
                <p>количество зон</p>
              </div>
            </div>
            <div className={styles.value}>
              <p>{formattedZones}</p>
            </div>
          </div>
          <div className={styles.footerBlock}>
            <div className={styles.parameter}>
              <img src={AverageAgeIcon} alt="AverageAge" />
              <div className={styles.parameterText}>
                <p>Средний</p>
                <p>возраст</p>
              </div>
            </div>
            <div className={styles.value}>
              <p>{formattedAge}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
