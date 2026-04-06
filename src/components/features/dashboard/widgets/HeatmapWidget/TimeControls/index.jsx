import { useState, useEffect, useRef } from "react";
import styles from "./TimeControls.module.scss";
import PlayIcon from "@icons/play.svg?react";
import PauseIcon from "@icons/pause.svg?react";
import { CloseButton } from "@ui/buttons/CloseButton";
import LeftArrow from "@icons/arrow-left.svg?react";
import RightArrow from "@icons/arrow-right.svg?react";

export default function TimeControls({
  current,
  total,
  onChange,
  onPlay,
  isPlaying,
  rangeStart = 0,
  rangeEnd = total - 1,
  onRangeChange,
  hasData = true, // Новый проп для проверки наличия данных
}) {
  const [isDragging, setIsDragging] = useState(null);
  const [isRangeAdjusted, setIsRangeAdjusted] = useState(false);
  const sliderRef = useRef(null);
  const trackRef = useRef(null);

  const HANDLE_WIDTH = 18;
  const CURRENT_HANDLE_WIDTH = 10;

  // Сброс состояния при изменении rangeStart/rangeEnd извне
  useEffect(() => {
    // Если оба ползунка в крайних положениях - сбрасываем состояние
    if (rangeStart === 0 && rangeEnd === total - 1) {
      setIsRangeAdjusted(false);
    }
  }, [rangeStart, rangeEnd, total]);

  const handleMouseDown = (type) => (e) => {
    if (!hasData) return; // Блокируем если нет данных

    e.preventDefault();
    setIsDragging(type);

    // При начале перемещения любого ползунка активируем оба
    if (type === "start" || type === "end") {
      setIsRangeAdjusted(true);
    }
  };

  const handleMouseMove = (e) => {
    if (!isDragging || !sliderRef.current || !trackRef.current || !hasData)
      return;

    const trackRect = trackRef.current.getBoundingClientRect();
    const sliderRect = sliderRef.current.getBoundingClientRect();

    // Вычисляем позицию относительно трека с учетом отступов
    const trackLeft = trackRect.left;
    const trackWidth = trackRect.width;

    const x = Math.max(trackLeft, Math.min(e.clientX, trackLeft + trackWidth));
    const percentage = (x - trackLeft) / trackWidth;
    const newValue = Math.round(percentage * (total - 1));

    if (isDragging === "start") {
      const newStart = Math.min(newValue, rangeEnd - 1);
      onRangeChange?.({ start: newStart, end: rangeEnd });
    } else if (isDragging === "end") {
      const newEnd = Math.max(newValue, rangeStart + 1);
      onRangeChange?.({ start: rangeStart, end: newEnd });
    } else if (isDragging === "current") {
      const boundedValue = Math.max(rangeStart, Math.min(rangeEnd, newValue));
      onChange(boundedValue);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(null);
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
      return () => {
        window.removeEventListener("mousemove", handleMouseMove);
        window.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, [isDragging, rangeStart, rangeEnd, hasData]);

  const getLeftPosition = (value) => {
    return (value / (total - 1)) * 100;
  };

  // Вычисляем позиции с учетом ширины ползунков
  const getRangeStartPosition = () => {
    const percent = getLeftPosition(rangeStart);
    return `calc(${percent}% - ${HANDLE_WIDTH / 2}px)`;
  };

  const getRangeEndPosition = () => {
    const percent = getLeftPosition(rangeEnd);
    return `calc(${percent}% - ${HANDLE_WIDTH / 2}px)`;
  };

  const getCurrentPosition = () => {
    const percent = getLeftPosition(current);
    if (current === rangeStart) {
      return `calc(${percent}% - ${CURRENT_HANDLE_WIDTH / 2}px + ${HANDLE_WIDTH}px + 8px)`;
    } else if (current === rangeEnd) {
      return `calc(${percent}% - ${CURRENT_HANDLE_WIDTH / 2}px - ${HANDLE_WIDTH}px - 8px)`;
    } else {
      return `calc(${percent}% - ${CURRENT_HANDLE_WIDTH / 2}px)`;
    }
  };

  // Вычисляем ширину и позицию закрашенной области с учетом состояния
  const getRangeStyle = () => {
    const startPercent = getLeftPosition(rangeStart);
    const endPercent = getLeftPosition(rangeEnd);

    const baseStyle = {
      left: `calc(${startPercent}% + ${HANDLE_WIDTH}px)`,
      width: `calc(${endPercent - startPercent}% - ${HANDLE_WIDTH * 2}px)`,
    };

    if (!hasData) {
      return {
        ...baseStyle,
        background: "transparent",
        border: "none",
      };
    }

    if (isRangeAdjusted) {
      return {
        ...baseStyle,
        background: "var(--primary-blue-15, rgba(0, 102, 204, 0.15))",
        border: "1px solid var(--primary-blue, #0066CC)",
      };
    } else {
      return {
        ...baseStyle,
        background: "transparent",
      };
    }
  };

  // Вычисляем z-index для текущего ползунка в зависимости от позиции
  const getCurrentZIndex = () => {
    if (current === rangeStart || current === rangeEnd) {
      return 5; // Выше, чем у граничных ползунков
    }
    return 4;
  };

  return (
    <div className={styles.videoplayerBlock}>
      <div className={styles.sliderContainer} ref={sliderRef}>
        <div className={styles.sliderTrack} ref={trackRef} />
        {hasData && (
          <>
            <div className={styles.sliderRange} style={getRangeStyle()} />
            <div
              className={`${styles.sliderHandle} ${styles.rangeStart} ${isRangeAdjusted ? styles.adjusted : styles.default}`}
              style={{ left: getRangeStartPosition() }}
              onMouseDown={handleMouseDown("start")}
            >
              <LeftArrow />
            </div>
            <div
              className={`${styles.sliderHandle} ${styles.rangeEnd} ${isRangeAdjusted ? styles.adjusted : styles.default}`}
              style={{ left: getRangeEndPosition() }}
              onMouseDown={handleMouseDown("end")}
            >
              <RightArrow />
            </div>
            <div
              className={`${styles.sliderHandle} ${styles.current}`}
              style={{
                left: getCurrentPosition(),
                zIndex: getCurrentZIndex(),
              }}
              onMouseDown={handleMouseDown("current")}
            />
            {/* Невидимый input для кликов по треку */}
            <input
              type="range"
              min="0"
              max={total - 1}
              value={current}
              onChange={(e) => {
                if (!hasData) return;
                const value = +e.target.value;
                onChange(Math.max(rangeStart, Math.min(rangeEnd, value)));
              }}
              className={styles.sliderInput}
              disabled={!hasData}
            />
          </>
        )}
      </div>

      <div className={styles.playerContainer}>
        {hasData ? (
          <button
            onClick={onPlay}
            className={styles.buttonItem}
            disabled={!hasData}
          >
            {isPlaying ? <PauseIcon /> : <PlayIcon />}
          </button>
        ) : (
          <div className={styles.emptyText}>
            <p>Тепловая карта еще не готова.</p>
          </div>
        )}
        <div className={styles.buttonContainer}>
          <CloseButton
            icon={LeftArrow}
            onClick={() => onChange(Math.max(rangeStart, current - 1))}
            disabled={!hasData}
          />
          {hasData ? (
            <p>
              {current + 1}/{total}
            </p>
          ) : (
            <p>0/0</p>
          )}

          <CloseButton
            icon={RightArrow}
            onClick={() => onChange(Math.min(rangeEnd, current + 1))}
            disabled={!hasData}
          />
        </div>
      </div>
    </div>
  );
}
