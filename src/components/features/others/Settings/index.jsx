import React from "react";
import styles from "./Settings.module.scss";

export const Settings = () => {
  return (
    <div className={styles.mainArea}>
      <div className={styles.header}>
        <div className={styles.headerText}>
          <h2>Настройки</h2>
          <h3>Здесь будут настройки.</h3>
        </div>
      </div>
    </div>
  );
};
