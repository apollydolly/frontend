import styles from "./CloseButton.module.scss";

export const CloseButton = ({
  icon: IconComponent,
  onClick,
  disabled = false,
}) => {
  return (
    <button
      className={styles.closeButton}
      onClick={onClick}
      disabled={disabled}
    >
      {IconComponent && <IconComponent className={styles.icon} />}
    </button>
  );
};
