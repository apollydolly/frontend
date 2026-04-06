import React from "react";
import { useMemo, useState, useRef, useEffect } from "react";
import styles from "./HeatmapWidget.module.scss";
import HeatmapIcon from "@icons/map.svg";
import roomScheme from "@img/room.png";
import peopleCountData from "../../../../../assets/json/result.json";
import { useRasterImage } from "./useRasterImage";
import DeskqlMap from "./DeskqlMap";
import TimeControls from "./TimeControls";

export const HeatmapWidget = ({ data = {}, widgetId, widgetType }) => {
  const {
    name = "Тепловая карта",
    description = "Нахождение посетителей в зонах",
  } = data;

  const { image, size } = useRasterImage(roomScheme);
  const [currentTimeIndex, setCurrentTimeIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [range, setRange] = useState({ start: 0, end: 9 });
  const [activeFloor, setActiveFloor] = useState(1);

  const TIME_SLICES_COUNT = 10;
  const intervalRef = useRef(null);

  // Проверяем наличие данных
  const hasData = useMemo(() => {
    return peopleCountData && peopleCountData.length > 0;
  }, []);

  // Данные для этажей
  const floors = useMemo(
    () => [
      { id: 1, name: "Этаж 1", image: roomScheme, data: peopleCountData },
      { id: 2, name: "Этаж 2", image: roomScheme, data: peopleCountData },
      { id: 3, name: "Этаж 3", image: roomScheme, data: peopleCountData },
      { id: 4, name: "Этаж 4", image: roomScheme, data: peopleCountData },
      { id: 5, name: "Этаж 5", image: roomScheme, data: peopleCountData },
    ],
    [],
  );

  const timeSlices = useMemo(() => {
    if (!hasData) return [];

    const currentFloorData =
      floors.find((f) => f.id === activeFloor)?.data || peopleCountData;
    const sliceSize = Math.ceil(currentFloorData.length / TIME_SLICES_COUNT);
    return Array.from({ length: TIME_SLICES_COUNT }, (_, i) =>
      currentFloorData.slice(i * sliceSize, (i + 1) * sliceSize),
    );
  }, [activeFloor, floors, hasData]);

  useEffect(() => {
    setRange({ start: 0, end: TIME_SLICES_COUNT - 1 });
  }, [TIME_SLICES_COUNT]);

  const togglePlay = () => {
    if (!hasData) return;

    if (isPlaying) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
      setIsPlaying(false);
    } else {
      intervalRef.current = setInterval(() => {
        setCurrentTimeIndex((prev) => {
          const next = prev + 1;
          return next > range.end ? range.start : next;
        });
      }, 300);
      setIsPlaying(true);
    }
  };

  const handleRangeChange = (newRange) => {
    if (!hasData) return;

    setRange(newRange);
    if (currentTimeIndex < newRange.start) {
      setCurrentTimeIndex(newRange.start);
    } else if (currentTimeIndex > newRange.end) {
      setCurrentTimeIndex(newRange.end);
    }
  };

  const handleFloorChange = (floorId) => {
    setActiveFloor(floorId);
  };

  const handleTimeChange = (index) => {
    if (!hasData) return;

    const boundedIndex = Math.max(range.start, Math.min(range.end, index));
    setCurrentTimeIndex(boundedIndex);
  };

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  if (!image || !size.width) return null;

  return (
    <div className={styles.widgetContent}>
      <div className={styles.widgetHeader}>
        <img src={HeatmapIcon} alt="Heatmap" />
        <div className={styles.headerText}>
          <h2>{name}</h2>
          <p>{description}</p>
        </div>
      </div>
      <div className={styles.widgetBody}>
        <div className={styles.tabs}>
          {floors.map((floor) => (
            <div
              key={floor.id}
              className={`${styles.floorTab} ${activeFloor === floor.id ? styles.active : ""}`}
              onClick={() => handleFloorChange(floor.id)}
            >
              <h3>{floor.name}</h3>
            </div>
          ))}
        </div>
        <div className={styles.heatmap} style={{ pointerEvents: "none" }}>
          <DeskqlMap
            image={image}
            imageSize={size}
            heatmapData={hasData ? timeSlices[currentTimeIndex] : []}
            viewState={{
              target: [size.width / 2, size.height / 2, 0],
              zoom: 0,
              minZoom: 0,
              maxZoom: 2,
            }}
          />
        </div>
        <TimeControls
          current={currentTimeIndex}
          total={TIME_SLICES_COUNT}
          isPlaying={isPlaying}
          rangeStart={range.start}
          rangeEnd={range.end}
          onChange={handleTimeChange}
          onRangeChange={handleRangeChange}
          onPlay={togglePlay}
          hasData={hasData}
        />
      </div>
    </div>
  );
};
