import React, { forwardRef } from "react";
import styles from "./InputField.module.scss";

export const InputField = forwardRef(
  (
    {
      label,
      value,
      onChange,
      onFocus,
      onBlur,
      placeholder = "",
      type = "text",
      disabled = false,
      autoFocus = false,
      viewMode = false,
      minHeight = 0,
      padding = "1.0417vw",
      borderStatus = null,
      ...props
    },
    ref,
  ) => {
    const isTextArea = type === "textarea";

    // Функция для получения класса границы
    const getBorderClass = () => {
      switch (borderStatus) {
        case "gray":
          return styles.grayBorder;
        case "blue":
          return styles.blueBorder;
        case "green":
          return styles.greenBorder;
        default:
          return "";
      }
    };

    return (
      <div className={styles.inputField}>
        {label && <h2>{label}</h2>}
        <div
          className={`${styles.inputContainer} ${
            viewMode ? styles.viewMode : ""
          } ${getBorderClass()}`}
          style={{ minHeight: minHeight, padding: padding }}
        >
          {isTextArea ? (
            <textarea
              ref={ref}
              value={value}
              onChange={onChange}
              onFocus={onFocus}
              onBlur={onBlur}
              placeholder={placeholder}
              disabled={disabled}
              {...props}
            />
          ) : (
            <input
              ref={ref}
              type={type}
              value={value}
              onChange={onChange}
              onFocus={onFocus}
              onBlur={onBlur}
              placeholder={placeholder}
              disabled={disabled}
              autoFocus={autoFocus}
              {...props}
            />
          )}
        </div>
      </div>
    );
  },
);

InputField.displayName = "InputField";
