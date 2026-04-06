import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  forwardRef,
  useImperativeHandle,
} from "react";
import styles from "./CustomVideoPlayer.module.scss";
import PlayIcon from "@icons/play.svg?react";
import PauseIcon from "@icons/pause.svg?react";
import ForwardIcon from "@icons/forward.svg?react";
import BackwardIcon from "@icons/backward.svg?react";
import ForwardActiveIcon from "@icons/forward_active.svg?react";
import BackwardActiveIcon from "@icons/backward_active.svg?react";
import CheckIcon from "@icons/check.svg?react";

export const CustomVideoPlayer = forwardRef(
  ({ src, poster, className = "", onTimeUpdate, currentTime }, ref) => {
    const videoRef = useRef(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [internalCurrentTime, setInternalCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [playbackRate, setPlaybackRate] = useState(1);
    const [showSpeedMenu, setShowSpeedMenu] = useState(false);
    const [isControlsVisible, setIsControlsVisible] = useState(true);
    const [isForwardActive, setIsForwardActive] = useState(false);
    const [isBackwardActive, setIsBackwardActive] = useState(false);
    const controlsTimeoutRef = useRef(null);
    const forwardTimeoutRef = useRef(null);
    const backwardTimeoutRef = useRef(null);

    const playbackRates = [8, 4, 2, 1, 0.75, 0.5];

    // Экспортируем методы для управления извне
    useImperativeHandle(ref, () => ({
      play: () => {
        if (videoRef.current) {
          videoRef.current.play();
          setIsPlaying(true);
        }
      },
      pause: () => {
        if (videoRef.current) {
          videoRef.current.pause();
          setIsPlaying(false);
        }
      },
      setCurrentTime: (time) => {
        if (videoRef.current) {
          videoRef.current.currentTime = time;
          setInternalCurrentTime(time);
        }
      },
      getCurrentTime: () => {
        return videoRef.current ? videoRef.current.currentTime : 0;
      },
      getVideoElement: () => videoRef.current,
    }));

    // Форматирование времени в мм:сс
    const formatTime = (time) => {
      const hours = Math.floor(time / 3600);
      const minutes = Math.floor((time % 3600) / 60);
      const seconds = Math.floor(time % 60);

      if (hours > 0) {
        return `${hours.toString().padStart(2, "0")}:${minutes
          .toString()
          .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
      } else {
        return `${minutes.toString().padStart(2, "0")}:${seconds
          .toString()
          .padStart(2, "0")}`;
      }
    };

    // Обновление текущего времени
    const updateTime = useCallback(() => {
      if (videoRef.current) {
        const time = videoRef.current.currentTime;
        setInternalCurrentTime(time);
        if (onTimeUpdate) {
          onTimeUpdate(time);
        }
      }
    }, [onTimeUpdate]);

    // Загрузка метаданных
    const handleLoadedMetadata = useCallback(() => {
      if (videoRef.current) {
        setDuration(videoRef.current.duration);
        // Восстанавливаем время если оно передано извне
        if (currentTime !== undefined) {
          videoRef.current.currentTime = currentTime;
          setInternalCurrentTime(currentTime);
        }
      }
    }, [currentTime]);

    // Синхронизация времени извне
    useEffect(() => {
      if (
        videoRef.current &&
        currentTime !== undefined &&
        currentTime !== internalCurrentTime
      ) {
        videoRef.current.currentTime = currentTime;
        setInternalCurrentTime(currentTime);
      }
    }, [currentTime, internalCurrentTime]);

    // Перемотка вперед на 10 секунд
    // Перемотка вперед на 10 секунд
    const seekForward = useCallback(() => {
      if (videoRef.current) {
        videoRef.current.currentTime += 10;
        setIsForwardActive(true);

        if (forwardTimeoutRef.current) {
          clearTimeout(forwardTimeoutRef.current);
        }
        forwardTimeoutRef.current = setTimeout(() => {
          setIsForwardActive(false);
        }, 200);
      }
    }, []);

    // Перемотка назад на 10 секунд с анимацией
    const seekBackward = useCallback(() => {
      if (videoRef.current) {
        videoRef.current.currentTime -= 10;
        setIsBackwardActive(true);

        if (backwardTimeoutRef.current) {
          clearTimeout(backwardTimeoutRef.current);
        }
        backwardTimeoutRef.current = setTimeout(() => {
          setIsBackwardActive(false);
        }, 200);
      }
    }, []);

    // Воспроизведение/пауза
    const togglePlay = useCallback(() => {
      if (videoRef.current) {
        if (isPlaying) {
          videoRef.current.pause();
        } else {
          videoRef.current.play();
        }
        setIsPlaying(!isPlaying);
      }
    }, [isPlaying]);

    // Изменение скорости воспроизведения
    const changePlaybackRate = useCallback((rate) => {
      if (videoRef.current) {
        videoRef.current.playbackRate = rate;
        setPlaybackRate(rate);
        setShowSpeedMenu(false);
      }
    }, []);

    // Перемотка по клику на прогресс-бар
    const handleProgressClick = useCallback(
      (e) => {
        if (videoRef.current) {
          const rect = e.currentTarget.getBoundingClientRect();
          const percent = (e.clientX - rect.left) / rect.width;
          const newTime = percent * duration;
          videoRef.current.currentTime = newTime;
          setInternalCurrentTime(newTime);
          if (onTimeUpdate) {
            onTimeUpdate(newTime);
          }
        }
      },
      [duration, onTimeUpdate]
    );

    // Скрытие контролов через 3 секунды
    const hideControls = useCallback(() => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
      controlsTimeoutRef.current = setTimeout(() => {
        setIsControlsVisible(false);
      }, 3000);
    }, []);

    // Показ контролов при взаимодействии
    const showControls = useCallback(() => {
      setIsControlsVisible(true);
      hideControls();
    }, [hideControls]);

    // Закрытие меню скорости при клике вне его
    useEffect(() => {
      const handleClickOutside = (event) => {
        if (showSpeedMenu && !event.target.closest(`.${styles.speedControl}`)) {
          setShowSpeedMenu(false);
        }
      };

      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }, [showSpeedMenu]);

    useEffect(() => {
      const video = videoRef.current;
      if (video) {
        video.addEventListener("timeupdate", updateTime);
        video.addEventListener("loadedmetadata", handleLoadedMetadata);
        video.addEventListener("play", () => setIsPlaying(true));
        video.addEventListener("pause", () => setIsPlaying(false));
        video.addEventListener("ended", () => setIsPlaying(false));

        // Автоскрытие контролов
        hideControls();

        return () => {
          video.removeEventListener("timeupdate", updateTime);
          video.removeEventListener("loadedmetadata", handleLoadedMetadata);
          video.removeEventListener("play", () => setIsPlaying(true));
          video.removeEventListener("pause", () => setIsPlaying(false));
          video.removeEventListener("ended", () => setIsPlaying(false));

          if (controlsTimeoutRef.current) {
            clearTimeout(controlsTimeoutRef.current);
          }
          if (forwardTimeoutRef.current) {
            clearTimeout(forwardTimeoutRef.current);
          }
          if (backwardTimeoutRef.current) {
            clearTimeout(backwardTimeoutRef.current);
          }
        };
      }
    }, [updateTime, handleLoadedMetadata, hideControls]);

    return (
      <div
        className={`${styles.videoPlayer} ${className}`}
        onMouseMove={showControls}
        onMouseLeave={() => setIsControlsVisible(false)}
      >
        <video
          ref={videoRef}
          src={src}
          poster={poster}
          className={styles.video}
          onClick={togglePlay}
        />
        <div
          className={`${styles.controls} ${
            isControlsVisible ? styles.visible : ""
          }`}
        >
          <div
            className={styles.progressContainer}
            onClick={handleProgressClick}
          >
            <div
              className={styles.progressBar}
              style={{
                width: duration
                  ? `${(internalCurrentTime / duration) * 100}%`
                  : "0%",
              }}
            ></div>
          </div>
          <div className={styles.controlsBottom}>
            <div className={styles.controlsLeft}>
              <button
                className={styles.controlButton}
                onClick={seekBackward}
                title="На 10 секунд назад"
              >
                {isBackwardActive ? <BackwardActiveIcon /> : <BackwardIcon />}
              </button>
              <button
                className={`${styles.controlButton} ${styles.pause}`}
                onClick={togglePlay}
                title={isPlaying ? "Пауза" : "Воспроизведение"}
              >
                {isPlaying ? <PauseIcon /> : <PlayIcon />}
              </button>
              <button
                className={styles.controlButton}
                onClick={seekForward}
                title="На 10 секунд вперед"
              >
                {isForwardActive ? <ForwardActiveIcon /> : <ForwardIcon />}
              </button>
            </div>
            <div className={styles.controlsRight}>
              <div className={styles.speedControl}>
                <button
                  className={styles.speedButton}
                  onClick={() => setShowSpeedMenu(!showSpeedMenu)}
                  title="Скорость воспроизведения"
                >
                  {playbackRate}x
                </button>

                {showSpeedMenu && (
                  <div className={styles.speedMenu}>
                    {playbackRates.map((rate) => (
                      <button
                        key={rate}
                        className={`${styles.speedOption} ${
                          playbackRate === rate ? styles.active : ""
                        }`}
                        onClick={() => changePlaybackRate(rate)}
                      >
                        {playbackRate === rate && (
                          <CheckIcon className={styles.checkIcon} />
                        )}
                        <p>{rate}x</p>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div className={styles.timeDisplay}>
                <p className={styles.current}>
                  {formatTime(internalCurrentTime)} /
                </p>
                <p className={styles.duration}>{formatTime(duration)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
);
