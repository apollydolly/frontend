import React, { useState, useMemo, useEffect, useRef } from "react";
import * as echarts from "echarts/core";
import { TooltipComponent } from "echarts/components";
import { PieChart } from "echarts/charts";
import { LabelLayout } from "echarts/features";
import { SVGRenderer } from "echarts/renderers";
import SimpleBar from "simplebar-react";
import styles from "./MonitoringStaffActivityPeriodWidget.module.scss";
import StaffIcon from "@icons/peoples.svg";
import ArrowIcon from "@icons/arrow-bottom.svg?react";

// Тестовые данные
const mockAnalyticsData = {
  employees: [
    {
      id: "GB562",
      name: "Иван Иванов",
      actions: [
        {
          date: "2026-03-30",
          type: "active",
          name: "Консультация покупателя",
          value: 12,
        },
        { date: "2026-03-30", type: "inactive", name: "Сидит", value: 4 },
        {
          date: "2026-03-29",
          type: "active",
          name: "Выкладка товара",
          value: 8,
        },
        {
          date: "2026-03-28",
          type: "undefined",
          name: "Вне зоны видимости",
          value: 3,
        },
        {
          date: "2026-03-23",
          type: "active",
          name: "Консультация покупателя",
          value: 7,
        },
      ],
    },
    {
      id: "GB563",
      name: "Петр Петров",
      actions: [
        {
          date: "2026-03-30",
          type: "active",
          name: "Консультация покупателя",
          value: 15,
        },
        {
          date: "2026-03-30",
          type: "inactive",
          name: "Стоит без дела",
          value: 3,
        },
        {
          date: "2026-03-29",
          type: "active",
          name: "Оформление продажи",
          value: 7,
        },
        {
          date: "2026-03-27",
          type: "active",
          name: "Помощь на кассе",
          value: 4,
        },
        {
          date: "2026-03-25",
          type: "inactive",
          name: "Разговаривает по телефону",
          value: 1,
        },
      ],
    },
    {
      id: "GB564",
      name: "Сидор Сидоров",
      actions: [
        {
          date: "2026-03-30",
          type: "active",
          name: "Выкладка товара",
          value: 12,
        },
        {
          date: "2026-03-30",
          type: "inactive",
          name: "Разговаривает по телефону",
          value: 3,
        },
        {
          date: "2026-03-28",
          type: "active",
          name: "Консультация покупателя",
          value: 8,
        },
        {
          date: "2026-03-25",
          type: "undefined",
          name: "Длительное отсутствие",
          value: 2,
        },
        {
          date: "2026-03-22",
          type: "active",
          name: "Оформление продажи",
          value: 4,
        },
      ],
    },
    {
      id: "GB565",
      name: "Анна Смирнова",
      actions: [
        {
          date: "2026-03-30",
          type: "active",
          name: "Консультация покупателя",
          value: 20,
        },
        {
          date: "2026-03-30",
          type: "active",
          name: "Помощь на кассе",
          value: 5,
        },
        { date: "2026-03-29", type: "inactive", name: "Сидит", value: 1 },
        {
          date: "2026-03-26",
          type: "active",
          name: "Оформление продажи",
          value: 9,
        },
        {
          date: "2026-03-24",
          type: "active",
          name: "Выкладка товара",
          value: 6,
        },
      ],
    },
    {
      id: "GB566",
      name: "Елена Кузнецова",
      actions: [
        {
          date: "2026-03-30",
          type: "active",
          name: "Выкладка товара",
          value: 14,
        },
        {
          date: "2026-03-30",
          type: "inactive",
          name: "Стоит без дела",
          value: 4,
        },
        {
          date: "2026-03-28",
          type: "active",
          name: "Консультация покупателя",
          value: 10,
        },
        {
          date: "2026-03-24",
          type: "undefined",
          name: "Вне зоны видимости",
          value: 2,
        },
        {
          date: "2026-03-21",
          type: "active",
          name: "Оформление продажи",
          value: 3,
        },
      ],
    },
    {
      id: "GB567",
      name: "Михаил Волков",
      actions: [
        {
          date: "2026-03-30",
          type: "active",
          name: "Выкладка товара",
          value: 18,
        },
        { date: "2026-03-29", type: "inactive", name: "Сидит", value: 8 },
        {
          date: "2026-03-27",
          type: "active",
          name: "Консультация покупателя",
          value: 5,
        },
        {
          date: "2026-03-23",
          type: "inactive",
          name: "Разговаривает по телефону",
          value: 4,
        },
        {
          date: "2026-03-20",
          type: "undefined",
          name: "Длительное отсутствие",
          value: 2,
        },
      ],
    },
    {
      id: "GB568",
      name: "Ольга Новикова",
      actions: [
        {
          date: "2026-03-30",
          type: "active",
          name: "Консультация покупателя",
          value: 16,
        },
        {
          date: "2026-03-30",
          type: "active",
          name: "Оформление продажи",
          value: 11,
        },
        {
          date: "2026-03-28",
          type: "inactive",
          name: "Стоит без дела",
          value: 3,
        },
        {
          date: "2026-03-25",
          type: "undefined",
          name: "Вне зоны видимости",
          value: 1,
        },
        {
          date: "2026-03-22",
          type: "active",
          name: "Помощь на кассе",
          value: 6,
        },
      ],
    },
    {
      id: "GB569",
      name: "Дмитрий Морозов",
      actions: [
        {
          date: "2026-03-30",
          type: "active",
          name: "Консультация покупателя",
          value: 14,
        },
        {
          date: "2026-03-29",
          type: "active",
          name: "Выкладка товара",
          value: 11,
        },
        { date: "2026-03-27", type: "inactive", name: "Сидит", value: 3 },
        {
          date: "2026-03-24",
          type: "active",
          name: "Помощь на кассе",
          value: 4,
        },
        {
          date: "2026-03-21",
          type: "inactive",
          name: "Разговаривает по телефону",
          value: 2,
        },
      ],
    },
    {
      id: "GB570",
      name: "Татьяна Лебедева",
      actions: [
        {
          date: "2026-03-30",
          type: "active",
          name: "Консультация покупателя",
          value: 9,
        },
        {
          date: "2026-03-30",
          type: "inactive",
          name: "Разговаривает по телефону",
          value: 2,
        },
        {
          date: "2026-03-26",
          type: "active",
          name: "Выкладка товара",
          value: 7,
        },
        {
          date: "2026-03-22",
          type: "undefined",
          name: "Длительное отсутствие",
          value: 1,
        },
        {
          date: "2026-03-19",
          type: "active",
          name: "Оформление продажи",
          value: 5,
        },
      ],
    },
    {
      id: "GB571",
      name: "Алексей Соколов",
      actions: [
        {
          date: "2026-03-30",
          type: "active",
          name: "Оформление продажи",
          value: 8,
        },
        {
          date: "2026-03-29",
          type: "inactive",
          name: "Стоит без дела",
          value: 5,
        },
        {
          date: "2026-03-28",
          type: "active",
          name: "Консультация покупателя",
          value: 11,
        },
        {
          date: "2026-03-23",
          type: "active",
          name: "Помощь на кассе",
          value: 3,
        },
        { date: "2026-03-20", type: "inactive", name: "Сидит", value: 4 },
      ],
    },
    {
      id: "GB572",
      name: "Марина Козлова",
      actions: [
        {
          date: "2026-03-30",
          type: "active",
          name: "Консультация покупателя",
          value: 18,
        },
        {
          date: "2026-03-29",
          type: "active",
          name: "Выкладка товара",
          value: 9,
        },
        { date: "2026-03-28", type: "inactive", name: "Сидит", value: 2 },
        {
          date: "2026-03-25",
          type: "active",
          name: "Оформление продажи",
          value: 6,
        },
        {
          date: "2026-03-22",
          type: "undefined",
          name: "Вне зоны видимости",
          value: 1,
        },
      ],
    },
    {
      id: "GB573",
      name: "Владимир Никитин",
      actions: [
        {
          date: "2026-03-30",
          type: "active",
          name: "Выкладка товара",
          value: 13,
        },
        {
          date: "2026-03-29",
          type: "inactive",
          name: "Разговаривает по телефону",
          value: 4,
        },
        {
          date: "2026-03-27",
          type: "active",
          name: "Консультация покупателя",
          value: 7,
        },
        {
          date: "2026-03-24",
          type: "undefined",
          name: "Вне зоны видимости",
          value: 2,
        },
        {
          date: "2026-03-21",
          type: "active",
          name: "Оформление продажи",
          value: 5,
        },
      ],
    },
    {
      id: "GB574",
      name: "Ксения Орлова",
      actions: [
        {
          date: "2026-03-30",
          type: "active",
          name: "Консультация покупателя",
          value: 22,
        },
        {
          date: "2026-03-30",
          type: "active",
          name: "Помощь на кассе",
          value: 7,
        },
        {
          date: "2026-03-28",
          type: "inactive",
          name: "Стоит без дела",
          value: 1,
        },
        {
          date: "2026-03-26",
          type: "active",
          name: "Оформление продажи",
          value: 10,
        },
        {
          date: "2026-03-23",
          type: "active",
          name: "Выкладка товара",
          value: 12,
        },
      ],
    },
    {
      id: "GB575",
      name: "Андрей Захаров",
      actions: [
        {
          date: "2026-03-30",
          type: "active",
          name: "Консультация покупателя",
          value: 6,
        },
        { date: "2026-03-29", type: "inactive", name: "Сидит", value: 7 },
        {
          date: "2026-03-27",
          type: "active",
          name: "Выкладка товара",
          value: 9,
        },
        {
          date: "2026-03-23",
          type: "undefined",
          name: "Длительное отсутствие",
          value: 3,
        },
        {
          date: "2026-03-20",
          type: "active",
          name: "Помощь на кассе",
          value: 2,
        },
      ],
    },
    {
      id: "GB576",
      name: "Юлия Соловьева",
      actions: [
        {
          date: "2026-03-30",
          type: "active",
          name: "Оформление продажи",
          value: 12,
        },
        {
          date: "2026-03-29",
          type: "active",
          name: "Консультация покупателя",
          value: 14,
        },
        {
          date: "2026-03-28",
          type: "inactive",
          name: "Разговаривает по телефону",
          value: 2,
        },
        {
          date: "2026-03-25",
          type: "active",
          name: "Выкладка товара",
          value: 8,
        },
        {
          date: "2026-03-22",
          type: "active",
          name: "Помощь на кассе",
          value: 4,
        },
      ],
    },
  ],
};

// Цвета для конкретных действий
const defaultColors = ["#1776E0", "#3CAB17", "#FDC44C", "#D429C5"];

const getActionColor = (index) => {
  return defaultColors[index % defaultColors.length];
};

// Функция для фильтрации данных по периоду
const filterDataByPeriod = (actions, period) => {
  const now = new Date();
  const today = now.toISOString().split("T")[0];

  let startDate;

  switch (period) {
    case "today":
      startDate = today;
      break;
    case "yesterday": {
      const yesterday = new Date(now);
      yesterday.setDate(now.getDate() - 1);
      startDate = yesterday.toISOString().split("T")[0];
      break;
    }
    case "week": {
      const weekAgo = new Date(now);
      weekAgo.setDate(now.getDate() - 7);
      startDate = weekAgo.toISOString().split("T")[0];
      break;
    }
    case "month": {
      const monthAgo = new Date(now);
      monthAgo.setMonth(now.getMonth() - 1);
      startDate = monthAgo.toISOString().split("T")[0];
      break;
    }
    default:
      startDate = today;
  }

  return actions.filter((action) => {
    return action.date >= startDate && action.date <= today;
  });
};

// Функция для агрегации действий по сотрудникам
const aggregateActions = (filteredActions) => {
  const result = {
    active: [],
    inactive: [],
    undefined: [],
  };

  const actionMap = {
    active: {},
    inactive: {},
    undefined: {},
  };

  filteredActions.forEach((action) => {
    const type = action.type;
    const name = action.name;
    const value = action.value;

    if (!actionMap[type][name]) {
      actionMap[type][name] = 0;
    }
    actionMap[type][name] += value;
  });

  result.active = Object.entries(actionMap.active).map(([name, value]) => ({
    name,
    value,
  }));
  result.inactive = Object.entries(actionMap.inactive).map(([name, value]) => ({
    name,
    value,
  }));
  result.undefined = Object.entries(actionMap.undefined).map(
    ([name, value]) => ({ name, value }),
  );

  return result;
};

// Функция для подсчета общей статистики
const calculateTotalStats = (employeesData, period) => {
  const stats = {
    active: { total: 0, actions: {} },
    inactive: { total: 0, actions: {} },
    undefined: { total: 0, actions: {} },
  };

  employeesData.forEach((employee) => {
    const filteredActions = filterDataByPeriod(employee.actions, period);
    const aggregated = aggregateActions(filteredActions);

    aggregated.active.forEach((action) => {
      stats.active.actions[action.name] =
        (stats.active.actions[action.name] || 0) + action.value;
      stats.active.total += action.value;
    });

    aggregated.inactive.forEach((action) => {
      stats.inactive.actions[action.name] =
        (stats.inactive.actions[action.name] || 0) + action.value;
      stats.inactive.total += action.value;
    });

    aggregated.undefined.forEach((action) => {
      stats.undefined.actions[action.name] =
        (stats.undefined.actions[action.name] || 0) + action.value;
      stats.undefined.total += action.value;
    });
  });

  return stats;
};

export const MonitoringStaffActivityPeriodWidget = () => {
  const [activeTab, setActiveTab] = useState("general");
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isPeriodDropdownOpen, setIsPeriodDropdownOpen] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState("today");
  const [expandedItems, setExpandedItems] = useState({});
  const chartRef = useRef(null);
  const chartInstance = useRef(null);
  const dropdownRef = useRef(null);
  const periodDropdownRef = useRef(null);

  // Периоды для выбора
  const periods = [
    { id: "today", label: "сегодня" },
    { id: "yesterday", label: "вчера" },
    { id: "week", label: "неделя" },
    { id: "month", label: "месяц" },
  ];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
      if (
        periodDropdownRef.current &&
        !periodDropdownRef.current.contains(event.target)
      ) {
        setIsPeriodDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Функция для получения метки периода
  const getPeriodLabel = () => {
    const period = periods.find((p) => p.id === selectedPeriod);
    return period ? period.label : "сегодня";
  };

  // Обработчик выбора периода
  const handlePeriodSelect = (periodId) => {
    setSelectedPeriod(periodId);
    setIsPeriodDropdownOpen(false);
    setSelectedEmployee(null);
    setExpandedItems({});
  };

  // Получаем данные для отображения (с учетом фильтрации по периоду)
  const currentData = useMemo(() => {
    if (selectedEmployee) {
      const filteredActions = filterDataByPeriod(
        selectedEmployee.actions,
        selectedPeriod,
      );
      const aggregated = aggregateActions(filteredActions);
      return {
        id: selectedEmployee.id,
        name: selectedEmployee.name,
        actions: aggregated,
        totals: {
          active: aggregated.active.reduce((sum, a) => sum + a.value, 0),
          inactive: aggregated.inactive.reduce((sum, a) => sum + a.value, 0),
          undefined: aggregated.undefined.reduce((sum, a) => sum + a.value, 0),
        },
      };
    }

    const totalStats = calculateTotalStats(
      mockAnalyticsData.employees,
      selectedPeriod,
    );
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
  }, [selectedEmployee, selectedPeriod]);

  // Получаем общее количество сотрудников за период
  const getActiveEmployeesCount = useMemo(() => {
    if (selectedEmployee) return 1;

    let count = 0;
    mockAnalyticsData.employees.forEach((employee) => {
      const filteredActions = filterDataByPeriod(
        employee.actions,
        selectedPeriod,
      );
      if (filteredActions.length > 0) {
        count++;
      }
    });
    return count;
  }, [selectedPeriod, selectedEmployee]);

  const hasData = useMemo(() => {
    if (activeTab === "general") {
      const totals = currentData.totals;
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
      const totals = currentData.totals;
      const total = totals.active + totals.inactive + totals.undefined;

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
    : `${getActiveEmployeesCount}`;

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
                  {mockAnalyticsData.employees.map((employee) => {
                    // Проверяем, есть ли у сотрудника действия за выбранный период
                    const filteredActions = filterDataByPeriod(
                      employee.actions,
                      selectedPeriod,
                    );
                    if (filteredActions.length === 0) return null;

                    return (
                      <div
                        key={employee.id}
                        className={`${styles.dropdownItem} ${selectedEmployee?.id === employee.id ? styles.active : ""}`}
                        onClick={() => handleEmployeeSelect(employee)}
                      >
                        <p>
                          Сотрудник {employee.id} {employee.name}
                        </p>
                      </div>
                    );
                  })}
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
                <div className={styles.listHeader}>
                  <h3>Тип действия</h3>
                  <div
                    className={styles.periodDropdownWrapper}
                    ref={periodDropdownRef}
                  >
                    <div
                      className={styles.periodSelector}
                      onClick={() =>
                        setIsPeriodDropdownOpen(!isPeriodDropdownOpen)
                      }
                    >
                      <span>{getPeriodLabel()}</span>
                      <ArrowIcon
                        className={
                          isPeriodDropdownOpen ? styles.arrowRotated : ""
                        }
                      />
                    </div>
                    {isPeriodDropdownOpen && (
                      <div className={styles.periodDropdownMenu}>
                        {periods.map((period) => (
                          <div
                            key={period.id}
                            className={`${styles.periodDropdownItem} ${
                              selectedPeriod === period.id ? styles.active : ""
                            }`}
                            onClick={() => handlePeriodSelect(period.id)}
                          >
                            <p>{period.label}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <div className={styles.legendList}>
                  {!hasData ? (
                    <div className={styles.noDataContainer}>
                      <h3 className={styles.actionNull}>
                        Действий не обнаружено.
                      </h3>
                    </div>
                  ) : activeTab === "active" || activeTab === "inactive" ? (
                    <>
                      <div className={styles.expandedHeader}>
                        <h3>Всего действий:</h3>
                        <p>
                          {chartData
                            .filter((item) => !item.isGroup)
                            .reduce((sum, item) => sum + item.count, 0)}
                        </p>
                      </div>

                      {chartData
                        .filter((item) => !item.isGroup)
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
                    chartData.map((item, index) => {
                      const isExpanded = expandedItems[item.key];
                      const categoryActions = currentData.actions[item.key];
                      const categoryTotal =
                        categoryActions?.reduce((sum, a) => sum + a.value, 0) ||
                        0;

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
