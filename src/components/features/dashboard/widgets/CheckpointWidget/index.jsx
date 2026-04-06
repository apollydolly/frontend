import React from "react";
import styles from "./CheckpointWidget.module.scss";
import CheckpointIcon from "@icons/checkpoint.svg";
import ArrowIcon from "@icons/widget_button_icon.svg?react";
import CarIcon from "@icons/car_icon.svg";
import TruckIcon from "@icons/car_arrive.svg";
import BusIcon from "@icons/bus.svg";
import MotoIcon from "@icons/moto.svg";

// Конфигурация для типов транспортных средств
const vehicleConfig = {
  car: {
    icon: CarIcon,
    label: "Легковой автомобиль",
  },
  truck: {
    icon: TruckIcon,
    label: "Грузовой автомобиль",
  },
  bus: {
    icon: BusIcon,
    label: "Автобус",
  },
  motorcycle: {
    icon: MotoIcon,
    label: "Мотоцикл",
  },
};

export const CheckpointWidget = ({ data = {}, widgetId, widgetType }) => {
  const {
    checkpointNumber = 1,
    vehicles = [
      {
        vehicleType: "truck",
        plateNumber: "В123ВС",
        count: 45,
      },
      {
        vehicleType: "car",
        plateNumber: "А456АВ",
        count: 32,
      },
      {
        vehicleType: "bus",
        plateNumber: "С789СD",
        count: 18,
      },
    ],
    name = `КПП №${checkpointNumber}`,
  } = data;

  const description = checkpointNumber === 1 ? "Въезд ТС" : "Выезд ТС";
  const hasVehicles = vehicles.length > 0;
  const firstVehicle = hasVehicles ? vehicles[0] : null;

  // Получаем конфигурацию для типа транспортного средства
  const vehicle = firstVehicle
    ? vehicleConfig[firstVehicle.vehicleType] || vehicleConfig.car
    : null;

  // Количество дополнительных ТС
  const additionalCount = Math.max(0, vehicles.length - 1);

  return (
    <div className={styles.widgetContent}>
      <div className={styles.widgetHeader}>
        <img src={CheckpointIcon} alt="checkpoint" />
        <div className={styles.headerText}>
          <h2>{name}</h2>
          <p>{description}</p>
        </div>
      </div>
      <div className={styles.widgetBody}>
        {hasVehicles && vehicle && firstVehicle ? (
          <>
            <div className={styles.transport}>
              <div className={styles.transportName}>
                <h3>{vehicle.label}</h3>
                {additionalCount > 0 && (
                  <p className={styles.additionalText}>
                    и еще {additionalCount} ТС
                  </p>
                )}
              </div>
              <div className={styles.transportInfo}>
                <img src={vehicle.icon} alt={vehicle.label} />
                <h3>{firstVehicle.plateNumber}</h3>
                <p>{firstVehicle.count}</p>
              </div>
            </div>
            <button className={styles.widgetButton}>
              <ArrowIcon />
            </button>
          </>
        ) : (
          <p className={styles.emptyText}>Не обнаружено.</p>
        )}
      </div>
    </div>
  );
};
