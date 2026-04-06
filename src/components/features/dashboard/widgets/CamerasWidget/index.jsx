import React from "react";
import styles from "./CamerasWidget.module.scss";
import CameraIcon from "@icons/camera-icon.svg";

export const CamerasWidget = ({ data = {}, widgetId, widgetType }) => {
  const {
    cameras = 15,
    totalCameras = 15,
    coveragePercentage = 100,
    name = "Камеры",
    description = "на территории помещения",
  } = data;

  // Определение класса в зависимости от уровня загруженности
  const getOccupancyClass = () => {
    if (coveragePercentage <= 30) return styles.high;
    if (coveragePercentage <= 70) return styles.medium;
    return styles.low;
  };

  return (
    <div className={styles.widgetContent}>
      <div className={styles.widgetHeader}>
        <img src={CameraIcon} alt="camera" />
        <div className={styles.headerText}>
          <h2>{name}</h2>
          <p>{description}</p>
        </div>
      </div>
      <div className={styles.widgetBody}>
        <div className={styles.numPeople}>
          <h3>
            {cameras}/{totalCameras}
          </h3>
        </div>
        <button className={`${styles.widgetButton} ${getOccupancyClass()}`}>
          <p>{coveragePercentage}% покрытие</p>
        </button>
      </div>
    </div>
  );
};
