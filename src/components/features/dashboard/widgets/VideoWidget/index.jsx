import React from "react";
import styles from "./VideoWidget.module.scss";

import Video from "@video/sample-5s.mp4";

export const VideoWidget = () => {
  return (
    <div className={styles.videoPlaceholder}>
      <video width="100%" height="100%" controls src={Video} />
    </div>
  );
};
