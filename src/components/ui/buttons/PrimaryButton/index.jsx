import styles from "./PrimaryButton.module.scss";

export const PrimaryButton = ({
  text,
  icon: IconComponent,
  onClick,
  disabled = false,
}) => {
  return (
    <button
      className={styles.primaryButton}
      onClick={onClick}
      disabled={disabled}
    >
      {IconComponent && <IconComponent className={styles.icon} />}
      {text}
    </button>
  );
};
