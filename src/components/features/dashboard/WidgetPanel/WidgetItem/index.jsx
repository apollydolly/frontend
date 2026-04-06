import React from "react";
import { useDrag } from "react-dnd";
import styles from "./WidgetItem.module.scss";
export const WidgetItem = ({ type, name }) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: "widget",
    item: {
      type,
      defaultWidth: 2,
      defaultHeight: 2,
    },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));

  console.log(`WidgetItem ${type} dragging:`, isDragging);

  return (
    <div
      ref={drag}
      className={`${styles.widgetItem} ${isDragging ? styles.dragging : ""}`}
      style={{ opacity: isDragging ? 0.5 : 1 }}
    >
      <span className={styles.widgetName}>{name}</span>
    </div>
  );
};
