import { authClient } from "./api";

export const eventService = {
  // Получение изображения события
  async getEventImage(imageId) {
    try {
      if (!imageId) {
        console.warn("[getEventImage] imageId не указан");
        throw new Error("Не указан ID изображения");
      }

      console.log("[getEventImage] Запрашиваем изображение события:", {
        image_id: imageId,
      });

      const response = await authClient.post(
        "/event/get_image",
        {
          image_id: imageId,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
          timeout: 30000,
        }
      );

      console.log("[getEventImage] Ответ сервера:", {
        status: response.status,
        statusText: response.statusText,
        headers: response.headers,
        data: response.data,
      });

      const responseData = response.data;
      console.log("[getEventImage] Парсинг responseData:", responseData);

      if (!responseData.success || responseData.error) {
        console.log("[getEventImage] Ошибка в ответе:", responseData.error);
        throw new Error(
          responseData.error?.msg || "Ошибка при получении изображения"
        );
      }

      const base64Image = responseData.data?.image;

      if (!base64Image) {
        console.error(
          "[getEventImage] Изображение не найдено в ответе:",
          responseData
        );
        throw new Error("Изображение не найдено в ответе сервера");
      }

      console.log(
        "[getEventImage] Изображение получено в формате base64, длина:",
        base64Image.length
      );
      console.log(
        "[getEventImage] Первые 100 символов base64:",
        base64Image.substring(0, 100)
      );

      try {
        const isJpegBase64 = base64Image.startsWith("/9j/");
        const isPngBase64 = base64Image.startsWith("iVBORw0KGgo");

        console.log("[getEventImage] Проверка base64:", {
          isJpegBase64,
          isPngBase64,
          startsWithSlash: base64Image.startsWith("/"),
          firstChars: base64Image.substring(0, 20),
        });

        return {
          base64: base64Image,
          type: isJpegBase64
            ? "image/jpeg"
            : isPngBase64
            ? "image/png"
            : "image/jpeg",
        };
      } catch (base64Error) {
        console.error("[getEventImage] Ошибка проверки base64:", base64Error);
        // Все равно возвращаем, возможно сработает
        return {
          base64: base64Image,
          type: "image/jpeg",
        };
      }
    } catch (error) {
      console.error("[getEventImage] Ошибка запроса:", {
        error: error.message,
        response: error.response?.data,
        status: error.response?.status,
        imageId: imageId,
        stack: error.stack,
      });

      const errorMessage =
        error.response?.data?.error?.msg ||
        error.message ||
        "Ошибка при загрузке изображения";

      throw new Error(errorMessage);
    }
  },
};
