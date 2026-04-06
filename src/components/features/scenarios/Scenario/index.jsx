import React, { useState } from "react";
import styles from "./Scenario.module.scss";

export const Scenario = ({ title }) => {
  return (
    <div className={styles.mainArea}>
      <div className={styles.header}>
        <h2>{title}</h2>
      </div>
    </div>
  );
};
