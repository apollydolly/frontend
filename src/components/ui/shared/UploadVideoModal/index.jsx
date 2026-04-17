import React, {
  useRef,
  useState,
  useMemo,
  useEffect,
  useCallback,
} from "react";
import { useNavigate } from "react-router-dom";
import styles from "./UploadVideoModal.module.scss";
import CloseIcon from "@icons/close.svg?react";
import SelectFileIcon from "@icons/document.svg?react";
import ErrorIcon from "@icons/error.svg?react";
import CameraIcon from "@icons/camera.svg?react";
import { PrimaryButton } from "@ui/buttons/PrimaryButton";
import { CloseButton } from "@ui/buttons/CloseButton";
import { Tabs } from "@ui/shared/Tabs";
import { SearchBox } from "@ui/shared/SearchBox";
import SimpleBar from "simplebar-react";
import { videoService } from "@services/videoService";
import { webSocketService } from "@services/websocketService";
import { widgetMappingService } from "@services/widgetMappingService";

export const UploadVideoModal = ({
  isOpen,
  onClose,
  fromDashboard = false,
  dashboardId,
  onSuccess,
  tab = "online",
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState(tab);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [offset, setOffset] = useState(0);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const simpleBarRef = useRef(null);
  const navigate = useNavigate();

  // Загрузка видео с сервера
  const loadVideos = useCallback(
    async (reset = false, loadMore = false) => {
      if (loading && !loadMore) return;
      if (isLoadingMore && loadMore) return;

      if (loadMore) {
        setIsLoadingMore(true);
      } else {
        setLoading(true);
      }

      try {
        const currentOffset = reset ? 0 : offset;
        const response = await videoService.getVideoList(9, currentOffset);
        console.log("Ответ от сервера:", response);

        const newVideos = response.video_list || [];

        if (reset) {
          setVideos(newVideos);
          setOffset(3);
          setHasMore(newVideos.length === 3); // Если получили полный лимит, значит есть еще
        } else {
          setVideos((prev) => [...prev, ...newVideos]);
          setOffset((prev) => prev + 3);
          setHasMore(newVideos.length === 3); // Если получили меньше лимита, значит конец
        }

        if (!initialLoadComplete && reset) {
          setInitialLoadComplete(true);
        }
      } catch (error) {
        console.error("Ошибка при загрузке видео:", error);
        setError("Не удалось загрузить список видео");
      } finally {
        if (loadMore) {
          setIsLoadingMore(false);
        } else {
          setLoading(false);
        }
      }
    },
    [loading, isLoadingMore, offset, initialLoadComplete],
  );

  // Фильтрация видео на клиенте
  const filteredVideos = useMemo(() => {
    if (!searchQuery.trim()) {
      return videos;
    }

    const query = searchQuery.toLowerCase();
    return videos.filter(
      (video) =>
        video.name?.toLowerCase().includes(query) ||
        video.file_name?.toLowerCase().includes(query),
    );
  }, [videos, searchQuery]);

  // Обработчик прокрутки для ленивой загрузки
  const handleScroll = useCallback(() => {
    if (!simpleBarRef.current || !hasMore || isLoadingMore) return;

    const scrollElement = simpleBarRef.current.getScrollElement();
    if (!scrollElement) return;

    const { scrollTop, scrollHeight, clientHeight } = scrollElement;
    const scrollBottom = scrollHeight - scrollTop - clientHeight;

    // Загружаем следующую порцию при приближении к концу (50px от низа)
    if (scrollBottom < 50 && hasMore && !isLoadingMore) {
      console.log("Достигнут низ, загружаем еще видео...");
      loadVideos(false, true);
    }
  }, [hasMore, isLoadingMore, loadVideos]);

  // Инициализация при открытии вкладки
  useEffect(() => {
    if (isOpen && activeTab === "uploadVideo" && !initialLoadComplete) {
      loadVideos(true);
    }
  }, [isOpen, activeTab, initialLoadComplete, loadVideos]);

  // Сброс при закрытии/открытии модалки
  useEffect(() => {
    if (!isOpen) {
      setVideos([]);
      setOffset(0);
      setHasMore(true);
      setInitialLoadComplete(false);
      setSelectedVideo(null);
      setSearchQuery("");
    }
  }, [isOpen]);

  // Настройка обработчика прокрутки
  useEffect(() => {
    if (!simpleBarRef.current) return;

    const scrollElement = simpleBarRef.current.getScrollElement();
    if (scrollElement) {
      scrollElement.addEventListener("scroll", handleScroll);
      return () => scrollElement.removeEventListener("scroll", handleScroll);
    }
  }, [handleScroll]);

  // Обновляем обработчик при изменении hasMore или isLoadingMore
  useEffect(() => {
    // Пересоздаем обработчик при изменении зависимостей
    const scrollElement = simpleBarRef.current?.getScrollElement();
    if (scrollElement) {
      scrollElement.removeEventListener("scroll", handleScroll);
      scrollElement.addEventListener("scroll", handleScroll);
    }

    return () => {
      if (scrollElement) {
        scrollElement.removeEventListener("scroll", handleScroll);
      }
    };
  }, [handleScroll]);

  if (!isOpen) return null;

  // Функции для форматирования времени и даты
  const formatTime = (dateTimeString) => {
    if (!dateTimeString) return "--:--";

    try {
      const date = new Date(dateTimeString);
      const hours = date.getHours().toString().padStart(2, "0");
      const minutes = date.getMinutes().toString().padStart(2, "0");
      return `${hours}:${minutes}`;
    } catch (error) {
      console.error("Ошибка форматирования времени:", error, dateTimeString);
      return "--:--";
    }
  };

  const formatDate = (dateTimeString) => {
    if (!dateTimeString) return "дд.мм.гггг";

    try {
      const date = new Date(dateTimeString);
      const day = date.getDate().toString().padStart(2, "0");
      const month = (date.getMonth() + 1).toString().padStart(2, "0");
      const year = date.getFullYear();
      return `${day}.${month}.${year}`;
    } catch (error) {
      console.error("Ошибка форматирования даты:", error, dateTimeString);
      return "дд.мм.гггг";
    }
  };

  // Функция для получения превью из base64
  const getThumbnailUrl = (base64Frame) => {
    if (!base64Frame) return "";
    return `data:image/jpeg;base64,${base64Frame}`;
  };

  // Функция для выбора видео
  const handleVideoSelect = (video) => {
    setSelectedVideo(video.video_id);
  };

  // Функция для подключения видео
  const handleConnectVideo = async () => {
    if (!selectedVideo) {
      setError("Выберите видео для подключения");
      return;
    }

    if (!dashboardId) {
      setError("ID дашборда не указан");
      return;
    }

    try {
      setLoading(true);
      setError("");

      // Получаем данные о видео
      const videoData = await videoService.getVideo(selectedVideo);
      console.log("Video data received:", videoData);

      // Подготавливаем данные для обновления видео
      const updatedVideoData = {
        videoId: selectedVideo,
        name: videoData.name || videoData.file_name || "Без названия",
        description: videoData.description || "",
        dashboards: [...(videoData.dashboards || []), dashboardId],
        zones:
          videoData.zones && videoData.zones.length > 0
            ? videoData.zones
            : null,
        masks:
          videoData.masks && videoData.masks.length > 0
            ? videoData.masks
            : null,
      };

      console.log("Sending video data:", updatedVideoData);

      // Сохраняем обновленные данные видео
      await videoService.setVideoData(updatedVideoData);

      // Запускаем обработку видео для этого дашборда
      await videoService.processVideo(selectedVideo);

      // Получаем ID пользователя
      const userId = getUserId();

      if (userId) {
        // Подключаем WebSocket
        webSocketService.connect(userId);

        // Загружаем маппинг виджетов если еще не загружен
        if (!widgetMappingService.isLoaded) {
          await widgetMappingService.loadMapping();
        }

        console.log("WebSocket подключен через webSocketService");
      }

      // ВЫЗЫВАЕМ onSuccess И ПЕРЕДАЕМ ID ВИДЕО
      if (onSuccess) {
        onSuccess(selectedVideo); // Передаем ID видео
      }

      onClose();
    } catch (error) {
      console.error("Error connecting video:", error);
      setError(error.message || "Ошибка при подключении видео к дашборду");
    } finally {
      setLoading(false);
    }
  };

  // Получаем ID пользователя из токена
  const getUserId = () => {
    const token = localStorage.getItem("access_token");
    if (token) {
      try {
        // Декодируем JWT токен
        const payload = token.split(".")[1];
        const decoded = JSON.parse(atob(payload));
        return decoded.user?.id || null;
      } catch (error) {
        console.error("Error decoding token:", error);
        return null;
      }
    }
    return null;
  };

  // Функция для поиска
  const handleSearchChange = (query) => {
    setSearchQuery(query);
  };

  // Обработчик смены вкладки
  const handleTabClick = (tab) => {
    setActiveTab(tab);
    if (tab === "uploadVideo" && !initialLoadComplete) {
      loadVideos(true);
    }
  };

  const handleOnlineNext = () => {
    // Генерируем уникальный ID для онлайн-видео
    const onlineVideoId = `online-${Date.now()}`;

    // Переходим на страницу видео с флагом isOnlineMode
    navigate(`/video/${onlineVideoId}`, {
      state: {
        isOnlineMode: true,
        fromDashboard: fromDashboard,
        dashboardId: dashboardId,
      },
    });

    onClose();
  };

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

  // Проверка совместимости кодека видео
  const checkVideoCodecCompatibility = (file) => {
    return new Promise((resolve) => {
      const video = document.createElement("video");
      const url = URL.createObjectURL(file);

      video.preload = "metadata";
      video.muted = true;

      const timeout = setTimeout(() => {
        URL.revokeObjectURL(url);
        // Если таймаут - считаем, что видео не поддерживается
        resolve(false);
      }, 5000); // 5 секунд на проверку

      video.onloadeddata = () => {
        clearTimeout(timeout);
        URL.revokeObjectURL(url);

        // Если видео загрузилось и имеет валидные размеры - считаем совместимым
        const isCompatible =
          video.videoWidth > 0 && video.videoHeight > 0 && video.duration > 0;
        resolve(isCompatible);
      };

      video.onerror = () => {
        clearTimeout(timeout);
        URL.revokeObjectURL(url);
        resolve(false); // Если ошибка - не поддерживается
      };

      video.src = url;
      video.load();
    });
  };

  const handleUploadVideo = async (event) => {
    const file = event.target.files[0];
    if (file) {
      // 1. Базовая проверка формата
      const validationError = validateFile(file);
      if (validationError) {
        setError(validationError);
        return;
      }

      // 2. Проверка совместимости кодека
      try {
        const isCompatible = await checkVideoCodecCompatibility(file);

        if (!isCompatible) {
          setError("Файл не соответствует формату");
          return;
        }
      } catch (error) {
        console.error("Ошибка проверки совместимости:", error);
        setError("Файл не соответствует формату");
        return;
      }

      // 3. Если все проверки пройдены - продолжаем
      setError("");

      // Генерируем уникальный ID для видео
      const videoId = `video-${Date.now()}`;

      // Создаем объект с данными для передачи
      const stateData = {
        videoFile: file,
        originalFileName: file.name,
      };

      // Если подключение из дашборда - передаем его ID
      if (fromDashboard && dashboardId) {
        stateData.fromDashboard = true;
        stateData.dashboardId = dashboardId;
      }

      // Переходим на страницу видео
      navigate(`/video/${videoId}`, {
        state: stateData,
      });

      // Очищаем input
      event.target.value = "";

      // Закрываем модальное окно
      onClose();
    }
  };

  const handleDrop = async (event) => {
    event.preventDefault();
    setIsDragOver(false);

    const file = event.dataTransfer.files[0];
    if (file) {
      // 1. Базовая проверка формата
      const validationError = validateFile(file);
      if (validationError) {
        setError(validationError);
        return;
      }

      // 2. Проверка совместимости кодека
      try {
        const isCompatible = await checkVideoCodecCompatibility(file);

        if (!isCompatible) {
          setError("Файл не соответствует формату");
          return;
        }
      } catch (error) {
        console.error("Ошибка проверки совместимости:", error);
        setError("Файл не соответствует формату");
        return;
      }

      // 3. Если все проверки пройдены - продолжаем
      setError("");

      // Генерируем уникальный ID для видео
      const videoId = `video-${Date.now()}`;

      // Создаем объект с данными для передачи
      const stateData = {
        videoFile: file,
        originalFileName: file.name,
      };

      // Если подключение из дашборда - передаем его ID
      if (fromDashboard && dashboardId) {
        stateData.fromDashboard = true;
        stateData.dashboardId = dashboardId;
      }

      // Переходим на страницу видео
      navigate(`/video/${videoId}`, {
        state: stateData,
      });

      // Закрываем модальное окно
      onClose();
    }
  };

  const handleDragOver = (event) => {
    event.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (event) => {
    event.preventDefault();
    setIsDragOver(false);
  };

  const handleFileSelectClick = () => {
    document.getElementById("video-upload").click();
  };

  const handleClose = () => {
    setIsDragOver(false);
    setError("");
    onClose();
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modal}>
        <div>
          <div className={styles.modalHeader}>
            <div className={styles.headerText}>
              <h2>{fromDashboard ? "Подключение" : "Загрузка"} видео</h2>
              <p>
                {fromDashboard ? "Подключите" : "Загрузите"} видео, чтобы начать
                работу с дашбордами.
              </p>
            </div>
            <CloseButton icon={CloseIcon} onClick={handleClose} />
          </div>
          {fromDashboard && (
            <Tabs
              tabs={[
                {
                  id: "online",
                  label: "Онлайн",
                },
                {
                  id: "newVideo",
                  label: "Добавить видео",
                },
                {
                  id: "uploadVideo",
                  label: "Загруженные видео",
                },
              ]}
              activeTab={activeTab}
              onTabClick={handleTabClick}
            />
          )}
        </div>

        {activeTab === "newVideo" && (
          <div
            className={`${styles.uploadArea} ${
              isDragOver ? styles.dragOver : ""
            } ${fromDashboard ? styles.short : undefined}`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
          >
            <div className={styles.uploadText}>
              <h2>Новое видео</h2>
              <p>
                Выберите видео с компьютера или перетащите файл в эту область.
              </p>
              <p>Видео должно быть в формате AVI или MP4.</p>
            </div>

            <input
              type="file"
              accept="video/avi,video/mp4,.avi,.mp4"
              onChange={handleUploadVideo}
              className={styles.fileInput}
              id="video-upload"
            />
            <PrimaryButton
              text="Выбрать файл"
              icon={SelectFileIcon}
              onClick={handleFileSelectClick}
            />
            {error && (
              <div className={styles.errorMessage}>
                <ErrorIcon className={styles.errorIcon} />
                <p>{error}</p>
              </div>
            )}
          </div>
        )}

        {activeTab === "online" && (
          <div className={styles.connectOnlineContainer}>
            <div className={styles.onlineText}>
              <h2>Рекомендации для онлайн-записи коммуникации</h2>
              <ol>
                <li>
                  На протяжении всей видеозаписи в кадре должны присутствовать
                  только Вы, других лиц не должно быть в кадре (в том числе
                  плакатов, принтов на одежде).
                </li>
                <li>
                  Ваше лицо должно быть четко различимо (учитывайте его размер,
                  в зависимости от качества камеры).
                </li>
                <li>
                  На видео не должно присутствовать иных голосов, кроме вашего
                  голоса.
                </li>
                <li>
                  Видео не должно содержать музыки и посторонних шумов на фоне.
                </li>
                <li>
                  Видео должно быть записано в хорошо совещенном помещении.
                </li>
              </ol>
              <p>
                В случае невыполнения данных требований, результаты анализа
                могут оказаться некорректными.
              </p>
            </div>
            <PrimaryButton
              text="Далее"
              icon={CameraIcon}
              onClick={handleOnlineNext}
            />
          </div>
        )}

        {activeTab === "uploadVideo" && (
          <div className={styles.uploadVideoContainer}>
            <SearchBox
              placeholder="Поиск видео"
              value={searchQuery}
              onChange={handleSearchChange}
              noFilter="true"
              wide="true"
            />
            <div className={styles.videoListContainer}>
              <SimpleBar
                ref={simpleBarRef}
                className={styles.simplebarContainer}
                style={{
                  width: "910px",
                  height: "100%",
                }}
                autoHide={false}
                forceVisible="y"
              >
                <div className={styles.videoList}>
                  {!loading &&
                  initialLoadComplete &&
                  filteredVideos.length > 0 ? (
                    <>
                      {filteredVideos.map((video) => (
                        <div
                          key={video.video_id}
                          className={`${styles.videoListItem} ${
                            selectedVideo === video.video_id
                              ? styles.selected
                              : ""
                          }`}
                          onClick={() => handleVideoSelect(video)}
                        >
                          <div
                            className={styles.video}
                            style={{
                              backgroundImage: video.frame
                                ? `url(${getThumbnailUrl(video.frame)})`
                                : "none",
                              backgroundSize: "cover",
                              backgroundPosition: "center",
                            }}
                          >
                            {!video.frame && (
                              <CameraIcon
                                className={styles.videoPlaceholderIcon}
                              />
                            )}
                          </div>
                          <div className={styles.videoInfo}>
                            <h2
                              title={
                                video.name || video.file_name || "Без названия"
                              }
                            >
                              {video.name || video.file_name || "Без названия"}
                            </h2>
                            <div className={styles.timeDate}>
                              <p className={styles.time}>
                                {video.upload_date
                                  ? formatTime(video.upload_date)
                                  : "--:--"}
                              </p>
                              <p className={styles.date}>
                                {video.upload_date
                                  ? formatDate(video.upload_date)
                                  : "дд.мм.гггг"}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </>
                  ) : (
                    <div className={styles.noResults}>
                      {searchQuery && (
                        <p>Видео по запросу "{searchQuery}" не найдены</p>
                      )}
                    </div>
                  )}
                </div>
              </SimpleBar>
            </div>
            <PrimaryButton
              text="Подключить видео"
              icon={CameraIcon}
              onClick={handleConnectVideo}
              disabled={!selectedVideo || loading}
              loading={loading}
            />
          </div>
        )}
      </div>
    </div>
  );
};
