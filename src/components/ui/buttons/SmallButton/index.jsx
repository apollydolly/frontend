import styles from "./SmallButton.module.scss";

export const SmallButton = ({
  icon: IconComponent,
  onClick,
  disabled = false,
}) => {
  return (
    <button
      className={styles.smallButton}
      onClick={onClick}
      disabled={disabled}
    >
      {IconComponent && <IconComponent className={styles.icon} />}
    </button>
  );
};
