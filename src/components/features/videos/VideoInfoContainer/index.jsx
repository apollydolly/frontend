import React, { useState, useRef, useEffect, useCallback } from "react";
import styles from "./VideoInfoContainer.module.scss";
import { CustomVideoPlayer } from "@videos/CustomVideoPlayer";
import { PrimaryButton } from "@ui/buttons/PrimaryButton";
import SelectFileIcon from "@icons/document.svg?react";
import RefreshIcon from "@icons/refresh.svg?react";
import VideoIcon from "@icons/video.svg?react";
import VideoSaveIcon from "@icons/video-save.svg?react";
import ErrorIcon from "@icons/error.svg?react";
import { InputField } from "@ui/shared/InputField";

export const VideoInfoContainer = ({
  uploadProgress,
  errorType,
  videoFileError,
  uploadStatus,
  progressKey,
  renderStatusText,
  isProcessing,
  videoUrl,
  videoThumbnail,
  thumbnailCreatedRef,
  uploadError,
  handleRetryUpload,
  handleFileSelect,
  videoName,
  handleVideoNameChange,
  videoNote,
  handleVideoNoteChange,
  videoState,
  activeTab,
  isCreatingZone,
  zoneColor,
  onZonePointsChange,
  zonePoints = [],
  videoRef,
  onVideoTimeUpdate,
  currentVideoTime,
  zones = [],
  isCreatingMask,
  maskColor = "#EB3134",
  onMaskPointsChange,
  maskPoints = [],
  masks = [],
  highlightedZoneId = null,
  highlightedMaskId = null,
  isOnlineMode = false,
  onCameraReady,
}) => {
  const canvasRef = useRef(null);
  const captureVideoRef = useRef(null);
  const [frameCaptured, setFrameCaptured] = useState(false);
  const [actualCaptureTime, setActualCaptureTime] = useState(0);
  const [captureError, setCaptureError] = useState(null);
  const [currentFrameImage, setCurrentFrameImage] = useState(null);
  const timeoutRef = useRef(null);
  const [absoluteZonePoints, setAbsoluteZonePoints] = useState([]);
  const [absoluteMaskPoints, setAbsoluteMaskPoints] = useState([]);
  const [mediaStream, setMediaStream] = useState(null);
  const [cameraError, setCameraError] = useState(null);
  const localVideoRef = useRef(null);

  const isCreating = isCreatingZone || isCreatingMask;
  const currentColor = isCreatingMask ? maskColor : zoneColor;
  const currentPoints = isCreatingMask
    ? absoluteMaskPoints
    : absoluteZonePoints;
  const currentOnPointsChange = isCreatingMask
    ? onMaskPointsChange
    : onZonePointsChange;

  // ЗАПРОС ДОСТУПА К КАМЕРЕ И МИКРОФОНУ
  useEffect(() => {
    if (isOnlineMode && !mediaStream && !cameraError) {
      const requestCamera = async () => {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: true,
          });
          setMediaStream(stream);
          if (localVideoRef.current) localVideoRef.current.srcObject = stream;
          if (onCameraReady) onCameraReady(true, null);
        } catch (err) {
          let errorMsg = "Не удалось получить доступ к камере или микрофону";
          if (err.name === "NotAllowedError")
            errorMsg = "Пользователь запретил доступ к камере/микрофону";
          else if (err.name === "NotFoundError")
            errorMsg = "Камера или микрофон не найдены";
          setCameraError(errorMsg);
          if (onCameraReady) onCameraReady(false, errorMsg);
        }
      };
      requestCamera();
    }

    // Очистка при размонтировании
    return () => {
      if (mediaStream) {
        mediaStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [isOnlineMode, mediaStream, cameraError]);

  // Синхронизируем локальные абсолютные точки с переданными относительными точками
  useEffect(() => {
    if (canvasRef.current && zonePoints.length > 0) {
      const canvas = canvasRef.current;
      const absolutePoints = zonePoints.map((point) => ({
        x: point.x * canvas.width,
        y: point.y * canvas.height,
      }));
      setAbsoluteZonePoints(absolutePoints);
    } else if (zonePoints.length === 0) {
      setAbsoluteZonePoints([]);
    }
  }, [zonePoints]);

  useEffect(() => {
    if (canvasRef.current && maskPoints.length > 0) {
      const canvas = canvasRef.current;
      const absolutePoints = maskPoints.map((point) => ({
        x: point.x * canvas.width,
        y: point.y * canvas.height,
      }));
      setAbsoluteMaskPoints(absolutePoints);
    } else if (maskPoints.length === 0) {
      setAbsoluteMaskPoints([]);
    }
  }, [maskPoints]);

  // Создаем отдельный видео элемент для захвата кадра
  useEffect(() => {
    if (isCreating && videoUrl) {
      setCaptureError(null);
      setFrameCaptured(false);
      setCurrentFrameImage(null);

      const video = document.createElement("video");
      video.crossOrigin = "anonymous";
      video.src = videoUrl;

      const timeToCapture = currentVideoTime >= 0 ? currentVideoTime : 0;
      const isFirstFrame = timeToCapture === 0;

      video.currentTime = timeToCapture;
      setActualCaptureTime(timeToCapture);

      console.log(
        "Capture settings for " + (isCreatingMask ? "mask" : "zone") + ":",
        {
          currentVideoTime,
          timeToCapture,
          isFirstFrame,
        },
      );

      const handleCanPlay = () => {
        console.log(
          "Capture video can play, capturing frame at:",
          video.currentTime,
        );
        captureVideoRef.current = video;

        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
        captureFrame();
      };

      const handleLoadedData = () => {
        console.log("Video loaded data event");
        if (video.readyState >= 2 && !frameCaptured) {
          if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
          }
          captureFrame();
        }
      };

      const handleError = (e) => {
        console.error("Error loading capture video:", e);
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
        setCaptureError("Ошибка загрузки видео для захвата кадра");
        loadThumbnailAsFallback();
      };

      video.addEventListener("loadeddata", handleLoadedData);
      video.addEventListener("canplay", handleCanPlay);
      video.addEventListener("seeked", handleCanPlay);
      video.addEventListener("error", handleError);

      video.load();

      timeoutRef.current = setTimeout(() => {
        if (!frameCaptured) {
          console.log("Capture timeout, using fallback");
          setCaptureError("Таймаут загрузки кадра");
          loadThumbnailAsFallback();
        }
      }, 5000);

      return () => {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
        video.removeEventListener("loadeddata", handleLoadedData);
        video.removeEventListener("canplay", handleCanPlay);
        video.removeEventListener("seeked", handleCanPlay);
        video.removeEventListener("error", handleError);
        if (captureVideoRef.current) {
          captureVideoRef.current = null;
        }
      };
    } else {
      setFrameCaptured(false);
      setActualCaptureTime(0);
      setCaptureError(null);
      setCurrentFrameImage(null);
    }
  }, [isCreating, videoUrl, currentVideoTime, isCreatingMask]);

  // Использование миниатюры как fallback
  const loadThumbnailAsFallback = () => {
    const canvas = canvasRef.current;
    if (!canvas) {
      showGrayBackground();
      return;
    }

    if (!videoThumbnail) {
      showGrayBackground();
      return;
    }

    const ctx = canvas.getContext("2d");
    const img = new Image();

    img.onload = () => {
      try {
        const width = img.width || 1072;
        const height = img.height || 603;
        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);
        setFrameCaptured(true);
        setCaptureError(null);

        const imageData = ctx.getImageData(0, 0, width, height);
        setCurrentFrameImage(imageData);

        // Рисуем существующие точки создаваемой зоны/маски
        if (currentPoints.length > 0) {
          drawCreatingShape(ctx);
        }
      } catch (error) {
        console.error("Error drawing thumbnail:", error);
        showGrayBackground();
      }
    };

    img.onerror = () => {
      console.error("Error loading thumbnail");
      showGrayBackground();
    };

    img.src = videoThumbnail;
  };

  const showGrayBackground = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    canvas.width = 1072;
    canvas.height = 603;
    ctx.fillStyle = "#f0f0f0";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    setFrameCaptured(true);

    if (currentPoints.length > 0) {
      drawCreatingShape(ctx);
    }
  };

  // Захват кадра
  const captureFrame = () => {
    const video = captureVideoRef.current;
    const canvas = canvasRef.current;

    if (!video || !canvas) {
      console.log("Video or canvas not ready");
      loadThumbnailAsFallback();
      return;
    }

    if (video.readyState < 2) {
      console.log("Video not ready, waiting...");
      setTimeout(captureFrame, 100);
      return;
    }

    if (!video.videoWidth || !video.videoHeight) {
      console.log("Video has no dimensions, using fallback");
      loadThumbnailAsFallback();
      return;
    }

    const ctx = canvas.getContext("2d");

    try {
      const width = video.videoWidth;
      const height = video.videoHeight;
      canvas.width = width;
      canvas.height = height;

      ctx.clearRect(0, 0, width, height);
      ctx.drawImage(video, 0, 0, width, height);

      console.log("Frame captured successfully at time:", video.currentTime);
      setFrameCaptured(true);
      setActualCaptureTime(video.currentTime);
      setCaptureError(null);

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }

      const imageData = ctx.getImageData(0, 0, width, height);
      setCurrentFrameImage(imageData);

      if (currentPoints.length > 0) {
        drawCreatingShape(ctx);
      }
    } catch (error) {
      console.error("Error capturing frame:", error);
      setCaptureError("Ошибка захвата кадра");
      loadThumbnailAsFallback();
    }
  };

  // Восстановление кадра из сохраненного ImageData
  const restoreFrame = () => {
    const canvas = canvasRef.current;
    if (!canvas || !currentFrameImage) return;

    const ctx = canvas.getContext("2d");
    ctx.putImageData(currentFrameImage, 0, 0);
  };

  // Обработчик клика по canvas
  const handleCanvasClick = (event) => {
    if (!isCreating || !canvasRef.current || !frameCaptured) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();

    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const x = (event.clientX - rect.left) * scaleX;
    const y = (event.clientY - rect.top) * scaleY;

    // Обновляем локальные абсолютные координаты
    const newAbsolutePoints = [...currentPoints, { x, y }];

    if (isCreatingMask) {
      setAbsoluteMaskPoints(newAbsolutePoints);
    } else {
      setAbsoluteZonePoints(newAbsolutePoints);
    }

    // Передаем относительные координаты в родительский компонент
    if (currentOnPointsChange) {
      const relativePoints = newAbsolutePoints.map((point) => ({
        x: point.x / canvas.width,
        y: point.y / canvas.height,
      }));
      currentOnPointsChange(relativePoints);
    }

    // Отрисовка точки
    const ctx = canvas.getContext("2d");
    restoreFrame();
    drawCreatingShape(ctx, newAbsolutePoints);
  };

  // Рисуем одну точку
  const drawSinglePoint = (
    ctx,
    x,
    y,
    color = currentColor,
    isCreating = false,
  ) => {
    const size = isCreating ? 12 : 6;
    const borderWidth = isCreating ? 4 : 3;
    const totalSize = size + borderWidth * 2;

    ctx.fillStyle = color;
    ctx.fillRect(x - totalSize / 2, y - totalSize / 2, totalSize, totalSize);

    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(x - size / 2, y - size / 2, size, size);
  };

  // Рисуем создаваемую форму (зону или маску)
  const drawCreatingShape = (ctx, points = currentPoints) => {
    if (points.length === 0) return;

    // Рисуем линии между точками
    if (points.length >= 2) {
      ctx.beginPath();
      ctx.moveTo(points[0].x, points[0].y);

      for (let i = 1; i < points.length; i++) {
        ctx.lineTo(points[i].x, points[i].y);
      }

      // Замыкаем полигон если есть минимум 3 точки
      if (points.length >= 3) {
        ctx.closePath();
        ctx.fillStyle = `${currentColor}30`;
        ctx.fill();
      }

      ctx.strokeStyle = currentColor;
      ctx.lineWidth = 4; // Толстые линии в режиме создания
      ctx.stroke();
    }

    // Рисуем все точки с флагом создания = true
    points.forEach((point) => {
      drawSinglePoint(ctx, point.x, point.y, currentColor, true);
    });
  };

  // Добавим эффект для перерисовки при изменении точек в режиме создания
  useEffect(() => {
    if (canvasRef.current && isCreating && frameCaptured) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      restoreFrame();
      drawCreatingShape(ctx);
    }
  }, [currentPoints, isCreating, frameCaptured, currentColor]);

  // Функция для отрисовки всех сохраненных зон и масок с учетом подсветки
  const drawExistingShapes = useCallback(
    (ctx, canvas) => {
      if (!ctx || !canvas) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Рисуем зоны
      zones.forEach((zone) => {
        if (zone.points && zone.points.length >= 3) {
          const absolutePoints = zone.points.map((point) => ({
            x: point.x * canvas.width,
            y: point.y * canvas.height,
          }));

          ctx.beginPath();
          ctx.moveTo(absolutePoints[0].x, absolutePoints[0].y);
          for (let i = 1; i < absolutePoints.length; i++) {
            ctx.lineTo(absolutePoints[i].x, absolutePoints[i].y);
          }
          ctx.closePath();

          const isHighlighted = zone.id === highlightedZoneId;
          const opacity = isHighlighted ? "70" : "30";

          ctx.fillStyle = `${zone.color}${opacity}`;
          ctx.fill();

          ctx.strokeStyle = zone.color;
          ctx.lineWidth = isHighlighted ? 4 : 3;
          ctx.stroke();

          // Точки для готовых зон - с флагом создания = false
          absolutePoints.forEach((point) => {
            drawSinglePoint(ctx, point.x, point.y, zone.color, false);
          });
        }
      });

      // Рисуем маски
      masks.forEach((mask) => {
        if (mask.points && mask.points.length >= 3) {
          const absolutePoints = mask.points.map((point) => ({
            x: point.x * canvas.width,
            y: point.y * canvas.height,
          }));

          ctx.beginPath();
          ctx.moveTo(absolutePoints[0].x, absolutePoints[0].y);
          for (let i = 1; i < absolutePoints.length; i++) {
            ctx.lineTo(absolutePoints[i].x, absolutePoints[i].y);
          }
          ctx.closePath();

          const isHighlighted = mask.id === highlightedMaskId;
          const opacity = isHighlighted ? "70" : "30";

          ctx.fillStyle = `${mask.color}${opacity}`;
          ctx.fill();

          ctx.strokeStyle = mask.color;
          ctx.lineWidth = isHighlighted ? 4 : 3;
          ctx.stroke();

          // Точки для готовых масок - с флагом создания = false
          absolutePoints.forEach((point) => {
            drawSinglePoint(ctx, point.x, point.y, mask.color, false);
          });
        }
      });
    },
    [zones, masks, highlightedZoneId, highlightedMaskId],
  );

  // перерисовка при любых изменениях
  useEffect(() => {
    if (canvasRef.current && activeTab === "zones" && !isCreating) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");

      // Устанавливаем размеры canvas
      const videoContainer = canvas.parentElement;
      const containerWidth = videoContainer?.clientWidth || 1072;
      const containerHeight = videoContainer?.clientHeight || 603;

      if (
        canvas.width !== containerWidth ||
        canvas.height !== containerHeight
      ) {
        canvas.width = containerWidth;
        canvas.height = containerHeight;
      }

      console.log("Redrawing canvas due to changes");
      drawExistingShapes(ctx, canvas);
    }
  }, [
    activeTab,
    isCreating,
    zones,
    masks,
    highlightedZoneId,
    highlightedMaskId,
    drawExistingShapes,
    frameCaptured,
  ]);

  // Эффект для обработки ресайза
  useEffect(() => {
    const handleResize = () => {
      if (canvasRef.current && activeTab === "zones" && !isCreating) {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");

        const videoContainer = canvas.parentElement;
        const containerWidth = videoContainer?.clientWidth || 1072;
        const containerHeight = videoContainer?.clientHeight || 603;

        canvas.width = containerWidth;
        canvas.height = containerHeight;

        console.log("Redrawing canvas due to resize");
        drawExistingShapes(ctx, canvas);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [activeTab, isCreating, drawExistingShapes]);

  // canvas отображается при переключении на таб зон
  useEffect(() => {
    if (activeTab === "zones" && canvasRef.current && !isCreating) {
      const timer = setTimeout(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");

        const videoContainer = canvas.parentElement;
        const containerWidth = videoContainer?.clientWidth || 1072;
        const containerHeight = videoContainer?.clientHeight || 603;

        canvas.width = containerWidth;
        canvas.height = containerHeight;

        console.log("Initial draw on tab switch");
        drawExistingShapes(ctx, canvas);
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [activeTab, isCreating, drawExistingShapes]);

  if (activeTab === "zones" && isCreating) {
    return (
      <div className={styles.videoInfoContainer}>
        <div className={styles.video}>
          <canvas
            ref={canvasRef}
            width={1072}
            height={603}
            className={styles.zoneCanvas}
            onClick={handleCanvasClick}
          />
          {!frameCaptured && (
            <div className={styles.loadingOverlay}>
              <p>Загрузка кадра...</p>
              <p>Текущее время: {actualCaptureTime.toFixed(1)}с</p>
              {captureError && (
                <p className={styles.errorText}>{captureError}</p>
              )}
            </div>
          )}
        </div>
        <div className={`${styles.zonesMasksInfo} ${styles.creating}`}>
          <h2>Зоны и Маски</h2>
          <p>Зона - это...</p>
        </div>
      </div>
    );
  }

  // Оригинальный рендер для остальных случаев
  return (
    <div className={styles.videoInfoContainer}>
      {(videoState === "add" || videoState === "edit") && (
        <div
          className={`${styles.downloadLane} ${
            uploadProgress === 100 && !errorType && !videoFileError
              ? styles.completed
              : ""
          } ${errorType || videoFileError ? styles.error : ""}`}
        >
          <div className={styles.loadStatus}>
            <uploadStatus.icon className={styles[uploadStatus.iconColor]} />
            {renderStatusText()}
          </div>
          <div className={styles.progressContainer}>
            <div
              className={`${styles.progressBar} ${
                uploadProgress === 100
                  ? styles.progressBarCompleted
                  : styles.progressBarActive
              }`}
              style={{ width: `${uploadProgress}%` }}
            ></div>
          </div>
        </div>
      )}

      <div className={styles.video}>
        {isOnlineMode ? (
          <div className={styles.cameraContainer}>
            <video ref={localVideoRef} autoPlay playsInline muted={false} />
            {cameraError && (
              <div className={styles.errorMessage}>
                <ErrorIcon className={styles.errorIcon} />
                <p>{cameraError}</p>
              </div>
            )}
            {!cameraError && mediaStream && (
              <div className={styles.recordButtonContainer}>
                <PrimaryButton text="Начать" icon={VideoIcon} />
              </div>
            )}
          </div>
        ) : (
          videoUrl &&
          errorType !== "upload" &&
          thumbnailCreatedRef.current && (
            <div className={styles.videoWithOverlay}>
              <CustomVideoPlayer
                src={videoUrl}
                poster={videoThumbnail}
                ref={videoRef}
                onTimeUpdate={onVideoTimeUpdate}
                currentTime={currentVideoTime}
                style={{
                  display: "block",
                  width: "100%",
                  height: "100%",
                }}
              />

              {activeTab === "zones" && (
                <canvas
                  ref={canvasRef}
                  className={styles.zonesOverlayCanvas}
                  style={{
                    pointerEvents: isCreating ? "auto" : "none",
                    cursor: isCreating ? "crosshair" : "default",
                  }}
                  onClick={isCreating ? handleCanvasClick : undefined}
                />
              )}
            </div>
          )
        )}
        {!isOnlineMode && (!videoUrl || errorType === "upload") && (
          <>
            {videoState === "add" && (errorType === "upload" || !videoUrl) && (
              <div className={styles.errorVideoPlaceholder}>
                <PrimaryButton
                  text="Выбрать файл"
                  icon={SelectFileIcon}
                  onClick={handleRetryUpload}
                />
                <input
                  type="file"
                  accept="video/avi,video/mp4,.avi,.mp4"
                  onChange={handleFileSelect}
                  className={styles.hiddenFileInput}
                  id="video-upload-retry"
                />
                {uploadError && (
                  <div className={styles.errorMessage}>
                    <ErrorIcon className={styles.errorIcon} />
                    <p>{uploadError}</p>
                  </div>
                )}
              </div>
            )}
            {/* {videoState === "add" && errorType === "processing" && (
              <div className={styles.errorVideoPlaceholder}>
                <PrimaryButton
                  text="Запустить обработку"
                  icon={RefreshIcon}
                  onClick={handleRetryProcessing}
                />
              </div>
            )} */}
          </>
        )}
      </div>
      {!isOnlineMode ? (
        <>
          <InputField
            label="Название видео"
            value={videoName}
            onChange={handleVideoNameChange}
            placeholder="Введите название видео"
            type="text"
            disabled={isProcessing || errorType || videoState === "view"}
          />
          <InputField
            label="Заметка о видео"
            value={videoNote}
            onChange={handleVideoNoteChange}
            placeholder="Ваша заметка о видео"
            type="textarea"
            disabled={isProcessing || errorType || videoState === "view"}
            viewMode={videoState === "view"}
          />
        </>
      ) : (
        <>
          <InputField
            label="Реплики разговорного ассистента"
            // value={videoName}
            // onChange={handleVideoNameChange}
            placeholder="Здесь будут выводиться реплики разговорного ассистента"
            type="textarea"
            disabled={true}
            viewMode={videoState === "view"}
          />
          <InputField
            label="Заметка о видео"
            value={videoNote}
            onChange={handleVideoNoteChange}
            placeholder="Ваша заметка о видео"
            type="text"
            disabled={isProcessing || errorType || videoState === "view"}
          />
        </>
      )}
    </div>
  );
};
