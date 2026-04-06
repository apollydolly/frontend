import React, { useState, useMemo, useEffect, useRef } from "react";
import * as echarts from "echarts/core";
import { TooltipComponent } from "echarts/components";
import { PieChart } from "echarts/charts";
import { LabelLayout } from "echarts/features";
import { SVGRenderer } from "echarts/renderers";
import SimpleBar from "simplebar-react";
import styles from "./MonitoringStaffActivityWidget.module.scss";
import StaffIcon from "@icons/peoples.svg";
import ArrowIcon from "@icons/arrow-bottom.svg?react";

// Тестовые данные
const mockAnalyticsData = {
  employees: [
    {
      id: "GB562",
      name: "Иван Иванов",
      actions: {
        active: [
          { name: "Консультация покупателя", value: 12 },
          { name: "Выкладка товара", value: 8 },
          { name: "Оформление продажи", value: 5 },
          { name: "Помощь на кассе", value: 3 },
        ],
        inactive: [
          { name: "Сидит", value: 4 },
          { name: "Стоит без дела", value: 6 },
          { name: "Разговаривает по телефону", value: 2 },
        ],
        undefined: [
          { name: "Вне зоны видимости", value: 3 },
          { name: "Длительное отсутствие", value: 1 },
        ],
      },
    },
    {
      id: "GB563",
      name: "Петр Петров",
      actions: {
        active: [
          { name: "Консультация покупателя", value: 15 },
          { name: "Выкладка товара", value: 10 },
          { name: "Оформление продажи", value: 7 },
          { name: "Помощь на кассе", value: 4 },
        ],
        inactive: [
          { name: "Сидит", value: 2 },
          { name: "Стоит без дела", value: 3 },
          { name: "Разговаривает по телефону", value: 1 },
        ],
        undefined: [
          { name: "Вне зоны видимости", value: 2 },
          { name: "Длительное отсутствие", value: 1 },
        ],
      },
    },
    {
      id: "GB564",
      name: "Сидор Сидоров",
      actions: {
        active: [
          { name: "Консультация покупателя", value: 8 },
          { name: "Выкладка товара", value: 12 },
          { name: "Оформление продажи", value: 4 },
          { name: "Помощь на кассе", value: 2 },
        ],
        inactive: [
          { name: "Сидит", value: 7 },
          { name: "Стоит без дела", value: 5 },
          { name: "Разговаривает по телефону", value: 3 },
        ],
        undefined: [
          { name: "Вне зоны видимости", value: 4 },
          { name: "Длительное отсутствие", value: 2 },
        ],
      },
    },
    {
      id: "GB565",
      name: "Анна Смирнова",
      actions: {
        active: [
          { name: "Консультация покупателя", value: 20 },
          { name: "Выкладка товара", value: 6 },
          { name: "Оформление продажи", value: 9 },
          { name: "Помощь на кассе", value: 5 },
        ],
        inactive: [
          { name: "Сидит", value: 1 },
          { name: "Стоит без дела", value: 2 },
          { name: "Разговаривает по телефону", value: 0 },
        ],
        undefined: [
          { name: "Вне зоны видимости", value: 1 },
          { name: "Длительное отсутствие", value: 0 },
        ],
      },
    },
    {
      id: "GB566",
      name: "Елена Кузнецова",
      actions: {
        active: [
          { name: "Консультация покупателя", value: 10 },
          { name: "Выкладка товара", value: 14 },
          { name: "Оформление продажи", value: 6 },
          { name: "Помощь на кассе", value: 3 },
        ],
        inactive: [
          { name: "Сидит", value: 3 },
          { name: "Стоит без дела", value: 4 },
          { name: "Разговаривает по телефону", value: 2 },
        ],
        undefined: [
          { name: "Вне зоны видимости", value: 2 },
          { name: "Длительное отсутствие", value: 1 },
        ],
      },
    },
    {
      id: "GB567",
      name: "Михаил Волков",
      actions: {
        active: [
          { name: "Консультация покупателя", value: 5 },
          { name: "Выкладка товара", value: 18 },
          { name: "Оформление продажи", value: 3 },
          { name: "Помощь на кассе", value: 1 },
        ],
        inactive: [
          { name: "Сидит", value: 8 },
          { name: "Стоит без дела", value: 6 },
          { name: "Разговаривает по телефону", value: 4 },
        ],
        undefined: [
          { name: "Вне зоны видимости", value: 5 },
          { name: "Длительное отсутствие", value: 3 },
        ],
      },
    },
    {
      id: "GB568",
      name: "Ольга Новикова",
      actions: {
        active: [
          { name: "Консультация покупателя", value: 16 },
          { name: "Выкладка товара", value: 9 },
          { name: "Оформление продажи", value: 11 },
          { name: "Помощь на кассе", value: 6 },
        ],
        inactive: [
          { name: "Сидит", value: 2 },
          { name: "Стоит без дела", value: 3 },
          { name: "Разговаривает по телефону", value: 1 },
        ],
        undefined: [
          { name: "Вне зоны видимости", value: 1 },
          { name: "Длительное отсутствие", value: 0 },
        ],
      },
    },
  ],
};

// Цвета для конкретных действий
const defaultColors = ["#1776E0", "#3CAB17", "#FDC44C", "#D429C5"];

const getActionColor = (index) => {
  return defaultColors[index % defaultColors.length];
};

// Функция для подсчета общей статистики
const calculateTotalStats = (employees) => {
  const stats = {
    active: { total: 0, actions: {} },
    inactive: { total: 0, actions: {} },
    undefined: { total: 0, actions: {} },
  };

  employees.forEach((employee) => {
    employee.actions.active.forEach((action) => {
      stats.active.actions[action.name] =
        (stats.active.actions[action.name] || 0) + action.value;
      stats.active.total += action.value;
    });

    employee.actions.inactive.forEach((action) => {
      stats.inactive.actions[action.name] =
        (stats.inactive.actions[action.name] || 0) + action.value;
      stats.inactive.total += action.value;
    });

    employee.actions.undefined.forEach((action) => {
      stats.undefined.actions[action.name] =
        (stats.undefined.actions[action.name] || 0) + action.value;
      stats.undefined.total += action.value;
    });
  });

  return stats;
};

export const MonitoringStaffActivityWidget = () => {
  const [activeTab, setActiveTab] = useState("general");
  const [analyticsData] = useState(mockAnalyticsData);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [expandedItems, setExpandedItems] = useState({});
  const chartRef = useRef(null);
  const chartInstance = useRef(null);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Получаем данные для отображения
  const currentData = useMemo(() => {
    if (selectedEmployee) {
      return selectedEmployee;
    }
    const totalStats = calculateTotalStats(analyticsData.employees);
    return {
      id: "all",
      name: "Все сотрудники",
      actions: {
        active: Object.entries(totalStats.active.actions).map(
          ([name, value]) => ({ name, value }),
        ),
        inactive: Object.entries(totalStats.inactive.actions).map(
          ([name, value]) => ({ name, value }),
        ),
        undefined: Object.entries(totalStats.undefined.actions).map(
          ([name, value]) => ({ name, value }),
        ),
      },
      totals: {
        active: totalStats.active.total,
        inactive: totalStats.inactive.total,
        undefined: totalStats.undefined.total,
      },
    };
  }, [selectedEmployee, analyticsData.employees]);

  const hasData = useMemo(() => {
    if (activeTab === "general") {
      const totals = currentData.totals || {
        active: currentData.actions.active.reduce((sum, a) => sum + a.value, 0),
        inactive: currentData.actions.inactive.reduce(
          (sum, a) => sum + a.value,
          0,
        ),
        undefined: currentData.actions.undefined.reduce(
          (sum, a) => sum + a.value,
          0,
        ),
      };
      return totals.active + totals.inactive + totals.undefined > 0;
    } else if (activeTab === "active") {
      const activeTotal = currentData.actions.active.reduce(
        (sum, a) => sum + a.value,
        0,
      );
      return activeTotal > 0;
    } else if (activeTab === "inactive") {
      const inactiveTotal = currentData.actions.inactive.reduce(
        (sum, a) => sum + a.value,
        0,
      );
      return inactiveTotal > 0;
    }
    return false;
  }, [currentData, activeTab]);

  // Данные для графика в зависимости от активной вкладки
  const chartData = useMemo(() => {
    if (activeTab === "general") {
      const totals = currentData.totals || {
        active: currentData.actions.active.reduce((sum, a) => sum + a.value, 0),
        inactive: currentData.actions.inactive.reduce(
          (sum, a) => sum + a.value,
          0,
        ),
        undefined: currentData.actions.undefined.reduce(
          (sum, a) => sum + a.value,
          0,
        ),
      };
      const total = totals.active + totals.inactive + totals.undefined;

      // Если нет данных, показываем один серый блок
      if (total === 0) {
        return [
          {
            name: "Нет данных",
            key: "no_data",
            count: 1,
            percentage: 100,
            color: "#D8D8D8",
            isNoData: true,
          },
        ];
      }

      return [
        {
          name: "Активные действия",
          key: "active",
          count: totals.active,
          percentage: total ? Math.round((totals.active / total) * 100) : 0,
          color: "#1776E0",
        },
        {
          name: "Бездействие",
          key: "inactive",
          count: totals.inactive,
          percentage: total ? Math.round((totals.inactive / total) * 100) : 0,
          color: "#FDC44C",
        },
        {
          name: "Не определено",
          key: "undefined",
          count: totals.undefined,
          percentage: total ? Math.round((totals.undefined / total) * 100) : 0,
          color: "#D8D8D8",
        },
      ];
    } else if (activeTab === "active") {
      const activeActions = currentData.actions.active;
      const inactiveTotal = currentData.actions.inactive.reduce(
        (sum, a) => sum + a.value,
        0,
      );
      const undefinedTotal = currentData.actions.undefined.reduce(
        (sum, a) => sum + a.value,
        0,
      );
      const activeTotal = activeActions.reduce((sum, a) => sum + a.value, 0);
      const total = activeTotal + inactiveTotal + undefinedTotal;

      // Если нет данных, показываем один серый блок
      if (total === 0) {
        return [
          {
            name: "Нет данных",
            key: "no_data",
            count: 1,
            percentage: 100,
            color: "#D8D8D8",
            isNoData: true,
          },
        ];
      }

      const chartItems = [];

      activeActions.forEach((action, idx) => {
        chartItems.push({
          name: action.name,
          key: action.name,
          count: action.value,
          percentage: total ? Math.round((action.value / total) * 100) : 0,
          color: getActionColor(idx),
          category: "active",
        });
      });

      if (inactiveTotal > 0) {
        chartItems.push({
          name: "Бездействие",
          key: "inactive_group",
          count: inactiveTotal,
          percentage: total ? Math.round((inactiveTotal / total) * 100) : 0,
          color: "#D8D8D8",
          category: "inactive",
          isGroup: true,
        });
      }

      if (undefinedTotal > 0) {
        chartItems.push({
          name: "Не определено",
          key: "undefined_group",
          count: undefinedTotal,
          percentage: total ? Math.round((undefinedTotal / total) * 100) : 0,
          color: "#F6F6F6",
          category: "undefined",
          isGroup: true,
        });
      }

      return chartItems;
    } else if (activeTab === "inactive") {
      const inactiveActions = currentData.actions.inactive;
      const activeTotal = currentData.actions.active.reduce(
        (sum, a) => sum + a.value,
        0,
      );
      const undefinedTotal = currentData.actions.undefined.reduce(
        (sum, a) => sum + a.value,
        0,
      );
      const inactiveTotal = inactiveActions.reduce(
        (sum, a) => sum + a.value,
        0,
      );
      const total = inactiveTotal + activeTotal + undefinedTotal;

      // Если нет данных, показываем один серый блок
      if (total === 0) {
        return [
          {
            name: "Нет данных",
            key: "no_data",
            count: 1,
            percentage: 100,
            color: "#D8D8D8",
            isNoData: true,
          },
        ];
      }

      const chartItems = [];

      inactiveActions.forEach((action, idx) => {
        chartItems.push({
          name: action.name,
          key: action.name,
          count: action.value,
          percentage: total ? Math.round((action.value / total) * 100) : 0,
          color: getActionColor(idx),
          category: "inactive",
        });
      });

      if (activeTotal > 0) {
        chartItems.push({
          name: "Активные действия",
          key: "active_group",
          count: activeTotal,
          percentage: total ? Math.round((activeTotal / total) * 100) : 0,
          color: "#D8D8D8",
          category: "active",
          isGroup: true,
        });
      }

      if (undefinedTotal > 0) {
        chartItems.push({
          name: "Не определено",
          key: "undefined_group",
          count: undefinedTotal,
          percentage: total ? Math.round((undefinedTotal / total) * 100) : 0,
          color: "#F6F6F6",
          category: "undefined",
          isGroup: true,
        });
      }

      return chartItems;
    }
    return [];
  }, [currentData, activeTab]);

  const handleTabClick = (tab) => {
    setActiveTab(tab);
    setExpandedItems({});
  };

  const handleEmployeeSelect = (employee) => {
    setSelectedEmployee(employee);
    setIsDropdownOpen(false);
    setExpandedItems({});
  };

  const toggleExpand = (key) => {
    setExpandedItems((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  echarts.use([TooltipComponent, PieChart, SVGRenderer, LabelLayout]);

  // Создаем и обновляем график
  useEffect(() => {
    if (!chartRef.current) return;

    if (chartInstance.current) {
      chartInstance.current.dispose();
    }

    chartInstance.current = echarts.init(chartRef.current, null, {
      renderer: "svg",
    });

    const option = {
      tooltip: {
        trigger: "item",
        formatter: (params) => {
          return `${params.name}`;
        },
        height: 26,
        gap: 8,
        paddingTop: 4,
        paddingRight: 8,
        paddingBottom: 6,
        paddingLeft: 8,
        borderRadius: 4,
        backgroundColor: "#00000066",
        backdropFilter: "blur(24px)",
        borderWidth: 0,

        textStyle: {
          fonFamily: "Roboto",
          fontWeight: 400,
          fontStyle: "Regular",
          fontSize: 14,
          leadingTrim: "NONE",
          lineHeight: "100%",
          letterSpacing: "0%",
          color: "#FFFFFF",
        },
      },
      series: [
        {
          type: "pie",
          radius: ["70%", "90%"],
          avoidLabelOverlap: false,
          itemStyle: {
            borderColor: "#F6F6F6",
            borderWidth: 2,
          },
          label: {
            show: false,
          },
          labelLine: {
            show: false,
          },
          data: chartData.map((item) => ({
            value: item.count,
            name: item.name,
            itemStyle: { color: item.color },
          })),
        },
      ],
      legend: {
        show: false,
      },
    };

    chartInstance.current.setOption(option);

    const handleResize = () => {
      chartInstance.current?.resize();
    };
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      if (chartInstance.current) {
        chartInstance.current.dispose();
        chartInstance.current = null;
      }
    };
  }, [chartData]);

  // Получаем текст для центра графика
  const centerTitle = selectedEmployee
    ? `Сотрудник\n${selectedEmployee.id}`
    : "Все\nсотрудники";
  const centerValue = selectedEmployee
    ? selectedEmployee.name
    : `${analyticsData.employees.length}`;

  return (
    <div className={styles.widgetContent}>
      <div className={styles.widgetHeader}>
        <img src={StaffIcon} alt="staff" />
        <div className={styles.headerText}>
          <h2>Контроль активности персонала</h2>
          <p>Оценка действий и выявление фактов бездействия сотрудников</p>
        </div>
      </div>
      <div className={styles.widgetBody}>
        <div className={styles.filters}>
          <div className={styles.tabs}>
            <div
              className={`${styles.tab} ${activeTab === "general" ? styles.active : ""}`}
              onClick={() => handleTabClick("general")}
            >
              <h3>Общее</h3>
            </div>
            <div
              className={`${styles.tab} ${activeTab === "active" ? styles.active : ""}`}
              onClick={() => handleTabClick("active")}
            >
              <h3>Активные действия</h3>
            </div>
            <div
              className={`${styles.tab} ${activeTab === "inactive" ? styles.active : ""}`}
              onClick={() => handleTabClick("inactive")}
            >
              <h3>Бездействие</h3>
            </div>
          </div>

          <div className={styles.dropdownWrapper} ref={dropdownRef}>
            <div
              className={styles.selectList}
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            >
              <p>
                {selectedEmployee
                  ? `Сотрудник ${selectedEmployee.id} ${selectedEmployee.name}`
                  : "Все сотрудники"}
              </p>
              <ArrowIcon
                className={isDropdownOpen ? styles.arrowRotated : ""}
              />
            </div>
            {isDropdownOpen && (
              <div className={styles.dropdownMenu}>
                <SimpleBar
                  style={{
                    width: "100%",
                    maxHeight: "224px",
                  }}
                  autoHide={false}
                  forceVisible="y"
                >
                  <div
                    className={`${styles.dropdownItem} ${!selectedEmployee ? styles.active : ""}`}
                    onClick={() => handleEmployeeSelect(null)}
                  >
                    <p>Все сотрудники</p>
                  </div>
                  {analyticsData.employees.map((employee) => (
                    <div
                      key={employee.id}
                      className={`${styles.dropdownItem} ${selectedEmployee?.id === employee.id ? styles.active : ""}`}
                      onClick={() => handleEmployeeSelect(employee)}
                    >
                      <p>
                        Сотрудник {employee.id} {employee.name}
                      </p>
                    </div>
                  ))}
                </SimpleBar>
              </div>
            )}
          </div>
        </div>

        <div className={styles.mainBlock}>
          <div className={styles.graphContainer}>
            <div className={styles.graphBlock} ref={chartRef}></div>
            <div className={styles.graphCenterText}>
              <h3>{centerTitle}</h3>
              <p>{centerValue}</p>
            </div>
          </div>
          <div className={styles.infoBlock}>
            <div className={styles.listContainer}>
              <SimpleBar
                className={styles.simplebarContainer}
                style={{
                  width: "100%",
                  height: "322px",
                }}
                autoHide={false}
                forceVisible="y"
              >
                <h3>Тип действия</h3>
                <div className={styles.legendList}>
                  {!hasData ? (
                    // Если нет данных, показываем сообщение
                    <div className={styles.noDataContainer}>
                      <h3 className={styles.actionNull}>
                        Аналитика не включена.
                      </h3>
                    </div>
                  ) : activeTab === "active" || activeTab === "inactive" ? (
                    // Для вкладок "Активные действия" и "Бездействие" показываем только конкретные действия выбранной категории
                    <>
                      {/* Добавляем заголовок с общим количеством действий, используя существующий класс expandedHeader */}
                      <div className={styles.expandedHeader}>
                        <h3>Всего действий:</h3>
                        <p>
                          {chartData
                            .filter((item) => !item.isGroup)
                            .reduce((sum, item) => sum + item.count, 0)}
                        </p>
                      </div>

                      {/* Отображаем конкретные действия */}
                      {chartData
                        .filter((item) => !item.isGroup) // Показываем только конкретные действия, не показываем серые блоки в легенде
                        .map((item, index) => (
                          <div key={index} className={styles.legendItemWrapper}>
                            <div className={styles.legendItemWithPercent}>
                              <div className={styles.legendInfo}>
                                <div
                                  className={styles.legendRectangle}
                                  style={{ backgroundColor: item.color }}
                                ></div>
                                <h3>{item.name}</h3>
                                <p>{item.count}</p>
                              </div>
                              <p className={styles.percentValue}>
                                {item.percentage}%
                              </p>
                            </div>
                          </div>
                        ))}
                    </>
                  ) : (
                    // Для вкладки "Общее"
                    chartData.map((item, index) => {
                      const isExpanded = expandedItems[item.key];
                      const categoryActions = currentData.actions[item.key];
                      const categoryTotal =
                        categoryActions?.reduce((sum, a) => sum + a.value, 0) ||
                        0;

                      // Для категории "Не определено" всегда показываем сообщение, даже если есть действия
                      const isUndefinedCategory = item.key === "undefined";

                      return (
                        <div key={index} className={styles.legendItemWrapper}>
                          <div className={styles.legendItem}>
                            <div className={styles.legendInfo}>
                              <div
                                className={styles.legendRectangle}
                                style={{ backgroundColor: item.color }}
                              ></div>
                              <h3>{item.name}</h3>
                              <p>{item.percentage}%</p>
                            </div>
                            <ArrowIcon
                              className={isExpanded ? styles.arrowExpanded : ""}
                              onClick={() => toggleExpand(item.key)}
                            />
                          </div>

                          {/* Для категорий "Активные действия" и "Бездействие" показываем список действий */}
                          {isExpanded &&
                            !isUndefinedCategory &&
                            categoryActions &&
                            categoryActions.length > 0 && (
                              <div className={styles.expandedContent}>
                                <div className={styles.expandedHeader}>
                                  <h3>Всего действий:</h3>
                                  <p>{categoryTotal}</p>
                                </div>
                                {categoryActions.map((action, idx) => (
                                  <div key={idx} className={styles.actionItem}>
                                    <div className={styles.actionInfo}>
                                      <h3>{action.name}</h3>
                                    </div>
                                    <p>{action.value}</p>
                                  </div>
                                ))}
                              </div>
                            )}

                          {/* Для категории "Не определено" всегда показываем сообщение */}
                          {isExpanded && isUndefinedCategory && (
                            <div className={styles.expandedContent}>
                              <div className={styles.expandedHeader}>
                                <h3>Всего действий:</h3>
                                <p>{categoryTotal}</p>
                              </div>
                              <div className={styles.actionItem}>
                                <div className={styles.actionInfo}>
                                  <h3 className={styles.actionNull}>
                                    Действия сотрудников <br />
                                    не определены
                                  </h3>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Для категорий без действий показываем сообщение "Действий не обнаружено" */}
                          {isExpanded &&
                            !isUndefinedCategory &&
                            (!categoryActions ||
                              categoryActions.length === 0) && (
                              <div className={styles.expandedContent}>
                                <div className={styles.expandedHeader}>
                                  <h3>Всего действий:</h3>
                                  <p>0</p>
                                </div>
                                <div className={styles.actionItem}>
                                  <div className={styles.actionInfo}>
                                    <h3 className={styles.actionNull}>
                                      Действий не обнаружено
                                    </h3>
                                  </div>
                                </div>
                              </div>
                            )}
                        </div>
                      );
                    })
                  )}
                </div>
              </SimpleBar>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
