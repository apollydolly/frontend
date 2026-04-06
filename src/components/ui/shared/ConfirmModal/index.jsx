import React from "react";
import styles from "./ConfirmModal.module.scss";

export const ConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = "Подтверждение",
  message,
  confirmText = "Подтвердить",
  cancelText = "Отмена",
  isConfirmDisabled = false,
  isCancelDisabled = false,
  error = null,
  type = "default", // 'default', 'danger', 'warning'
}) => {
  if (!isOpen) return null;

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget && !isCancelDisabled) {
      onClose();
    }
  };

  const handleConfirm = () => {
    if (!isConfirmDisabled) {
      onConfirm();
    }
  };

  const handleCancel = () => {
    if (!isCancelDisabled) {
      onClose();
    }
  };

  return (
    <div className={styles.modalOverlay} onClick={handleOverlayClick}>
      <div className={styles.modalContent}>
        <div className={styles.modalHeader}>
          <h3 className={`${styles.modalTitle} ${styles[type]}`}>{title}</h3>
          {!isCancelDisabled && (
            <button className={styles.closeButton} onClick={handleCancel}>
              ×
            </button>
          )}
        </div>

        <div className={styles.modalBody}>
          <p className={styles.message}>{message}</p>

          {error && <div className={styles.errorMessage}>{error}</div>}
        </div>

        <div className={styles.modalFooter}>
          <button
            className={`${styles.button} ${styles.cancelButton}`}
            onClick={handleCancel}
            disabled={isCancelDisabled}
          >
            {cancelText}
          </button>
          <button
            className={`${styles.button} ${styles.confirmButton}`}
            onClick={handleConfirm}
            disabled={isConfirmDisabled}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};
