import React, { useState, useEffect } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { WidgetPanel } from "@dashboard/WidgetPanel";
import { CreateDashboard } from "@dashboard/CreateDashboard";
import { useNavigate, useLocation } from "react-router-dom";
import { videoService } from "@services/videoService";
import { dashboardService } from "@services/dashboardService";

export const DashboardPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isCreatingForVideo, setIsCreatingForVideo] = useState(false);
  const [videoInfo, setVideoInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Проверяем, перешли ли мы из видео
    const fromVideo = location.state?.fromVideo;
    const videoId = location.state?.videoId;
    const videoName = location.state?.videoName;

    if (fromVideo && videoId) {
      setIsCreatingForVideo(true);
      setVideoInfo({
        id: videoId,
        name: videoName,
      });

      // Также проверяем localStorage на случай если state не сохранился
      const savedVideoInfo = localStorage.getItem("videoForDashboard");
      if (savedVideoInfo) {
        try {
          const parsedInfo = JSON.parse(savedVideoInfo);
          setVideoInfo((prev) => ({
            ...prev,
            ...parsedInfo,
          }));
        } catch (error) {
          console.error(
            "Ошибка парсинга сохраненной информации о видео:",
            error
          );
        }
      }
    }
  }, [location.state]);

  // Функция для привязки дашборда к видео
  const attachDashboardToVideo = async (dashboardId) => {
    if (!videoInfo?.serverVideoId) {
      console.error("Нет videoId для привязки дашборда");
      return false;
    }

    try {
      console.log("Начинаем привязку дашборда к видео:", {
        videoId: videoInfo.serverVideoId,
        dashboardId,
      });

      // Получаем текущие данные видео
      const videoData = await videoService.getVideo(videoInfo.serverVideoId);
      console.log("Данные видео получены:", {
        dashboards: videoData.dashboards,
        videoName: videoData.name,
      });

      // Проверяем, не привязан ли уже этот дашборд
      const currentDashboards = videoData.dashboards || [];
      if (currentDashboards.includes(dashboardId)) {
        console.log("Дашборд уже привязан к видео");
        return true;
      }

      // Добавляем новый дашборд
      const updatedDashboards = [...currentDashboards, dashboardId];
      console.log("Обновленные дашборды:", updatedDashboards);

      // Подготавливаем данные для обновления видео
      const updateData = {
        videoId: videoInfo.serverVideoId,
        name: videoData.name || videoInfo.videoName || "Без названия",
        description: videoData.description || videoInfo.videoNote || "",
        dashboards: updatedDashboards,
      };

      // Добавляем зоны и маски, если они есть
      if (videoData.zones && videoData.zones.length > 0) {
        updateData.zones = videoData.zones.map((zone) => ({
          name: zone.name,
          description: zone.description || "",
          color: zone.color,
          coords: zone.coords || [],
        }));
      }

      if (videoData.masks && videoData.masks.length > 0) {
        updateData.masks = videoData.masks.map((mask) => ({
          name: mask.name,
          description: mask.description || "",
          color: mask.color,
          coords: mask.coords || [],
        }));
      }

      console.log("Данные для обновления видео:", updateData);

      // Обновляем данные видео
      const updateResult = await videoService.setVideoData(updateData);

      console.log("Дашборд успешно привязан к видео:", {
        videoId: videoInfo.serverVideoId,
        dashboardId,
        totalDashboards: updatedDashboards.length,
        updateResult,
      });

      return true;
    } catch (error) {
      console.error("Ошибка при привязке дашборда к видео:", {
        error: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });

      // Если ошибка авторизации
      if (error.response?.data?.code === 10004) {
        window.dispatchEvent(new Event("tokenExpired"));
      }

      return false;
    }
  };

  // Обработчик сохранения дашборда
  const handleSaveDashboard = async (dashboardData) => {
    try {
      setIsLoading(true);

      // 1. Сохраняем дашборд
      await dashboardService.saveDashboard(dashboardData);
      console.log("Дашборд сохранен, получаем список дашбордов...");

      if (!isCreatingForVideo || !videoInfo) {
        // Если не создаем для видео - просто перенаправляем
        navigate("/dashboards");
        return;
      }

      // 2. Получаем список всех дашбордов пользователя
      const userDashboards = await dashboardService.getUserDashboards();
      console.log("Получен список дашбордов:", userDashboards);

      if (userDashboards.length === 0) {
        throw new Error("Нет доступных дашбордов после сохранения");
      }

      // 3. Берем последний дашборд из списка
      const lastDashboard = userDashboards[userDashboards.length - 1];
      const dashboardId = lastDashboard.dashboard_id;

      console.log("Последний созданный дашборд:", {
        dashboardId,
        name: lastDashboard.name,
        totalDashboards: userDashboards.length,
      });

      // 4. Привязываем дашборд к видео
      const attached = await attachDashboardToVideo(dashboardId);

      // 5. Загружаем сохраненные данные видео из localStorage
      const savedVideoData = localStorage.getItem("videoForDashboard");
      let videoDataForReturn = null;

      if (savedVideoData) {
        try {
          videoDataForReturn = JSON.parse(savedVideoData);
          console.log("Загружены сохраненные данные видео:", {
            hasThumbnail: !!videoDataForReturn.videoThumbnail,
            hasVideoUrl: !!videoDataForReturn.videoUrl,
            connectedDashboardsCount:
              videoDataForReturn.connectedDashboards?.length,
          });

          // Добавляем новый дашборд в список
          videoDataForReturn.connectedDashboards =
            videoDataForReturn.connectedDashboards || [];
          videoDataForReturn.connectedDashboards.push({
            id: dashboardId,
            title: lastDashboard.name,
          });

          console.log(
            "Обновленные данные видео с новым дашбордом:",
            videoDataForReturn
          );
        } catch (error) {
          console.error("Ошибка парсинга сохраненных данных видео:", error);
        }
      }

      if (attached) {
        // 6. Возвращаемся на страницу видео с полными данными
        navigate(`/video/${videoInfo.serverVideoId}/view`, {
          state: {
            dashboardCreated: true,
            newDashboardId: dashboardId,
            dashboardName: lastDashboard.name,
            videoData: videoDataForReturn, // Передаем сохраненные данные с URL и миниатюрой
          },
        });

        console.log("Навигация на видео выполнена с данными:", {
          videoId: videoInfo.serverVideoId,
          hasVideoData: !!videoDataForReturn,
        });

        // 7. Очищаем localStorage
        localStorage.removeItem("videoForDashboard");
      } else {
        // Если не удалось привязать, все равно переходим к видео
        navigate(`/video/${videoInfo.serverVideoId}/view`, {
          state: {
            videoData: videoDataForReturn,
          },
        });
      }
    } catch (error) {
      console.error("Ошибка при создании дашборда:", error);
      alert("Ошибка при создании дашборда");
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div style={{ display: "flex", width: "1920px", height: "1080px" }}>
        <WidgetPanel />
        {isCreatingForVideo && videoInfo ? (
          <CreateDashboard
            editMode={false}
            fromVideo={true}
            videoId={videoInfo.id}
            videoName={videoInfo.name}
            onSave={handleSaveDashboard}
            isLoading={isLoading}
          />
        ) : (
          <CreateDashboard editMode={false} />
        )}
      </div>
    </DndProvider>
  );
};
