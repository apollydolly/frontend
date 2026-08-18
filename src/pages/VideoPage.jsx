import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Menu } from "@ui/shared/Menu";
import { AddingVideo } from "@videos/AddingVideo";

export const VideoPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeMenuItem, setActiveMenuItem] = useState("videos");

  const isViewMode = location.pathname.includes("/view");

  const videoFile = location.state?.videoFile || null;
  const originalFileName = location.state?.originalFileName || "";
  const videoDataFromState = location.state?.videoData;
  const isOnlineMode = location.state?.isOnlineMode || false;

  const [videoData, setVideoData] = useState(videoDataFromState || null);

  useEffect(() => {
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
    <div
      style={{ display: "flex", width: "100vw", height: "min(100vh, 56.25vw)" }}
    >
      <Menu activeItem={activeMenuItem} onMenuItemClick={handleMenuItemClick} />
      <AddingVideo
        videoFile={videoFile}
        originalFileName={originalFileName}
        videoData={videoData}
        isViewMode={isViewMode}
        onExit={handleExit}
        onFileSelect={handleFileSelect}
        isOnlineMode={isOnlineMode}
      />
    </div>
  );
};
