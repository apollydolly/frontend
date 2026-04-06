import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Menu } from "@ui/shared/Menu";
import { AddingVideo } from "@videos/AddingVideo";

export const VideoPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeMenuItem, setActiveMenuItem] = useState("videos");

  const isViewMode = location.pathname.includes("/view");

  // Получаем данные из state
  const videoFile = location.state?.videoFile || null;
  const originalFileName = location.state?.originalFileName || "";
  const videoDataFromState = location.state?.videoData;

  // Если вернулись с созданным дашбордом, используем данные из state
  const [videoData, setVideoData] = useState(videoDataFromState || null);

  useEffect(() => {
    // Если есть данные в state, обновляем локальное состояние
    if (videoDataFromState) {
      console.log("Получены данные видео из state:", videoDataFromState);
      setVideoData(videoDataFromState);
    }
  }, [videoDataFromState]);

  const handleMenuItemClick = (menuItemId) => {
    setActiveMenuItem(menuItemId);
    if (
      menuItemId === "dashboards" ||
      menuItemId === "templates" ||
      menuItemId === "scenarios" ||
      menuItemId === "my-scenarios"
    ) {
      navigate("/");
    }
  };

  const handleExit = () => {
    navigate("/videos");
  };

  const handleFileSelect = (file) => {
    const newVideoId = `video-${Date.now()}`;
    navigate(`/video/${newVideoId}`, {
      state: {
        videoFile: file,
        originalFileName: file.name,
      },
    });
  };

  return (
    <div style={{ display: "flex", width: "1920px", height: "1080px" }}>
      <Menu activeItem={activeMenuItem} onMenuItemClick={handleMenuItemClick} />
      <AddingVideo
        videoFile={videoFile}
        originalFileName={originalFileName}
        videoData={videoData}
        isViewMode={isViewMode}
        onExit={handleExit}
        onFileSelect={handleFileSelect}
      />
    </div>
  );
};
