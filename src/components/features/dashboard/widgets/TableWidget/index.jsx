import React, { useState } from "react";
import styles from "./TableWidget.module.scss";

export const TableWidget = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("Все приоритеты");
  const [locationFilter, setLocationFilter] = useState("Все зоны");

  const tableData = [
    {
      product: "Хлеб Дарницкий",
      location: "Хлебобулочные",
      last_time: "13:15",
      priority: "Высокий",
      losses: 2400,
      actions: "Уведомить склад",
    },
    {
      product: "Яблоки Гала",
      location: "Фрукты",
      last_time: "12:30",
      priority: "Средний",
      losses: 1800,
      actions: "Уведомить склад",
    },
    {
      product: "Молоко Простоквашино",
      location: "Молочные продукты",
      last_time: "14:20",
      priority: "Высокий",
      losses: 3200,
      actions: "Уведомить склад",
    },
    {
      product: "Сыр Российский",
      location: "Молочные продукты",
      last_time: "11:45",
      priority: "Средний",
      losses: 1500,
      actions: "Уведомить склад",
    },
    {
      product: "Курица охлажденная",
      location: "Мясо и птица",
      last_time: "15:10",
      priority: "Низкий",
      losses: 5800,
      actions: "Уведомить склад",
    },
    {
      product: "Картофель мытый",
      location: "Овощи",
      last_time: "10:15",
      priority: "Низкий",
      losses: 800,
      actions: "Уведомить склад",
    },
    {
      product: "Вода Бонаква",
      location: "Напитки",
      last_time: "16:30",
      priority: "Средний",
      losses: 2100,
      actions: "Уведомить склад",
    },
    {
      product: "Шоколад Alpen Gold",
      location: "Кондитерские",
      last_time: "09:50",
      priority: "Низкий",
      losses: 950,
      actions: "Уведомить склад",
    },
    {
      product: "Кофе Jacobs",
      location: "Чай и кофе",
      last_time: "13:45",
      priority: "Высокий",
      losses: 4200,
      actions: "Уведомить склад",
    },
    {
      product: "Сахар песок",
      location: "Чай и кофе",
      last_time: "08:30",
      priority: "Средний",
      losses: 1200,
      actions: "Уведомить склад",
    },
  ];

  const getPriorityClass = (priority) => {
    switch (priority) {
      case "Высокий":
        return styles.high;
      case "Средний":
        return styles.medium;
      case "Низкий":
        return styles.low;
      default:
        return "";
    }
  };

  const filteredData = tableData.filter((item) => {
    const matchesSearch = item.product
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesPriority =
      priorityFilter === "Все приоритеты" || item.priority === priorityFilter;
    const matchesLocation =
      locationFilter === "Все зоны" || item.location === locationFilter;

    return matchesSearch && matchesPriority && matchesLocation;
  });

  const resetFilters = () => {
    setSearchTerm("");
    setPriorityFilter("Все приоритеты");
    setLocationFilter("Все зоны");
  };

  const handleTableClick = (e) => {
    e.stopPropagation();
  };

  const handleInputClick = (e) => {
    e.stopPropagation();
  };

  return (
    <div
      className={styles.tableContainer}
      onClick={handleTableClick}
      onMouseDown={handleTableClick}
    >
      <div className={styles.filtersPanel}>
        <div className={styles.searchBox}>
          <input
            type="text"
            placeholder="Поиск товара..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onClick={handleInputClick}
            onMouseDown={handleInputClick}
            className={styles.searchInput}
          />
        </div>

        <div className={styles.filterGroup}>
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            onClick={handleInputClick}
            onMouseDown={handleInputClick}
            className={styles.filterSelect}
          >
            <option value="Все приоритеты">Все приоритеты</option>
            <option value="Высокий">Высокий</option>
            <option value="Средний">Средний</option>
            <option value="Низкий">Низкий</option>
          </select>

          <select
            value={locationFilter}
            onChange={(e) => setLocationFilter(e.target.value)}
            onClick={handleInputClick}
            onMouseDown={handleInputClick}
            className={styles.filterSelect}
          >
            <option value="Все зоны">Все зоны</option>
            <option value="Хлебобулочные">Хлебобулочные</option>
            <option value="Фрукты">Фрукты</option>
            <option value="Молочные продукты">Молочные продукты</option>
            <option value="Мясо и птица">Мясо и птица</option>
            <option value="Овощи">Овощи</option>
            <option value="Напитки">Напитки</option>
            <option value="Кондитерские">Кондитерские</option>
            <option value="Чай и кофе">Чай и кофе</option>
          </select>
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            resetFilters();
          }}
          onMouseDown={handleInputClick}
          className={styles.resetButton}
        >
          Сбросить
        </button>
      </div>

      <div
        className={styles.tableWrapper}
        onClick={handleTableClick}
        onMouseDown={handleTableClick}
      >
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Товар</th>
              <th>Расположение</th>
              <th>Последний раз в наличии</th>
              <th>Приоритет</th>
              <th>Потери (руб/час)</th>
              <th>Действия</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.map((item) => (
              <tr key={item.product}>
                <td>{item.product}</td>
                <td>{item.location}</td>
                <td>{item.last_time}</td>
                <td>
                  <span
                    className={`${styles.priority} ${getPriorityClass(
                      item.priority
                    )}`}
                  >
                    {item.priority}
                  </span>
                </td>
                <td>{item.losses.toLocaleString()}</td>
                <td>
                  <button className={styles.actionButton}>
                    {item.actions}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredData.length === 0 && (
          <div className={styles.noData}>Ничего не найдено</div>
        )}
      </div>
    </div>
  );
};
