import React, { forwardRef } from "react";
import styles from "./InputField.module.scss";

export const InputField = forwardRef(
  (
    {
      label,
      value,
      onChange,
      placeholder = "",
      type = "text",
      disabled = false,
      autoFocus = false,
      viewMode = false,
      ...props
    },
    ref
  ) => {
    const isTextArea = type === "textarea";

    return (
      <div className={styles.inputField}>
        {label && <h2>{label}</h2>}
        <div
          className={`${styles.inputContainer} ${
            viewMode ? styles.viewMode : ""
          }`}
        >
          {isTextArea ? (
            <textarea
              ref={ref}
              value={value}
              onChange={onChange}
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
              placeholder={placeholder}
              disabled={disabled}
              autoFocus={autoFocus}
              {...props}
            />
          )}
        </div>
      </div>
    );
  }
);

InputField.displayName = "InputField";
