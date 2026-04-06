import styles from "./SecondaryButton.module.scss";

export const SecondaryButton = ({
  text,
  icon: IconComponent,
  onClick,
  disabled = false,
}) => {
  return (
    <button
      className={styles.secondaryButton}
      onClick={onClick}
      disabled={disabled}
    >
      {IconComponent && <IconComponent className={styles.icon} />}
      {text}
    </button>
  );
};
