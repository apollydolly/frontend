import React, { useState, useEffect } from "react";
import styles from "./WidgetModal.module.scss";
import CloseIcon from "@icons/close.svg?react";
import { CloseButton } from "@ui/buttons/CloseButton";
import { eventService } from "@services/eventService";

export const WidgetModal = ({ isOpen, onClose, eventData = null }) => {
  const [imageUrl, setImageUrl] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);

  // Сбрасываем состояние при закрытии
  useEffect(() => {
    if (!isOpen) {
      console.log("WidgetModal: закрытие, сброс состояния");
      setImageUrl(null);
      setError(null);
      setRetryCount(0);
    }
  }, [isOpen]);

  // Получаем изображение при открытии модального окна
  useEffect(() => {
    if (!isOpen) {
      console.log("WidgetModal: не открыт, пропускаем загрузку");
      return;
    }

    if (!eventData?.image_id) {
      console.log("WidgetModal: нет image_id, пропускаем загрузку", {
        eventData,
      });
      setImageUrl(null);
      setIsLoading(false);
      return;
    }

    console.log("WidgetModal: начинаем загрузку изображения", {
      image_id: eventData.image_id,
      retryCount,
    });

    const loadImage = async () => {
      try {
        setIsLoading(true);
        setError(null);

        console.log(
          "WidgetModal: вызов eventService.getEventImage",
          eventData.image_id
        );

        const imageData = await eventService.getEventImage(eventData.image_id);

        console.log("WidgetModal: данные изображения получены", {
          hasBase64: !!imageData.base64,
          base64Length: imageData.base64?.length,
          hasBlob: !!imageData.blob,
          hasUrl: !!imageData.url,
          imageData,
        });

        if (imageData.base64) {
          const base64String = imageData.base64;

          if (base64String.startsWith("data:image/")) {
            console.log("WidgetModal: уже есть data URL префикс");
            setImageUrl(base64String);
          } else {
            const mimeType = imageData.type || "image/jpeg";
            const dataUrl = `data:${mimeType};base64,${base64String}`;
            console.log("WidgetModal: создан data URL, длина:", dataUrl.length);
            setImageUrl(dataUrl);
          }

          console.log(
            "WidgetModal: изображение успешно загружено в формате base64"
          );
        } else if (imageData.blob) {
          const url = URL.createObjectURL(imageData.blob);
          setImageUrl(url);
          console.log(
            "WidgetModal: изображение успешно загружено в формате blob"
          );
        } else if (imageData.url) {
          // URL изображения
          setImageUrl(imageData.url);
          console.log("WidgetModal: изображение успешно загружено по URL");
        } else {
          console.error(
            "WidgetModal: неизвестный формат изображения",
            imageData
          );
          throw new Error("Неизвестный формат изображения");
        }
      } catch (err) {
        console.error("WidgetModal: ошибка загрузки изображения:", {
          error: err,
          message: err.message,
          stack: err.stack,
          image_id: eventData.image_id,
        });

        if (retryCount < 2) {
          console.log(
            `WidgetModal: повторная попытка загрузки (${retryCount + 1}/2)...`
          );
          setRetryCount((prev) => prev + 1);
        } else {
          setError(
            `Не удалось загрузить изображение: ${
              err.message || "Неизвестная ошибка"
            }`
          );
        }
      } finally {
        console.log("WidgetModal: загрузка завершена, isLoading = false");
        setIsLoading(false);
      }
    };

    loadImage();

    // Очистка URL при размонтировании
    return () => {
      if (imageUrl && imageUrl.startsWith("blob:")) {
        URL.revokeObjectURL(imageUrl);
      }
    };
  }, [isOpen, eventData?.image_id, retryCount]);

  if (!isOpen) {
    return null;
  }

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modal}>
        <div className={styles.modalHeader}>
          <div className={styles.headerText}>
            <h2>Вывод видео</h2>
            <p>На видео отображается интересующий запрос.</p>
          </div>
          <CloseButton icon={CloseIcon} onClick={onClose} />
        </div>
        <div className={styles.video}>
          {!isLoading && !error && imageUrl && (
            <img
              src={imageUrl}
              alt="Изображение события"
              className={styles.eventImage}
              onLoad={() =>
                console.log("WidgetModal: изображение успешно загружено в DOM")
              }
              onError={(e) => {
                console.error("WidgetModal: ошибка отображения изображения:", {
                  src: imageUrl?.substring(0, 100),
                  error: e,
                });
                e.target.style.display = "none";
                setError(
                  "Не удалось отобразить изображение. Возможно, повреждены данные."
                );
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
};
