import styles from "./ButtonGray.module.scss";

export const ButtonGray = ({ text, onClick, disabled = false }) => {
  return (
    <button className={styles.buttonGray} onClick={onClick} disabled={disabled}>
      {text}
    </button>
  );
};
