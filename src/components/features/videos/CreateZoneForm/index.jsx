import React, { useState, useRef } from "react";
import styles from "./CreateZoneForm.module.scss";
import CloseIcon from "@icons/close.svg?react";
import SaveZoneIcon from "@icons/bezier-curve-02.svg?react";
import { CloseButton } from "@ui/buttons/CloseButton";
import { SecondaryButton } from "@ui/buttons/SecondaryButton";
import { InputField } from "@ui/shared/InputField";

export const CreateZoneForm = React.memo(
  ({
    initialZoneName = "Новая зона",
    initialZoneColor = "#E1760B",
    zonePoints = [],
    colorOptions = [],
    onSaveZone,
    onCancel,
    onZoneNameChange,
    onZoneColorChange,
    isMask = false,
  }) => {
    const [zoneName, setZoneName] = useState(initialZoneName);
    const [zoneColor, setZoneColor] = useState(initialZoneColor);
    const zoneNameInputRef = useRef(null);

    const handleZoneNameChange = (e) => {
      const newName = e.target.value;
      setZoneName(newName);
      onZoneNameChange?.(newName);
    };

    const handleZoneColorChange = (color) => {
      setZoneColor(color);
      onZoneColorChange?.(color);
    };

    const handleSave = () => {
      onSaveZone?.({
        name: zoneName,
        color: zoneColor,
        points: zonePoints,
      });
    };

    return (
      <div
        className={`${styles.createZone} ${isMask ? styles.mask : undefined}`}
      >
        <div className={styles.createZoneHeader}>
          <h2>Создание {isMask ? "маски" : "зоны"}</h2>
          <CloseButton icon={CloseIcon} onClick={onCancel} />
        </div>
        <div className={styles.zoneInfo}>
          <InputField
            ref={zoneNameInputRef}
            label={isMask ? "Название маски" : "Навзание зоны"}
            value={zoneName}
            onChange={handleZoneNameChange}
            placeholder={
              isMask ? "Введите название маски" : "Введите навзание зоны"
            }
            type="text"
          />
          {!isMask && (
            <div className={styles.colorSelection}>
              <h2>Цвет зоны</h2>
              <div className={styles.colorOptions}>
                {colorOptions.map((color) => (
                  <label key={color.value} className={styles.colorOption}>
                    <input
                      type="radio"
                      name="zoneColor"
                      value={color.value}
                      checked={zoneColor === color.value}
                      onChange={() => handleZoneColorChange(color.value)}
                      className={styles.colorRadio}
                    />
                    <span className={styles.colorCheckmark}></span>
                    <span
                      className={styles.colorPreview}
                      style={{ backgroundColor: color.value }}
                    ></span>
                    <span
                      className={styles.colorName}
                      style={{ color: color.value }}
                    >
                      {color.name}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>
        <div className={styles.zoneActions}>
          <SecondaryButton
            icon={SaveZoneIcon}
            text={isMask ? "Сохранить маску" : "Сохранить зону"}
            onClick={handleSave}
            disabled={zonePoints.length < 3}
          />
        </div>
      </div>
    );
  }
);
