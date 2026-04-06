import React from "react";
import styles from "./PhotoWidget.module.scss";

import Cam_photo from "@img/cam_template_2.png";

export const PhotoWidget = () => {
  return (
    <div className={styles.photoPlaceholder}>
      <img src={Cam_photo} alt="Cam_photo" draggable="false" />
    </div>
  );
};
