import React from "react";
import { useNavigate } from "react-router-dom";
import styles from "./MyDashboards.module.scss";
import CreateIcon from "@icons/create.svg?react";
import SampleIcon from "@icons/sample.svg?react";
import { PrimaryButton } from "@ui/buttons/PrimaryButton";
import { SecondaryButton } from "@ui/buttons/SecondaryButton";

export const MyDashboards = () => {
  const navigate = useNavigate();
  const handleCreateDashboard = () => {
    navigate("/create_dashboard");
  };

  const handleUseTemplate = () => {
    navigate("/templates");
  };

  return (
    <div className={styles.mainArea}>
      <div className={styles.header}>
        <h2>Приветствуем в Smart Decision!</h2>
        <h3>Вы еще не создали ни одного дашборда.</h3>
        <div className={styles.buttonsContainer}>
          <PrimaryButton
            text="Создать дашборд"
            icon={CreateIcon}
            onClick={handleCreateDashboard}
          />
          <SecondaryButton
            text="Использовать шаблон"
            icon={SampleIcon}
            onClick={handleUseTemplate}
          />
        </div>
      </div>
    </div>
  );
};
