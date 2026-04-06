import React from "react";
import styles from "./AgeDistWidget.module.scss";
import DistributionIcon from "@icons/distribution.svg";

// Тестовые данные
const TEST_DATA = {
  total: 10,
  categories: [
    { id: 1, label: "18-25 лет", count: 3, color: "$primary_blue" },
    { id: 2, label: "25-35 лет", count: 3, color: "$primary_blue" },
    { id: 3, label: "35-45 лет", count: 2, color: "$primary_blue" },
    { id: 4, label: "45-55 лет", count: 1, color: "$primary_blue" },
    { id: 5, label: "55-65 лет", count: 1, color: "$primary_blue" },
  ],
};

// Вспомогательная функция для расчета процентов
const calculatePercentage = (count, total) => {
  return total > 0 ? Math.round((count / total) * 100) : 0;
};

export const AgeDistWidget = () => {
  const { total, categories } = TEST_DATA;

  return (
    <div className={styles.widgetContent}>
      <div className={styles.widgetHeader}>
        <img src={DistributionIcon} alt="distribution" />
        <div className={styles.headerText}>
          <h2>Распределение</h2>
          <p>По возрасту (человек)</p>
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
