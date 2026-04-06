import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import styles from "./AddingVideo.module.scss";
import UploadVideoIcon from "@icons/upload_video.svg?react";
import ArrowIcon from "@icons/small_arrow.svg?react";
import VideoIcon from "@icons/video-horizontal.svg?react";
import TimerIcon from "@icons/timer.svg?react";
import EditIcon from "@icons/edit.svg?react";
import DeleteIcon from "@icons/delete.svg?react";
import { PrimaryButton } from "@ui/buttons/PrimaryButton";
import { ButtonGray } from "@ui/buttons/ButtonGray";
import { InfoContainer } from "@videos/InfoContainer";
import { VideoInfoContainer } from "@videos/VideoInfoContainer";
import { SmallButton } from "@ui/buttons/SmallButton";
import { CreateZoneForm } from "@videos/CreateZoneForm";
import { videoService, getVideoDuration } from "@services/videoService";
import { dashboardService } from "@services/dashboardService";

export const AddingVideo = ({
  videoFile,
  originalFileName,
  videoData,
  isViewMode = false,
  onExit,
  onFileSelect,
}) => {
  const navigate = useNavigate();
  const location = useLocation();

  const [activeTab, setActiveTab] = useState("general");
  const [isCreatingZone, setIsCreatingZone] = useState(false);
  const [zonePoints, setZonePoints] = useState([]);
  const [zoneColor, setZoneColor] = useState("#E1760B");
  const [zoneName, setZoneName] = useState("Новая зона");
  const videoRef = useRef(null);
  const abortControllerRef = useRef(null);
  const [currentVideoTime, setCurrentVideoTime] = useState(0);
  const [zones, setZones] = useState(
    videoData?.zones || location.state?.videoData?.zones || []
  );
  const [masks, setMasks] = useState(
    videoData?.masks || location.state?.videoData?.masks || []
  );
  const [isCreatingMask, setIsCreatingMask] = useState(false);
  const [maskPoints, setMaskPoints] = useState([]);
  const [maskName, setMaskName] = useState("Новая маска");
  // Состояния для подсветки
  const [highlightedZoneId, setHighlightedZoneId] = useState(null);
  const [highlightedMaskId, setHighlightedMaskId] = useState(null);
  const [videoDownloadProgress, setVideoDownloadProgress] = useState(0);
  const [videoFileError, setVideoFileError] = useState(null);
  const [isDownloadingVideo, setIsDownloadingVideo] = useState(false);
  const [isLoadingFromServer, setIsLoadingFromServer] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [serverVideoId, setServerVideoId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [uploadDate, setUploadDate] = useState(videoData?.uploadDate || "");
  const [dashboardIdFromModal, setDashboardIdFromModal] = useState(null);
  const [videoName, setVideoName] = useState(
    videoData?.videoName || "Видео без названия"
  );

  const [currentVideoFile, setCurrentVideoFile] = useState(
    videoFile || videoData?.videoFile
  );
  const [currentOriginalFileName, setCurrentOriginalFileName] = useState(
    originalFileName ||
      videoData?.originalFileName ||
      currentVideoFile?.name ||
      ""
  );

  // Функции для работы с зонами
  const handleCreateZone = useCallback(
    (zoneData) => {
      // zonePoints относительные
      const newZone = {
        ...zoneData,
        id: `zone-${Date.now()}`,
        points: zonePoints,
      };

      console.log("Создана новая зона:", newZone);

      setZones((prevZones) => [...prevZones, newZone]);
      setIsCreatingZone(false);
      setZonePoints([]);
      setZoneColor("#E1760B");
      setZoneName("Новая зона");
    },
    [zonePoints]
  );

  // Удаление зоны
  const handleDeleteZone = useCallback((zoneId) => {
    setZones((prevZones) => prevZones.filter((zone) => zone.id !== zoneId));
  }, []);

  // Функция для обновления времени видео
  const handleVideoTimeUpdate = useCallback((time) => {
    setCurrentVideoTime(time);
  }, []);

  // Если есть videoData - значит видео уже было обработано
  const wasProcessed = !!videoData;

  // Определяем состояние
  const getVideoState = () => {
    if (!isViewMode && !wasProcessed) return "add"; // Первая загрузка
    if (isViewMode) return "view"; // Режим просмотра
    return "edit"; // Режим редактирования
  };

  const videoState = getVideoState();

  // Если переходим из режима просмотра - видео уже обработано
  const [isProcessing, setIsProcessing] = useState(videoState === "add");
  const [uploadProgress, setUploadProgress] = useState(
    videoState === "add" ? 0 : 100
  );

  const [videoNote, setVideoNote] = useState(videoData?.videoNote || "");
  const [videoUrl, setVideoUrl] = useState(videoData?.videoUrl || "");
  const [videoThumbnail, setVideoThumbnail] = useState(
    videoData?.videoThumbnail || ""
  );

  const [errorType, setErrorType] = useState(null);
  const [uploadError, setUploadError] = useState("");

  const [progressKey, setProgressKey] = useState(0);

  // Сохраняем URL и состояние миниатюры между переходами
  const videoUrlRef = useRef(videoData?.videoUrl || "");
  const thumbnailCreatedRef = useRef(!!videoData?.videoThumbnail);

  // Моковые данные для подключенных дашбордов (для тестирования)
  const [connectedDashboards, setConnectedDashboards] = useState(
    videoData?.connectedDashboards || []
  );

  // Цвета для выбора с названиями
  const colorOptions = [
    { value: "#E1760B", name: "Оранжевый" },
    { value: "#2E9517", name: "Зеленый" },
    { value: "#5137D3", name: "Фиолетовый" },
    { value: "#D429C5", name: "Розовый" },
  ];

  // Функция для отмены загрузки
  const cancelUpload = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      console.log("Загрузка видео отменена");
    }

    // Очищаем объект URL если он был создан
    if (videoUrlRef.current) {
      URL.revokeObjectURL(videoUrlRef.current);
      videoUrlRef.current = "";
      setVideoUrl("");
    }

    // Сбрасываем состояния
    setIsUploading(false);
    setIsProcessing(false);
    setUploadProgress(0);
    setErrorType(null);
    setUploadError("");
  }, []);

  const handleZonePointsChange = useCallback((points) => {
    setZonePoints(points);
  }, []);

  const handleZoneNameChange = useCallback((newName) => {
    setZoneName(newName);
  }, []);

  const handleZoneColorChange = useCallback((color) => {
    setZoneColor(color);
  }, []);

  const handleSaveZone = useCallback(() => {
    handleCreateZone({
      name: zoneName,
      color: zoneColor,
      points: zonePoints,
    });
  }, [handleCreateZone, zoneName, zoneColor, zonePoints]);

  const handleCancelCreatingZone = useCallback(() => {
    setIsCreatingZone(false);
    setZoneName("Новая зона");
    setZoneColor("#E1760B");
    setZonePoints([]);
  }, []);

  // Функция создания маски
  const handleCreateMask = useCallback(
    (maskData) => {
      const newMask = {
        ...maskData,
        id: `mask-${Date.now()}`,
        color: "#EB3134", // Фиксированный красный цвет для масок
        points: maskPoints,
      };

      console.log("Создана новая маска:", newMask);
      setMasks((prevMasks) => [...prevMasks, newMask]);
      setIsCreatingMask(false);
      setMaskPoints([]);
      setMaskName("Новая маска");
    },
    [maskPoints]
  );

  // Функция удаления маски
  const handleDeleteMask = (maskId) => {
    setMasks((prevMasks) => prevMasks.filter((mask) => mask.id !== maskId));
  };

  // Обработчики для точек маски
  const handleMaskPointsChange = useCallback((points) => {
    setMaskPoints(points);
  }, []);

  const handleMaskNameChange = useCallback((newName) => {
    setMaskName(newName);
  }, []);

  const handleSaveMask = useCallback(() => {
    handleCreateMask({
      name: maskName,
      points: maskPoints,
    });
  }, [handleCreateMask, maskName, maskPoints]);

  const handleCancelCreatingMask = useCallback(() => {
    setIsCreatingMask(false);
    setMaskName("Новая маска");
    setMaskPoints([]);
  }, []);

  const handleStartCreatingMask = useCallback(() => {
    setIsCreatingMask(true);
  }, []);

  // Определяем статус загрузки
  const getUploadStatus = () => {
    // Если идет загрузка на сервер ИЛИ загрузка с сервера
    if (isUploading || videoDownloadProgress > 0) {
      const currentProgress = isUploading
        ? uploadProgress
        : videoDownloadProgress;
      return {
        icon: TimerIcon,
        text: "Загрузка видео",
        color: "gray",
        iconColor: "gray",
        showProgress: true,
        progress: currentProgress,
      };
    }

    if (errorType === "upload" || videoFileError) {
      return {
        icon: VideoIcon,
        text: "Ошибка загрузки. ",
        subText:
          videoFileError || "Попробуйте выбрать и загрузить видео еще раз",
        color: "error",
        iconColor: "gray",
        progressBarColor: "white",
      };
    } else if (
      (videoState === "view" || videoState === "edit") &&
      serverVideoId
    ) {
      return {
        icon: VideoIcon,
        text: "Видео загружено и обработано",
        color: "blue",
        iconColor: "blue",
      };
    } else if (serverVideoId && uploadProgress === 100) {
      return {
        icon: VideoIcon,
        text: "Видео загружено",
        color: "blue",
        iconColor: "blue",
      };
    } else {
      return {
        icon: VideoIcon,
        text: "Загрузка видео",
        color: "gray",
        iconColor: "gray",
      };
    }
  };

  const uploadStatus = getUploadStatus();

  // Функция для рендеринга текста с разными цветами
  const renderStatusText = () => {
    const status = getUploadStatus();

    if (errorType) {
      return (
        <div className={styles.errorText}>
          <p className={styles.red}>{status.text}</p>
          <p className={styles.gray}>{status.subText}</p>
        </div>
      );
    } else if (status.showProgress) {
      // Для статуса загрузки всегда серый текст
      return <p className={styles.gray}>{status.text}</p>;
    } else if (
      (videoState === "view" || videoState === "edit") &&
      serverVideoId
    ) {
      return <p className={styles.blue}>{status.text}</p>;
    } else if (serverVideoId && uploadProgress === 100) {
      return <p className={styles.blue}>{status.text}</p>;
    } else {
      return <p className={styles.gray}>{status.text}</p>;
    }
  };

  // Валидация файла
  const validateFile = (file) => {
    const allowedTypes = ["video/avi", "video/mp4", "video/x-msvideo"];
    const allowedExtensions = [".avi", ".mp4"];

    if (!file.type.startsWith("video/")) {
      return "Файл не соответствует формату";
    }

    if (
      !allowedTypes.includes(file.type) &&
      !allowedExtensions.some((ext) => file.name.toLowerCase().endsWith(ext))
    ) {
      return "Файл не соответствует формату";
    }

    return null;
  };

  // Очистка предыдущего URL (только если не было сохраненного состояния)
  const cleanupPreviousUrl = () => {
    if (videoUrlRef.current && !videoData?.videoUrl && !wasProcessed) {
      URL.revokeObjectURL(videoUrlRef.current);
      videoUrlRef.current = "";
    }
  };

  // Создание миниатюры (только если еще не создана)
  const createThumbnail = useCallback(
    (url) => {
      if (videoData?.videoThumbnail || thumbnailCreatedRef.current) {
        return;
      }

      const canvas = document.createElement("canvas");
      const video = document.createElement("video");
      video.crossOrigin = "anonymous"; // Для CORS если нужно
      video.src = url;

      const onLoadedData = () => {
        // Пытаемся установить время для захвата кадра
        video.currentTime = Math.min(1, video.duration * 0.1); // 10% от длительности или 1 сек
      };

      const onSeeked = () => {
        try {
          // Устанавливаем размеры canvas пропорционально видео
          const maxWidth = 400;
          const maxHeight = 300;
          let { videoWidth, videoHeight } = video;

          // Масштабируем сохраняя пропорции
          if (videoWidth > maxWidth) {
            const ratio = maxWidth / videoWidth;
            videoWidth = maxWidth;
            videoHeight = videoHeight * ratio;
          }
          if (videoHeight > maxHeight) {
            const ratio = maxHeight / videoHeight;
            videoHeight = maxHeight;
            videoWidth = videoWidth * ratio;
          }

          canvas.width = videoWidth;
          canvas.height = videoHeight;

          const ctx = canvas.getContext("2d");
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          const thumbnail = canvas.toDataURL("image/jpeg", 0.8);

          setVideoThumbnail(thumbnail);
          thumbnailCreatedRef.current = true;

          console.log("Миниатюра создана:", {
            width: canvas.width,
            height: canvas.height,
          });
        } catch (error) {
          console.error("Ошибка создания миниатюры:", error);
          // Создаем placeholder если не удалось создать миниатюру
          setVideoThumbnail("");
        }

        // Очистка
        video.removeEventListener("loadeddata", onLoadedData);
        video.removeEventListener("seeked", onSeeked);
        video.removeEventListener("error", onError);
      };

      const onError = () => {
        console.error("Ошибка загрузки видео для миниатюры");
        video.removeEventListener("loadeddata", onLoadedData);
        video.removeEventListener("seeked", onSeeked);
        video.removeEventListener("error", onError);
      };

      video.addEventListener("loadeddata", onLoadedData);
      video.addEventListener("seeked", onSeeked);
      video.addEventListener("error", onError);

      video.load();
    },
    [videoData?.videoThumbnail]
  );

  // Функция для начала обработки видео
  const startVideoProcessing = async (file) => {
    // Если видео уже было обработано, пропускаем
    if (wasProcessed || thumbnailCreatedRef.current) {
      setIsProcessing(false);
      setUploadProgress(100);
      return;
    }

    cleanupPreviousUrl();

    // Отменяем предыдущую загрузку если есть
    cancelUpload();

    // ПОЛНЫЙ СБРОС СОСТОЯНИЙ ПЕРЕД НАЧАЛОМ ЗАГРУЗКИ
    setErrorType(null);
    setUploadProgress(0);
    setProgressKey((prev) => prev + 1);
    setIsProcessing(true);
    setIsUploading(true);
    setVideoThumbnail("");
    setUploadError("");
    thumbnailCreatedRef.current = false;
    setServerVideoId(null);

    const url = URL.createObjectURL(file);
    videoUrlRef.current = url;
    setVideoUrl(url);
    setCurrentVideoFile(file);

    try {
      // Создаем новый AbortController для возможности отмены
      abortControllerRef.current = new AbortController();

      // ЗАГРУЗКА НА СЕРВЕР
      const duration = await getVideoDuration(file);
      const response = await videoService.uploadVideo(
        file,
        duration,
        (progress) => setUploadProgress(progress),
        abortControllerRef.current.signal // передаем signal для отмены
      );

      // Получаем ID видео с сервера
      const videoId = response.video_id || response.id || `video-${Date.now()}`;
      setServerVideoId(videoId);

      setUploadProgress(100);
      setIsUploading(false);
      setIsProcessing(false);
      createThumbnail(url);

      // Очищаем abortController после успешной загрузки
      abortControllerRef.current = null;
    } catch (error) {
      // Если ошибка из-за отмены - не показываем сообщение об ошибке
      if (error.name === "AbortError") {
        console.log("Загрузка отменена пользователем");
        return;
      }

      console.error("Ошибка загрузки видео:", error);
      setIsUploading(false);
      setIsProcessing(false);

      // УСТАНАВЛИВАЕМ ОШИБКУ ДЛЯ ОТОБРАЖЕНИЯ В ИНТЕРФЕЙСЕ
      setErrorType("upload");
      setUploadError(error.message);
      setUploadProgress(0);

      // Очищаем URL если загрузка не удалась
      if (videoUrlRef.current) {
        URL.revokeObjectURL(videoUrlRef.current);
        videoUrlRef.current = "";
        setVideoUrl("");
      }

      // Если ошибка авторизации, вызываем событие для выхода
      if (error.response?.data?.code === 10004) {
        window.dispatchEvent(new Event("tokenExpired"));
      }

      // Очищаем abortController при ошибке
      abortControllerRef.current = null;
    }
  };

  // Функция для перезапуска обработки
  const restartProcessing = () => {
    if (processIntervalRef.current) {
      clearInterval(processIntervalRef.current);
      processIntervalRef.current = null;
    }

    setErrorType(null);
    setIsProcessing(true);
    setUploadProgress(60);
    setProgressKey((prev) => prev + 1);
    thumbnailCreatedRef.current = false;

    let currentProgress = 0;
    processIntervalRef.current = setInterval(() => {
      currentProgress += 1;
      setUploadProgress(currentProgress);

      if (currentProgress >= 100) {
        clearInterval(processIntervalRef.current);
        setIsProcessing(false);
        createThumbnail(videoUrlRef.current);
        return;
      }
    }, 100);
  };

  // Обработка выбора файла
  const handleFileSelectInternal = (event) => {
    const file = event.target.files[0];
    if (file) {
      const validationError = validateFile(file);
      if (validationError) {
        setUploadError(validationError);
        setErrorType("upload");
        return;
      }

      setUploadError("");
      setErrorType(null);
      startVideoProcessing(file);

      if (onFileSelect) {
        onFileSelect(file);
      }

      event.target.value = "";
    }
  };

  // Клик по кнопке выбора файла
  const handleSelectFileClick = () => {
    document.getElementById("video-upload-retry").click();
  };

  // Функция для создания дашборда с текущим видео
  const handleCreateDashboard = useCallback(() => {
    if (!serverVideoId) {
      console.error("Нет videoId для создания дашборда");
      return;
    }

    // Сохраняем всю необходимую информацию о видео
    const videoInfo = {
      serverVideoId,
      videoName,
      videoNote,
      videoThumbnail, // Сохраняем миниатюру
      videoUrl: videoUrlRef.current, // Сохраняем URL видео
      originalFileName: currentOriginalFileName,
      uploadDate,
      zones: zones.map((zone) => ({
        id: zone.id,
        name: zone.name,
        color: zone.color,
        points: zone.points,
      })),
      masks: masks.map((mask) => ({
        id: mask.id,
        name: mask.name,
        color: mask.color,
        points: mask.points,
      })),
      connectedDashboards: connectedDashboards.map((d) => ({
        id: d.id,
        title: d.title,
      })),
    };

    console.log("Сохраненные данные видео для передачи:", {
      hasThumbnail: !!videoThumbnail,
      hasVideoUrl: !!videoUrlRef.current,
      videoUrlLength: videoUrlRef.current?.length,
    });

    // Сохраняем в localStorage для надежности
    localStorage.setItem("videoForDashboard", JSON.stringify(videoInfo));

    // Переходим на страницу создания дашборда
    navigate("/create_dashboard", {
      state: {
        fromVideo: true,
        videoId: serverVideoId,
        videoName: videoName || "Видео без названия",
        // Передаем полные данные видео
        videoData: {
          videoName,
          videoNote,
          videoThumbnail, // Передаем миниатюру
          videoUrl: videoUrlRef.current, // Передаем URL видео
          originalFileName: currentOriginalFileName,
          uploadDate,
          serverVideoId,
          connectedDashboards,
          zones,
          masks,
          wasProcessed: true,
        },
      },
    });
  }, [
    serverVideoId,
    videoName,
    videoNote,
    videoThumbnail,
    currentOriginalFileName,
    uploadDate,
    zones,
    masks,
    connectedDashboards,
    navigate,
  ]);

  // Функции для управления подключенными дашбордами
  const handleAddDashboard = useCallback(() => {
    if (connectedDashboards.length < 5) {
      handleCreateDashboard();
    }
  }, [connectedDashboards.length, handleCreateDashboard]);

  const handleRemoveDashboard = useCallback(
    (dashboardId) => {
      setConnectedDashboards(
        connectedDashboards.filter((d) => d.id !== dashboardId)
      );
    },
    [connectedDashboards]
  );

  const handleAddTemplate = useCallback(() => {
    if (connectedDashboards.length < 5) {
      const newTemplate = {
        id: `template-${Date.now()}`,
        title: `Шаблон ${connectedDashboards.length + 1}`,
      };
      setConnectedDashboards([...connectedDashboards, newTemplate]);
    }
  }, [connectedDashboards]);

  // Функция для загрузки видеофайла с сервера
  const loadVideoFileFromServer = useCallback(
    async (videoId) => {
      if (!videoId || isDownloadingVideo) return;

      try {
        setIsDownloadingVideo(true);
        setIsLoadingFromServer(true);
        console.log("Начинаем загрузку видеофайла с ID:", videoId);

        // Создаем AbortController для отмены загрузки
        abortControllerRef.current = new AbortController();

        const videoFileData = await videoService.loadVideoFile(
          videoId,
          (progress) => {
            setVideoDownloadProgress(progress);
          },
          abortControllerRef.current.signal // передаем signal для отмены
        );

        console.log("Видеофайл загружен");

        setVideoUrl(videoFileData.url);
        videoUrlRef.current = videoFileData.url;

        if (!thumbnailCreatedRef.current) {
          createThumbnail(videoFileData.url);
        }

        // Сбрасываем прогресс после успешной загрузки
        setVideoDownloadProgress(0);
        setVideoFileError(null);

        // Очищаем abortController
        abortControllerRef.current = null;
      } catch (error) {
        // Если ошибка из-за отмены - не показываем сообщение об ошибке
        if (error.name === "AbortError") {
          console.log("Загрузка видео отменена пользователем");
          return;
        }

        console.error("Ошибка загрузки видеофайла:", error);
        setVideoDownloadProgress(0);
        setVideoFileError("Ошибка загрузки видеофайла: " + error.message);

        if (currentVideoFile) {
          const localUrl = URL.createObjectURL(currentVideoFile);
          setVideoUrl(localUrl);
          videoUrlRef.current = localUrl;
        }

        // Очищаем abortController при ошибке
        abortControllerRef.current = null;
      } finally {
        setIsDownloadingVideo(false);
        setIsLoadingFromServer(false);
      }
    },
    [currentVideoFile, createThumbnail, isDownloadingVideo]
  );

  const loadDashboardsInfo = async (dashboardIds) => {
    if (!dashboardIds || dashboardIds.length === 0) {
      return [];
    }

    try {
      // Загружаем список всех дашбордов пользователя
      const allDashboards = await dashboardService.getUserDashboards();
      console.log("Все дашборды пользователя:", allDashboards);

      // Фильтруем только те дашборды, которые привязаны к видео
      const connectedDashboards = allDashboards.filter((dashboard) =>
        dashboardIds.includes(dashboard.dashboard_id)
      );

      console.log("Найденные подключенные дашборды:", connectedDashboards);

      // Преобразуем в нужный формат
      return connectedDashboards.map((dashboard) => ({
        id: dashboard.dashboard_id,
        title:
          dashboard.name || `Дашборд ${dashboard.dashboard_id.slice(0, 8)}`,
      }));
    } catch (error) {
      console.error("Ошибка загрузки информации о дашбордах:", error);
      // В случае ошибки возвращаем дашборды с ID
      return dashboardIds.map((id) => ({
        id,
        title: `Дашборд ${id.slice(0, 8)}`,
      }));
    }
  };

  useEffect(() => {
    if (location.state && location.state.dashboardId) {
      console.log("Перешли из дашборда, ID:", location.state.dashboardId);
      const newDashboardId = location.state.dashboardId;

      setDashboardIdFromModal(newDashboardId);

      // Сразу добавляем в connectedDashboards с временным названием
      if (!connectedDashboards.some((d) => d.id === newDashboardId)) {
        const tempDashboard = {
          id: newDashboardId,
          title: `Дашборд ${newDashboardId.slice(0, 8)}...`,
        };

        setConnectedDashboards([tempDashboard, ...connectedDashboards]);

        // Сразу загружаем настоящее название
        loadDashboardNameImmediately(newDashboardId);
      }

      // Очищаем state навигации
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state]);

  // Инициализация состояния при загрузке компонента
  useEffect(() => {
    const loadVideoData = async () => {
      console.log(
        "Начало загрузки данных видео, location.state:",
        location.state
      );

      // ВАЖНО: если есть данные в state, применяем их, но ВСЕГДА загружаем свежие данные с сервера
      if (location.state?.videoData) {
        console.log(
          "Используем данные из state как временные:",
          location.state.videoData
        );
        const { videoData } = location.state;

        // Быстро обновляем состояния из полученных данных для мгновенного отображения
        if (videoData.videoName) setVideoName(videoData.videoName);
        if (videoData.videoNote) setVideoNote(videoData.videoNote);
        if (videoData.videoThumbnail) {
          setVideoThumbnail(videoData.videoThumbnail);
          thumbnailCreatedRef.current = true;
        }
        if (videoData.videoUrl) {
          setVideoUrl(videoData.videoUrl);
          videoUrlRef.current = videoData.videoUrl;
        }
        if (videoData.originalFileName)
          setCurrentOriginalFileName(videoData.originalFileName);
        if (videoData.uploadDate) setUploadDate(videoData.uploadDate);
        if (videoData.serverVideoId) setServerVideoId(videoData.serverVideoId);
        if (videoData.connectedDashboards)
          setConnectedDashboards(videoData.connectedDashboards);
        if (videoData.zones) setZones(videoData.zones);
        if (videoData.masks) setMasks(videoData.masks);

        console.log("Данные из state применены как временные");

        // НЕ возвращаемся! Продолжаем загрузку свежих данных с сервера
        // Очищаем state навигации сразу
        navigate(location.pathname, { replace: true, state: {} });
      }

      // Определяем какой videoId загружать
      let videoIdToLoad = null;

      if (serverVideoId) {
        videoIdToLoad = serverVideoId;
      } else if (location.state?.videoData?.serverVideoId) {
        videoIdToLoad = location.state.videoData.serverVideoId;
      } else if (videoData?.serverVideoId) {
        videoIdToLoad = videoData.serverVideoId;
      }

      console.log("VideoId для загрузки:", videoIdToLoad);

      // Если есть videoId - загружаем ВСЕ данные с сервера
      if (videoIdToLoad) {
        try {
          console.log(
            "Начинаем загрузку данных с сервера для videoId:",
            videoIdToLoad
          );
          setIsLoading(true);

          const freshData = await videoService.getVideo(videoIdToLoad);
          console.log("Свежие данные с сервера:", {
            name: freshData.name,
            dashboards: freshData.dashboards,
            zones: freshData.zones,
            masks: freshData.masks,
          });

          // ОБНОВЛЯЕМ ВСЕ ДАННЫЕ С СЕРВЕРА

          // Основные данные
          if (freshData.name) setVideoName(freshData.name);
          if (freshData.file_name)
            setCurrentOriginalFileName(freshData.file_name);
          if (freshData.description && freshData.description !== "None") {
            setVideoNote(freshData.description);
          }

          // Миниатюра
          if (freshData.frame) {
            const thumbnail = `data:image/jpeg;base64,${freshData.frame}`;
            setVideoThumbnail(thumbnail);
            thumbnailCreatedRef.current = true;
          }

          // Дата загрузки
          if (freshData.upload_date) {
            const serverDate = new Date(freshData.upload_date);
            const formattedDate = serverDate.toLocaleString("ru-RU", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            });
            setUploadDate(formattedDate);
          }

          // Подключенные дашборды
          if (freshData.dashboards && freshData.dashboards.length > 0) {
            console.log("ID дашбордов с сервера:", freshData.dashboards);
            const dashboardsInfo = await loadDashboardsInfo(
              freshData.dashboards
            );
            console.log("Информация о дашбордах:", dashboardsInfo);
            setConnectedDashboards(dashboardsInfo);
          } else {
            setConnectedDashboards([]);
          }

          // Зоны
          // Обрабатываем зоны с сервера
          if (freshData.zones) {
            const formattedZones = freshData.zones.map((zone, index) => ({
              id: zone.id || `zone-${Date.now()}-${index}`,
              name: zone.name || `Зона ${index + 1}`,
              color: zone.color || "#E1760B",
              points: (zone.coords || []).map((coord) => {
                // Преобразуем проценты (0-100) в относительные координаты (0-1)
                const x = Array.isArray(coord)
                  ? parseFloat(coord[0]) / 100
                  : 0.5;
                const y = Array.isArray(coord)
                  ? parseFloat(coord[1]) / 100
                  : 0.5;
                return {
                  x: isNaN(x) ? 0.5 : Math.max(0, Math.min(1, x)), // Ограничиваем 0-1
                  y: isNaN(y) ? 0.5 : Math.max(0, Math.min(1, y)), // Ограничиваем 0-1
                };
              }),
            }));
            console.log(
              "Загруженные зоны с сервера (после преобразования):",
              formattedZones
            );
            setZones(formattedZones);
          }

          // Обрабатываем маски с сервера
          if (freshData.masks) {
            const formattedMasks = freshData.masks.map((mask, index) => ({
              id: mask.id || `mask-${Date.now()}-${index}`,
              name: mask.name || `Маска ${index + 1}`,
              color: mask.color || "#EB3134",
              points: (mask.coords || []).map((coord) => {
                // Преобразуем проценты (0-100) в относительные координаты (0-1)
                const x = Array.isArray(coord)
                  ? parseFloat(coord[0]) / 100
                  : 0.5;
                const y = Array.isArray(coord)
                  ? parseFloat(coord[1]) / 100
                  : 0.5;
                return {
                  x: isNaN(x) ? 0.5 : Math.max(0, Math.min(1, x)), // Ограничиваем 0-1
                  y: isNaN(y) ? 0.5 : Math.max(0, Math.min(1, y)), // Ограничиваем 0-1
                };
              }),
            }));
            console.log(
              "Загруженные маски с сервера (после преобразования):",
              formattedMasks
            );
            setMasks(formattedMasks);
          }

          // Устанавливаем serverVideoId
          setServerVideoId(videoIdToLoad);

          // Статусы
          setIsProcessing(false);
          setIsUploading(false);
          setUploadProgress(100);

          console.log("Все данные загружены с сервера");
        } catch (error) {
          console.error("Ошибка загрузки данных с сервера:", error);
        } finally {
          setIsLoading(false);
        }
      }
      // Если есть файл и видео еще не обработано - начинаем обработку
      else if (currentVideoFile && !errorType && videoState === "add") {
        startVideoProcessing(currentVideoFile);
      }

      // Если вернулись с созданным дашбордом - дополнительная обработка
      if (location.state?.dashboardCreated && serverVideoId) {
        console.log("Дополнительная обработка после создания дашборда");
        // Данные уже загружены выше, просто логируем
        if (location.state.newDashboardId) {
          console.log("Новый дашборд создан:", {
            dashboardId: location.state.newDashboardId,
            dashboardName: location.state.dashboardName,
          });
        }
      }
    };

    loadVideoData();
  }, [location.state]); // location.state в зависимостях

  // Отдельный эффект для загрузки видеофайла с сервера
  useEffect(() => {
    const loadVideoFileIfNeeded = async () => {
      // Если у нас есть serverVideoId и мы в режиме просмотра/редактирования
      if ((videoState === "view" || videoState === "edit") && serverVideoId) {
        // Если нет локального видеофайла и видео еще не загружено И загрузка не в процессе
        if (
          !currentVideoFile &&
          !videoUrl &&
          videoDownloadProgress === 0 &&
          !videoFileError
        ) {
          console.log("Начинаем загрузку видеофайла с сервера");
          await loadVideoFileFromServer(serverVideoId);
        }
      }
    };

    loadVideoFileIfNeeded();
  }, [
    serverVideoId,
    videoState,
    currentVideoFile,
    videoUrl,
    videoDownloadProgress,
    videoFileError,
    loadVideoFileFromServer,
  ]);

  const handleTabClick = useCallback((tab) => {
    setActiveTab(tab);
  }, []);

  const handleVideoNameChange = useCallback((e) => {
    setVideoName(e.target.value);
  }, []);

  const handleVideoNoteChange = useCallback((e) => {
    setVideoNote(e.target.value);
  }, []);

  // Функция для перехода на дашборд
  const handleDashboardClick = (dashboardId, dashboardName) => {
    console.log("Переход на дашборд:", dashboardId, dashboardName);
    navigate("/dashboards", {
      state: {
        selectedDashboardId: dashboardId,
        dashboardName: dashboardName,
      },
    });
  };

  const loadDashboardNameImmediately = async (dashboardId) => {
    try {
      const allDashboards = await dashboardService.getUserDashboards();
      const dashboardInfo = allDashboards.find(
        (d) => d.dashboard_id === dashboardId
      );

      if (dashboardInfo && dashboardInfo.name) {
        // Обновляем название в connectedDashboards
        setConnectedDashboards((prev) =>
          prev.map((d) =>
            d.id === dashboardId ? { ...d, title: dashboardInfo.name } : d
          )
        );
        console.log("Название дашборда загружено сразу:", dashboardInfo.name);
      }
    } catch (error) {
      console.log("Не удалось сразу загрузить название дашборда:", error);
    }
  };

  // Функция для загрузки названий дашбордов
  const loadDashboardNames = async () => {
    try {
      if (!dashboardIdFromModal && connectedDashboards.length === 0) return;

      console.log("Загрузка названий дашбордов...");

      const allDashboards = await dashboardService.getUserDashboards();
      console.log("Все дашборды пользователя:", allDashboards);

      const updatedConnectedDashboards = [...connectedDashboards];
      let foundDashboards = false;

      // Если есть ID из модального окна и он еще не в списке
      if (
        dashboardIdFromModal &&
        !connectedDashboards.some((d) => d.id === dashboardIdFromModal)
      ) {
        const dashboardInfo = allDashboards.find(
          (d) => d.dashboard_id === dashboardIdFromModal
        );
        if (dashboardInfo) {
          const newDashboard = {
            id: dashboardInfo.dashboard_id,
            title:
              dashboardInfo.name ||
              `Дашборд ${dashboardInfo.dashboard_id.slice(0, 8)}`,
            // Сохраняем информацию для функции onClick, но не саму функцию в данных
            dashboardInfo: {
              id: dashboardInfo.dashboard_id,
              name: dashboardInfo.name,
            },
          };
          updatedConnectedDashboards.unshift(newDashboard);
          foundDashboards = true;
          console.log("Добавлен дашборд из модального окна:", newDashboard);
        }
      }

      // Обновляем названия существующих дашбордов
      for (let i = 0; i < updatedConnectedDashboards.length; i++) {
        const dashboard = updatedConnectedDashboards[i];
        const dashboardInfo = allDashboards.find(
          (d) => d.dashboard_id === dashboard.id
        );

        if (dashboardInfo) {
          // Обновляем название если нужно
          if (dashboardInfo.name && dashboard.title !== dashboardInfo.name) {
            updatedConnectedDashboards[i] = {
              ...dashboard,
              title: dashboardInfo.name,
              dashboardInfo: {
                id: dashboardInfo.dashboard_id,
                name: dashboardInfo.name,
              },
            };
            foundDashboards = true;
          }
        }
      }

      if (foundDashboards) {
        setConnectedDashboards(updatedConnectedDashboards);
        console.log(
          "Обновленные подключенные дашборды:",
          updatedConnectedDashboards
        );
      }
    } catch (error) {
      console.log("Не удалось загрузить информацию о дашбордах:", error);
    }
  };

  const handleSave = async () => {
    console.log("=== ДАННЫЕ ДЛЯ СОХРАНЕНИЯ ===");

    try {
      if (serverVideoId) {
        const dashboardIds = [];

        if (dashboardIdFromModal) {
          dashboardIds.push(dashboardIdFromModal);
        }

        connectedDashboards.forEach((dashboard) => {
          if (dashboard.id && !dashboardIds.includes(dashboard.id)) {
            dashboardIds.push(dashboard.id);
          }
        });

        const dataToSave = {
          videoId: serverVideoId,
          name: videoName,
          description: videoNote,
          dashboards: dashboardIds,
          zones: zones.map((zone) => ({
            name: zone.name,
            description: zone.description || "",
            color: zone.color,
            coords: zone.points
              ? zone.points.map((point) => [
                  Math.round(point.x * 100),
                  Math.round(point.y * 100),
                ])
              : [],
          })),
          masks: masks.map((mask) => ({
            name: mask.name,
            description: mask.description || "",
            color: mask.color,
            coords: mask.points
              ? mask.points.map((point) => [
                  Math.round(point.x * 100),
                  Math.round(point.y * 100),
                ])
              : [],
          })),
        };

        console.log("Отправка данных на сервер с дашбордами:", dashboardIds);

        await videoService.setVideoData(dataToSave);

        console.log("Запуск обработки видео...");
        await videoService.processVideo(serverVideoId);
        console.log("Обработка видео запущена успешно");

        // Загружаем названия дашбордов
        await loadDashboardNames();
      }

      const currentPath = location.pathname;
      const videoId =
        currentPath.split("/video/")[1]?.split("/")[0] || serverVideoId;

      // ВАЖНО: Передаем ВСЕ данные о зонах и масках
      navigate(`/video/${videoId}/view`, {
        state: {
          videoData: {
            videoName,
            videoNote,
            videoThumbnail,
            originalFileName: currentOriginalFileName,
            uploadDate: uploadDate,
            serverVideoId: serverVideoId,
            wasProcessed: true,
            connectedDashboards: connectedDashboards.map((d) => ({
              id: d.id,
              title: d.title,
            })),
            // ДОБАВЛЯЕМ ЗОНЫ И МАСКИ
            zones: zones.map((zone) => ({
              id: zone.id,
              name: zone.name,
              color: zone.color,
              points: zone.points,
            })),
            masks: masks.map((mask) => ({
              id: mask.id,
              name: mask.name,
              color: mask.color,
              points: mask.points,
            })),
          },
        },
      });
    } catch (error) {
      console.error("Ошибка при сохранении:", error);
      if (error.response?.data?.code === 10004) {
        window.dispatchEvent(new Event("tokenExpired"));
      }
    }
  };

  const handleRetryUpload = () => {
    setErrorType(null);
    setUploadError("");
    handleSelectFileClick();
  };

  const handleEdit = () => {
    const currentPath = location.pathname;
    const videoId = currentPath.split("/video/")[1]?.split("/")[0];

    const currentVideoData = {
      videoName,
      videoNote,
      videoThumbnail,
      originalFileName: currentOriginalFileName,
      videoFile: currentVideoFile,
      videoUrl: videoUrlRef.current,
      connectedDashboards: connectedDashboards.map((d) => ({
        id: d.id,
        title: d.title,
      })),
      zones: zones.map((zone) => ({
        id: zone.id,
        name: zone.name,
        color: zone.color,
        points: zone.points,
      })),
      masks: masks.map((mask) => ({
        id: mask.id,
        name: mask.name,
        color: mask.color,
        points: mask.points,
      })),
      wasProcessed: true,
      serverVideoId,
    };

    navigate(`/video/${videoId}`, {
      state: {
        videoFile: currentVideoFile,
        originalFileName: currentOriginalFileName,
        videoData: currentVideoData,
      },
      replace: true,
    });
  };
  const handleDelete = async () => {
    if (isDeleting) return; // Предотвращаем множественные нажатия

    try {
      setIsDeleting(true);
      // Если есть serverVideoId - удаляем с сервера
      if (serverVideoId) {
        await videoService.deleteVideo(serverVideoId);
      } else {
        console.warn(
          "[handleDelete] serverVideoId отсутствует, удаляем только локально"
        );
      }
      navigate("/videos");
    } catch (error) {
      console.error("[handleDelete] Ошибка при удалении видео:", error);
      if (error.response?.data?.code === 10004) {
        window.dispatchEvent(new Event("tokenExpired"));
      }
    } finally {
      setIsDeleting(false);
    }
  };

  const StatusIcon = uploadStatus.icon;

  // useEffect для улучшенного захвата кадра
  useEffect(() => {
    if (isCreatingZone && videoRef?.current && activeTab === "zones") {
      // Принудительно обновляем кадр при переключении на вкладку зон
      const timer = setTimeout(() => {}, 50);

      return () => clearTimeout(timer);
    }
  }, [isCreatingZone, activeTab]);

  // Обработчики для подсветки зон
  const handleZoneHover = useCallback((zoneId) => {
    console.log("Hovering zone:", zoneId);
    setHighlightedZoneId(zoneId);
  }, []);

  const handleZoneLeave = useCallback(() => {
    setHighlightedZoneId(null);
  }, []);

  // Обработчики для подсветки масок
  const handleMaskHover = useCallback((maskId) => {
    console.log("Hovering mask:", maskId);
    setHighlightedMaskId(maskId);
  }, []);

  const handleMaskLeave = useCallback(() => {
    setHighlightedMaskId(null);
  }, []);

  const handleExit = useCallback(() => {
    // Отменяем текущую загрузку
    cancelUpload();

    // Вызываем оригинальный onExit
    if (onExit) {
      onExit();
    }
  }, [cancelUpload, onExit]);

  return (
    <div className={styles.mainArea}>
      <div className={styles.header}>
        <div className={styles.headerText}>
          <div className={styles.headerName}>
            <h2>Загруженные видео</h2>
            <div className={styles.headerWay}>
              <ArrowIcon />
              <p
                className={videoState === "edit" ? styles.videoName : undefined}
              >
                {videoState === "add" ? "Добавление видео" : videoName}
              </p>
              {videoState === "edit" && (
                <>
                  <ArrowIcon />
                  <p className={styles.staticText}>Редактирование видео</p>
                </>
              )}
            </div>
          </div>
          {(videoState === "add" || videoState === "edit") && (
            <h3>
              Вы можете отредактировать информацию, просмотреть видео и отметить
              для него особые зоны.
            </h3>
          )}
        </div>
        <div
          className={`${styles.buttonsContainer} ${
            videoState === "view" ? styles.small : undefined
          }`}
        >
          {videoState === "view" ? (
            <>
              <SmallButton icon={EditIcon} onClick={handleEdit} />
              <SmallButton icon={DeleteIcon} onClick={handleDelete} />
            </>
          ) : (
            <>
              <ButtonGray text="Выйти" onClick={handleExit} />
              <PrimaryButton
                text="Сохранить"
                icon={UploadVideoIcon}
                onClick={handleSave}
                disabled={isProcessing || isUploading || errorType}
              />
            </>
          )}
        </div>
      </div>
      <div className={styles.mainContainer}>
        {isCreatingZone || isCreatingMask ? (
          <div className={styles.createZoneContainer}>
            {isCreatingZone ? (
              // Форма создания зоны
              <CreateZoneForm
                initialZoneName={zoneName}
                initialZoneColor={zoneColor}
                zonePoints={zonePoints}
                colorOptions={colorOptions}
                onSaveZone={handleSaveZone}
                onCancel={handleCancelCreatingZone}
                onZoneNameChange={handleZoneNameChange}
                onZoneColorChange={handleZoneColorChange}
                isMask={false}
              />
            ) : (
              // Форма создания маски
              <CreateZoneForm
                initialZoneName={maskName}
                initialZoneColor="#EB3134" // Фиксированный красный цвет
                zonePoints={maskPoints}
                colorOptions={[]} // Пустой массив - нельзя выбрать цвет
                onSaveZone={handleSaveMask}
                onCancel={handleCancelCreatingMask}
                onZoneNameChange={handleMaskNameChange}
                onZoneColorChange={() => {}} // Пустая функция - цвет нельзя менять
                isMask={true}
              />
            )}
          </div>
        ) : (
          <InfoContainer
            activeTab={activeTab}
            onTabClick={handleTabClick}
            currentVideoFile={currentVideoFile}
            originalFileName={currentOriginalFileName}
            uploadDate={uploadDate}
            isProcessing={
              isProcessing ||
              isUploading ||
              isLoadingFromServer ||
              videoDownloadProgress > 0
            }
            videoThumbnail={videoThumbnail}
            thumbnailCreatedRef={thumbnailCreatedRef}
            errorType={errorType}
            videoState={videoState}
            connectedDashboards={connectedDashboards}
            onAddDashboard={handleAddDashboard}
            onAddTemplate={handleAddTemplate}
            onRemoveDashboard={handleRemoveDashboard}
            isCreatingZone={isCreatingZone}
            setIsCreatingZone={setIsCreatingZone}
            zones={zones}
            onDeleteZone={handleDeleteZone}
            masks={masks}
            onDeleteMask={handleDeleteMask}
            onStartCreatingMask={handleStartCreatingMask}
            onZoneHover={handleZoneHover}
            onZoneLeave={handleZoneLeave}
            onMaskHover={handleMaskHover}
            onMaskLeave={handleMaskLeave}
          />
        )}

        <VideoInfoContainer
          uploadProgress={
            isUploading
              ? uploadProgress
              : videoDownloadProgress > 0
              ? videoDownloadProgress
              : uploadProgress
          }
          isUploading={isUploading || videoDownloadProgress > 0}
          errorType={errorType}
          videoFileError={videoFileError}
          uploadStatus={uploadStatus}
          progressKey={progressKey + (videoDownloadProgress > 0 ? 1000 : 0)}
          renderStatusText={renderStatusText}
          isProcessing={
            isProcessing || isUploading || videoDownloadProgress > 0
          }
          videoUrl={videoUrl}
          videoThumbnail={videoThumbnail}
          thumbnailCreatedRef={thumbnailCreatedRef}
          currentVideoFile={currentVideoFile}
          uploadError={uploadError}
          handleRetryUpload={handleRetryUpload}
          handleFileSelect={handleFileSelectInternal}
          videoName={videoName}
          handleVideoNameChange={handleVideoNameChange}
          videoNote={videoNote}
          handleVideoNoteChange={handleVideoNoteChange}
          videoState={videoState}
          activeTab={activeTab}
          // Для зон
          isCreatingZone={isCreatingZone}
          zoneColor={zoneColor}
          onZonePointsChange={handleZonePointsChange}
          zonePoints={zonePoints}
          // Для масок
          isCreatingMask={isCreatingMask}
          maskColor="#EB3134"
          onMaskPointsChange={handleMaskPointsChange}
          maskPoints={maskPoints}
          videoRef={videoRef}
          onVideoTimeUpdate={handleVideoTimeUpdate}
          currentVideoTime={currentVideoTime}
          zones={zones}
          masks={masks}
          isEditable={
            (videoState === "edit" || videoState === "add") &&
            activeTab === "zones" &&
            !isCreatingZone &&
            !isCreatingMask
          }
          highlightedZoneId={highlightedZoneId}
          highlightedMaskId={highlightedMaskId}
        />
      </div>
    </div>
  );
};
