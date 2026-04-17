import React from "react";
import styles from "../widgets.module.scss";
import Icon from "@icons/queue_icon.svg";

export const MeetingSummaryWidget = ({}) => {
  return (
    <div className={styles.widgetContent}>
      <div className={styles.widgetHeader}>
        <img src={Icon} alt="icon" />
        <div className={styles.headerText}>
          <h2>Краткое содержание встречи</h2>
        </div>
      </div>
      <div className={styles.widgetBody}>
        <div className={styles.widgetText}>
          <p>
            Собеседование проходило в формате структурированного интервью.
            Рекрутер задавал вопросы по ключевым компетенциям: React (управление
            состоянием, оптимизация, побочные эффекты), TypeScript,
            CSS/адаптивная вёрстка, работа с REST API и GraphQL, а также общие
            вопросы о проектах, командной работе и мобильной разработке.
            Кандидат дал развёрнутые ответы с примерами из личного опыта,
            продемонстрировал техническую грамотность, аналитическое мышление и
            самокритичность. В завершение рекрутер вынес решение – рекомендовать
            кандидата к найму.
          </p>
        </div>
      </div>
    </div>
  );
};
