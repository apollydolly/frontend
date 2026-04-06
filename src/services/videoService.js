import { authClient } from "./api";

export const videoService = {
  // Загрузка видео файла на сервер
  async uploadVideo(file, duration, onProgress = null, signal = null) {
    const formData = new FormData();
    formData.append("file", file);

    // Проверяем длительность видео
    let finalDuration = Math.round(duration);

    // Если длительность меньше 60 секунд, устанавливаем в 1 минуту
    if (finalDuration < 60) {
      console.warn(
        `Длительность видео (${finalDuration} сек) меньше 60 секунд. Устанавливаем длительность в 60 секунд.`
      );
      finalDuration = 60;
    }

    const config = {
      params: {
        duration: finalDuration,
      },
      headers: {
        "Content-Type": "multipart/form-data",
      },
      timeout: 300000,
    };

    // signal для отмены если передан
    if (signal) {
      config.signal = signal;
    }

    if (onProgress) {
      config.onUploadProgress = (progressEvent) => {
        if (progressEvent.total) {
          const progress = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          onProgress(progress);
        }
      };
    }

    const response = await authClient.post(
      "/video/upload_video",
      formData,
      config
    );
    console.log("upload_video ", response.data);

    // ОБРАБОТКА ОШИБОК
    const responseData = response.data;
    if (!responseData.success || responseData.error) {
      console.log("[uploadVideo] Ошибка в ответе:", responseData.error);
      throw new Error(responseData.error?.msg || "Ошибка при загрузке видео");
    }

    return responseData.data;
  },

  // Получение видео с сервера
  async getVideo(videoId) {
    try {
      console.log("[getVideo] Отправляем запрос с параметрами:", {
        video_id: videoId,
      });

      const response = await authClient.post(
        "/video/get_video",
        {
          video_id: videoId,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
          timeout: 30000,
        }
      );

      console.log("[getVideo] Ответ сервера:", {
        status: response.status,
        data: response.data,
      });

      const responseData = response.data;

      // ОБРАБОТКА ОШИБОК
      if (!responseData.success || responseData.error) {
        console.log("[getVideo] Ошибка в ответе:", responseData.error);
        throw new Error(
          responseData.error?.msg || "Ошибка при получении видео"
        );
      }

      return responseData.data;
    } catch (error) {
      console.error("[getVideo] Ошибка запроса:", {
        error: error.message,
        response: error.response?.data,
        status: error.response?.status,
        videoId: videoId,
      });
      throw error;
    }
  },

  // Получение списка видео
  async getVideoList(limit = 3, offset = 0) {
    const response = await authClient.post(
      "/video/get_video_list",
      {
        limit,
        offset,
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
        timeout: 30000,
      }
    );
    console.log("get_video_list: ", response.data);

    // ОБРАБОТКА ОШИБОК
    const responseData = response.data;
    if (!responseData.success || responseData.error) {
      console.log("[getVideoList] Ошибка в ответе:", responseData.error);
      throw new Error(
        responseData.error?.msg || "Ошибка при получении списка видео"
      );
    }

    return responseData.data;
  },

  // Удаление видео
  async deleteVideo(videoId) {
    const response = await authClient.delete("/video/delete_video", {
      data: {
        video_id: videoId,
      },
      headers: {
        "Content-Type": "application/json",
      },
      timeout: 30000,
    });

    // ОБРАБОТКА ОШИБОК
    const responseData = response.data;
    if (!responseData.success || responseData.error) {
      console.log("[deleteVideo] Ошибка в ответе:", responseData.error);
      throw new Error(responseData.error?.msg || "Ошибка при удалении видео");
    }

    return responseData.data;
  },

  // Сохранение данных видео
  async setVideoData(videoData) {
    console.log(
      "Полученные данные в setVideoData:",
      JSON.stringify(videoData, null, 2)
    );

    // Функция для преобразования относительных координат (0-1) в проценты (0-100)
    const convertToPercentages = (coordinates) => {
      if (!coordinates || !Array.isArray(coordinates)) return [];

      return coordinates.map((point) => {
        console.log("Преобразование точки:", point);

        let x, y;

        if (Array.isArray(point) && point.length >= 2) {
          x = Number(point[0]);
          y = Number(point[1]);

          console.log(`Исходная точка: [${x}, ${y}]`);

          // Проверяем диапазон
          if (x >= 0 && x <= 1 && y >= 0 && y <= 1) {
            // Преобразуем в проценты 0-100
            const xPercent = Math.round(x * 100);
            const yPercent = Math.round(y * 100);
            console.log(
              `Преобразование: [${x}, ${y}] → [${xPercent}, ${yPercent}]`
            );
            return [xPercent, yPercent];
          }
          // Если уже в процентах (0-100), оставляем как есть
          else if (x >= 0 && x <= 100 && y >= 0 && y <= 100) {
            console.log(`Уже в процентах: [${x}, ${y}]`);
            return [x, y];
          } else {
            console.warn(
              `Непонятный формат: [${x}, ${y}] - используем fallback`
            );
            return [50, 50];
          }
        }

        console.error("Неизвестный формат точки:", point);
        return [50, 50];
      });
    };

    // Преобразуем зоны - если пустой массив, отправляем null
    const zones =
      videoData.zones && videoData.zones.length > 0
        ? videoData.zones.map((zone) => {
            const coordinates = zone.coords || zone.points || [];
            const percentageCoords = convertToPercentages(coordinates);

            console.log(`Зона "${zone.name}":`, {
              исходные: coordinates,
              проценты: percentageCoords,
            });

            return {
              name: zone.name || "Без названия",
              description: zone.description || "",
              color: zone.color || "#E1760B",
              coords: percentageCoords,
            };
          })
        : null;

    // Преобразуем маски - если пустой массив, отправляем null
    const masks =
      videoData.masks && videoData.masks.length > 0
        ? videoData.masks.map((mask) => {
            const coordinates = mask.coords || mask.points || [];
            const percentageCoords = convertToPercentages(coordinates);

            console.log(`Маска "${mask.name}":`, {
              исходные: coordinates,
              проценты: percentageCoords,
            });

            return {
              name: mask.name || "Без названия",
              description: mask.description || "",
              color: mask.color || "#EB3134",
              coords: percentageCoords,
            };
          })
        : null;

    const requestData = {
      video_id: videoData.videoId,
      name: videoData.name || "Без названия",
      description: videoData.description || "",
      dashboards: videoData.dashboards || [],
      zones: zones,
      masks: masks,
    };

    console.log("Данные для сервера:", JSON.stringify(requestData, null, 2));

    const response = await authClient.post(
      "/video/set_video_data",
      requestData,
      {
        headers: {
          "Content-Type": "application/json",
        },
        timeout: 30000,
      }
    );
    console.log("set_video_data: ", response.data);

    // ОБРАБОТКА ОШИБОК
    const responseData = response.data;
    if (!responseData.success || responseData.error) {
      console.log("[setVideoData] Ошибка в ответе:", responseData.error);
      throw new Error(
        responseData.error?.msg || "Ошибка при сохранении данных видео"
      );
    }

    return responseData.data;
  },

  // Загрузка видеофайла с сервера
  async loadVideoFile(videoId, onProgress = null, signal = null) {
    try {
      console.log("[loadVideoFile] Загрузка видеофайла:", videoId);

      const config = {
        params: {
          video_id: videoId,
        },
        responseType: "blob",
        timeout: 300000,
      };

      // signal для отмены если передан
      if (signal) {
        config.signal = signal;
      }

      if (onProgress) {
        config.onDownloadProgress = (progressEvent) => {
          if (onProgress && progressEvent.total) {
            const progress = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            onProgress(progress);
          }
        };
      }

      const response = await authClient.get("/video/load_video", config);

      const videoBlob = response.data;
      const videoUrl = URL.createObjectURL(videoBlob);

      return {
        blob: videoBlob,
        url: videoUrl,
        size: videoBlob.size,
        type: videoBlob.type,
      };
    } catch (error) {
      console.error("[loadVideoFile] Ошибка загрузки видеофайла:", error);
      throw error;
    }
  },

  // Обработка видео
  async processVideo(videoId) {
    try {
      console.log("[processVideo] Запуск обработки видео:", {
        video_id: videoId,
      });

      const response = await authClient.post(
        "/video/process_video",
        {
          video_id: videoId,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
          timeout: 30000,
        }
      );

      console.log("[processVideo] Ответ сервера:", {
        status: response.status,
        data: response.data,
      });

      const responseData = response.data;

      // ОБРАБОТКА ОШИБОК
      if (!responseData.success || responseData.error) {
        console.log("[processVideo] Ошибка в ответе:", responseData.error);
        throw new Error(
          responseData.error?.msg || "Ошибка при запуске обработки видео"
        );
      }

      return responseData.data;
    } catch (error) {
      console.error("[processVideo] Ошибка запроса:", {
        error: error.message,
        response: error.response?.data,
        status: error.response?.status,
        videoId: videoId,
      });
      throw error;
    }
  },
};

export const getVideoDuration = (file) => {
  return new Promise((resolve) => {
    const video = document.createElement("video");
    video.src = URL.createObjectURL(file);

    video.onloadedmetadata = () => {
      // Если длительность меньше 60 секунд, устанавливаем в 1 минуту
      let duration = video.duration;
      if (duration < 60) {
        console.warn(
          `Длительность видео (${duration} сек) меньше 60 секунд. Устанавливаем длительность в 60 секунд.`
        );
        duration = 60;
      }
      resolve(duration);
      URL.revokeObjectURL(video.src);
    };

    video.onerror = () => {
      console.warn(
        "Не удалось получить длительность видео, используем минимальное значение 60 секунд"
      );
      resolve(60);
      URL.revokeObjectURL(video.src);
    };
  });
};
