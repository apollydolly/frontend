import React from "react";
import styles from "./GenderDistWidget.module.scss";
import DistributionIcon from "@icons/distribution.svg";

// Тестовые данные
const TEST_DATA = {
  total: 35,
  categories: [
    { id: 1, label: "Мужчины", count: 5, color: "$primary_blue" },
    { id: 2, label: "Женщины", count: 27, color: "$primary_blue" },
    { id: 3, label: "Дети", count: 3, color: "$primary_blue" },
  ],
};

// Вспомогательная функция для расчета процентов
const calculatePercentage = (count, total) => {
  return total > 0 ? Math.round((count / total) * 100) : 0;
};

export const GenderDistWidget = () => {
  const { total, categories } = TEST_DATA;

  return (
    <div className={styles.widgetContent}>
      <div className={styles.widgetHeader}>
        <img src={DistributionIcon} alt="distribution" />
        <div className={styles.headerText}>
          <h2>Распределение</h2>
          <p>По полу (человек)</p>
        </div>
      </div>
      <div className={styles.widgetBody}>
        <div className={styles.total}>
          <h3>Всего:</h3>
          <p>{total}</p>
        </div>
        <div className={styles.graphsContainer}>
          {categories.map((category) => {
            const percentage = calculatePercentage(category.count, total);

            return (
              <div key={category.id} className={styles.graphBlock}>
                <div className={styles.lineGraph} title={category.label}>
                  <div
                    className={styles.fill}
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
                <div className={styles.graphSign}>
                  <h3>{category.label}</h3>
                  <div className={styles.nums}>
                    <h4>{category.count}</h4>
                    <p>{percentage}%</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
