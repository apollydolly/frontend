import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from "react";
import { useNavigate } from "react-router-dom";
import SimpleBar from "simplebar-react";
import styles from "./UploadedVideos.module.scss";
import UploadVideoIcon from "@icons/upload_video.svg?react";
import MenuIcon from "@icons/icon_small_menu.svg?react";
import EditIcon from "@icons/edit.svg?react";
import DeleteIcon from "@icons/delete.svg?react";
import { PrimaryButton } from "@ui/buttons/PrimaryButton";
import { SearchBox } from "@ui/shared/SearchBox";
import { UploadVideoModal } from "@ui/shared/UploadVideoModal";
import { videoService } from "@services/videoService";

export const UploadedVideos = ({ onVideoUploaded }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [videos, setVideos] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [openMenuId, setOpenMenuId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [offset, setOffset] = useState(0);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  const navigate = useNavigate();
  const menuRef = useRef(null);
  const simpleBarRef = useRef(null);

  // Настройки пагинации - 9 видео за раз
  const limit = 9;
  const hasVideos = videos.length > 0;

  // Фильтрация видео на клиенте
  const filteredVideos = useMemo(() => {
    if (!searchQuery.trim()) {
      return videos;
    }

    const query = searchQuery.toLowerCase();
    return videos.filter((video) => video.name?.toLowerCase().includes(query));
  }, [videos, searchQuery]);

  // Загрузка видео с сервера
  const loadVideos = useCallback(
    async (reset = false, loadMore = false) => {
      if (isLoading && !loadMore) return;
      if (isLoadingMore && loadMore) return;

      if (loadMore) {
        setIsLoadingMore(true);
      } else {
        setIsLoading(true);
      }

      try {
        const currentOffset = reset ? 0 : offset;
        console.log(
          `Загрузка видео: offset=${currentOffset}, limit=${limit}, reset=${reset}`,
        );

        const response = await videoService.getVideoList(limit, currentOffset);
        console.log("Ответ от сервера:", response);

        const newVideos = response.video_list || [];

        if (reset) {
          setVideos(newVideos);
          setOffset(limit);
          setHasMore(newVideos.length === limit);
        } else {
          setVideos((prev) => [...prev, ...newVideos]);
          setOffset((prev) => prev + limit);
          setHasMore(newVideos.length === limit);
        }

        if (!initialLoadComplete && reset) {
          setInitialLoadComplete(true);
        }
      } catch (error) {
        console.error("Ошибка при загрузке видео:", error);
      } finally {
        if (loadMore) {
          setIsLoadingMore(false);
        } else {
          setIsLoading(false);
        }
      }
    },
    [isLoading, isLoadingMore, offset, initialLoadComplete],
  );

  // Обработчик прокрутки для ленивой загрузки
  const handleScroll = useCallback(() => {
    if (!simpleBarRef.current || !hasMore || isLoadingMore) return;

    const scrollElement = simpleBarRef.current.getScrollElement();
    if (!scrollElement) return;

    const { scrollTop, scrollHeight, clientHeight } = scrollElement;
    const scrollBottom = scrollHeight - scrollTop - clientHeight;

    // Загружаем следующую порцию при приближении к концу (100px от низа)
    if (scrollBottom < 100 && hasMore && !isLoadingMore) {
      console.log("Достигнут низ, загружаем еще видео...");
      loadVideos(false, true);
    }
  }, [hasMore, isLoadingMore, loadVideos]);

  // Обработчик клика вне меню
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpenMenuId(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Загрузка начальных данных при монтировании
  useEffect(() => {
    if (!initialLoadComplete) {
      loadVideos(true);
    }
  }, [initialLoadComplete, loadVideos]);

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

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleSearchChange = (query) => {
    setSearchQuery(query);
  };

  const handleMenuToggle = (videoId, event) => {
    event.stopPropagation();
    setOpenMenuId(openMenuId === videoId ? null : videoId);
  };

  const handleEditVideo = (video, event) => {
    event.stopPropagation();
    setOpenMenuId(null);
    navigate(`/video/${video.video_id}`, {
      state: {
        videoData: {
          videoName: video.name,
          serverVideoId: video.video_id,
        },
      },
    });
  };

  const handleDeleteVideo = async (video, event) => {
    event.stopPropagation();
    setOpenMenuId(null);

    try {
      await videoService.deleteVideo(video.video_id);
      console.log("Видео удалено:", video.name);

      // Удаляем видео из локального состояния
      setVideos((prev) => prev.filter((v) => v.video_id !== video.video_id));

      // Если удалили все видео, сбрасываем offset
      if (videos.length === 1) {
        setOffset(0);
        setHasMore(true);
        setInitialLoadComplete(false);
      }
    } catch (error) {
      console.error("Ошибка удаления видео:", error);
    }
  };

  const handleVideoUploaded = () => {
    // После загрузки нового видео перезагружаем список с начала
    loadVideos(true);
  };

  const VideoMenu = ({ video, isOpen }) => {
    if (!isOpen) return null;

    return (
      <div className={styles.videoMenu} ref={menuRef}>
        <button
          className={styles.menuItem}
          onClick={(e) => handleEditVideo(video, e)}
        >
          <EditIcon className={styles.menuIcon} />
          <p>Редактировать</p>
        </button>
        <button
          className={`${styles.menuItem} ${styles.deleteItem}`}
          onClick={(e) => handleDeleteVideo(video, e)}
        >
          <DeleteIcon className={styles.menuIcon} />
          <p>Удалить</p>
        </button>
      </div>
    );
  };

  // Функция для форматирования данных видео
  const formatVideoData = (video) => {
    const safeVideo = {
      video_id: video.video_id || `unknown-${Date.now()}`,
      name: video.name || "Без названия",
      file_name: video.file_name || video.name || "Без названия",
      frame: video.frame || null,
    };

    return {
      ...safeVideo,
      id: safeVideo.video_id,
      title: safeVideo.name,
      thumbnail: safeVideo.frame
        ? `data:image/jpeg;base64,${safeVideo.frame}`
        : null,
    };
  };

  return (
    <div className={styles.mainArea}>
      <div className={styles.header}>
        <div className={styles.headerText}>
          <h2>Загруженные видео</h2>
          <h3>
            {hasVideos
              ? "Здесь хранятся все видео, загруженные вами на платформу."
              : "Вы еще не загрузили ни одного видео."}
          </h3>
        </div>
        <div className={styles.headerControls}>
          {hasVideos && (
            <div className={styles.searchContainer}>
              <SearchBox
                placeholder="Поиск видео"
                value={searchQuery}
                onChange={handleSearchChange}
                noFilter="true"
              />
            </div>
          )}
          <PrimaryButton
            text="Загрузить видео"
            icon={UploadVideoIcon}
            onClick={handleOpenModal}
            disabled={isModalOpen}
          />
        </div>
      </div>

      {hasVideos && (
        <div className={styles.videosList}>
          {filteredVideos.length > 0 ? (
            <SimpleBar
              ref={simpleBarRef}
              className={styles.simplebarContainer}
              style={{
                width: "100%",
                height: "100%",
              }}
              autoHide={false}
              forceVisible="y"
            >
              <div className={styles.videosGrid}>
                {filteredVideos.map((video) => {
                  const formattedVideo = formatVideoData(video);
                  return (
                    <div
                      key={formattedVideo.video_id}
                      className={styles.videoCard}
                    >
                      <div className={styles.videoThumbnail}>
                        {formattedVideo.thumbnail && (
                          <img
                            src={formattedVideo.thumbnail}
                            alt={formattedVideo.name}
                            onError={(e) => {
                              e.target.style.display = "none";
                            }}
                          />
                        )}
                      </div>
                      <div className={styles.videoInfo}>
                        <div className={styles.titleHeader}>
                          <h2>Загруженное видео</h2>
                          <div className={styles.menuContainer}>
                            <button
                              className={styles.menuButton}
                              onClick={(e) =>
                                handleMenuToggle(formattedVideo.video_id, e)
                              }
                            >
                              <MenuIcon />
                            </button>
                            <VideoMenu
                              video={formattedVideo}
                              isOpen={openMenuId === formattedVideo.video_id}
                            />
                          </div>
                        </div>
                        <p className={styles.videoTitle}>
                          {formattedVideo.name}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </SimpleBar>
          ) : (
            <div className={styles.noResults}>
              <p>Видео по запросу "{searchQuery}" не найдены</p>
            </div>
          )}
        </div>
      )}

      <UploadVideoModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onVideoUploaded={handleVideoUploaded}
        tab={"newVideo"}
      />
    </div>
  );
};
