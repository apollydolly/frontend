import React from "react";
import styles from "./TextWidget.module.scss";

export const TextWidget = () => {
  return (
    <textarea
      className={styles.textWidgetInput}
      defaultValue="Здесь можно вводить текст..."
    />
  );
};
