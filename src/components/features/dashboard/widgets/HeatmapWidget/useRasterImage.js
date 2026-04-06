import { useEffect, useState } from "react";

export function useRasterImage(src, fallbackSize = 1024) {
  const [image, setImage] = useState(null);
  const [size, setSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    if (!src) return;

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = src;

    img.onload = async () => {
      if (src.endsWith(".svg")) {
        const canvas = document.createElement("canvas");
        canvas.width = img.width || fallbackSize;
        canvas.height = img.height || fallbackSize;

        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        const bitmap = await createImageBitmap(canvas);
        setImage(bitmap);
        setSize({ width: canvas.width, height: canvas.height });
      } else {
        setImage(img);
        setSize({ width: img.width, height: img.height });
      }
    };

    img.onerror = (e) => {
      console.error("Image load error:", e);
    };
  }, [src, fallbackSize]);

  return { image, size };
}
