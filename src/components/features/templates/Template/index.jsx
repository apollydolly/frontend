import React, { useState } from "react";
import styles from "./Template.module.scss";
import EditIcon from "@icons/edit.svg?react";
import CameraIcon from "@icons/camera.svg?react";
import { SmallButton } from "@ui/buttons/SmallButton";
import { PrimaryButton } from "@ui/buttons/PrimaryButton";
import { UploadVideoModal } from "@ui/shared/UploadVideoModal";

export const Template = ({ title }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  return (
    <div className={styles.mainArea}>
      <div className={styles.header}>
        <h2>{title}</h2>
        <div className={styles.buttonsContainer}>
          <SmallButton icon={EditIcon} disabled={true} />
          <PrimaryButton
            text="Подключить видео"
            icon={CameraIcon}
            onClick={handleOpenModal}
            disabled={true}
          />
        </div>
      </div>
      <UploadVideoModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        fromDashboard={true}
      />
    </div>
  );
};
