import React from "react";
import { useNavigate } from "react-router-dom";
import styles from "./InfoContainer.module.scss";
import VideoIcon from "@icons/video-horizontal.svg?react";
import CreateIcon from "@icons/create.svg?react";
import SampleIcon from "@icons/sample.svg?react";
import CloseIcon from "@icons/close.svg?react";
import ArrowIcon from "@icons/small_arrow.svg?react";
import PlusIcon from "@icons/plus_small.svg?react";
import ZoneIcon from "@icons/zona_color.svg?react";
import MaskIcon from "@icons/mask_color.svg?react";
import PenIcon from "@icons/pen_tool.svg?react";
import { PrimaryButton } from "@ui/buttons/PrimaryButton";
import { SecondaryButton } from "@ui/buttons/SecondaryButton";
import { CloseButton } from "@ui/buttons/CloseButton";
import { Tabs } from "@ui/shared/Tabs";
import SimpleBar from "simplebar-react";

export const InfoContainer = ({
  activeTab,
  onTabClick,
  currentVideoFile,
  originalFileName,
  uploadDate,
  isProcessing,
  videoThumbnail,
  thumbnailCreatedRef,
  errorType,
  videoState,
  connectedDashboards = [],
  onAddDashboard,
  onAddTemplate,
  onRemoveDashboard,
  isCreatingZone,
  setIsCreatingZone,
  zones = [],
  onDeleteZone,
  onDeleteMask,
  onStartCreatingMask,
  masks = [],
  onZoneHover = () => {},
  onZoneLeave = () => {},
  onMaskHover = () => {},
  onMaskLeave = () => {},
}) => {
  const navigate = useNavigate();
  const handleDashboardClick = (dashboardId, dashboardName) => {
    navigate("/dashboards", {
      state: {
        selectedDashboardId: dashboardId,
        dashboardName: dashboardName,
      },
    });
  };
  const parseServerDate = () => {
    if (!uploadDate) {
      const now = new Date();
      return {
        time: now.toLocaleTimeString("ru-RU", {
          hour: "2-digit",
          minute: "2-digit",
        }),
        date: now.toLocaleDateString("ru-RU"),
      };
    }

    try {
      const [datePart, timePart] = uploadDate.split(", ");
      return {
        time: timePart,
        date: datePart,
      };
    } catch (error) {
      console.error("Ошибка парсинга даты:", error);
      const now = new Date();
      return {
        time: now.toLocaleTimeString("ru-RU", {
          hour: "2-digit",
          minute: "2-digit",
        }),
        date: now.toLocaleDateString("ru-RU"),
      };
    }
  };

  const handleStartCreatingZone = () => {
    setIsCreatingZone(true);
  };

  // Функция для отображения подключенных дашбордов
  const renderConnectedDashboards = () => {
    if (connectedDashboards.length === 0) {
      return <p>—</p>;
    }

    return (
      <div className={styles.dashboardsList}>
        {connectedDashboards.map((dashboard) => (
          <div key={dashboard.id} className={styles.dashboardItem}>
            <div
              className={styles.dashboardName}
              onClick={
                dashboard.onClick ||
                (() => handleDashboardClick(dashboard.id, dashboard.title))
              }
            >
              <p>{dashboard.title}</p>
              <ArrowIcon />
            </div>
            {videoState === "edit" && (
              <CloseButton
                icon={CloseIcon}
                onClick={() => onRemoveDashboard(dashboard.id)}
              />
            )}
          </div>
        ))}
      </div>
    );
  };

  // Функция для отображения кнопок добавления
  const renderAddButtons = () => {
    if (videoState === "add") return null;
    if (videoState === "view" && connectedDashboards.length > 0) return null;
    if (videoState === "edit" && connectedDashboards.length >= 5) return null;

    return (
      <div className={styles.dashboardButtons}>
        <PrimaryButton
          text="Создать дашборд"
          icon={CreateIcon}
          onClick={onAddDashboard}
          disabled={connectedDashboards.length >= 5}
        />
        <SecondaryButton
          text="Использовать шаблон"
          icon={SampleIcon}
          // onClick={onAddTemplate}
          disabled={connectedDashboards.length >= 5}
        />
      </div>
    );
  };

  // Функция для отображения списка зон
  const renderZonesList = () => {
    if (zones.length === 0) {
      return <p>Вы еще не создали ни одной зоны.</p>;
    }

    return (
      <div className={styles.zonesItems}>
        {zones.map((zone) => (
          <div
            key={zone.id}
            className={styles.zoneItem}
            onMouseEnter={() => onZoneHover(zone.id)}
            onMouseLeave={() => onZoneLeave()}
          >
            <div className={styles.zoneName}>
              <div
                className={styles.zoneIcon}
                style={{ "--zone-color": zone.color }}
              >
                <ZoneIcon />
              </div>
              <p>{zone.name}</p>
            </div>
            {(videoState === "edit" || videoState === "add") && (
              <div className={styles.zoneButtons}>
                {/* <CloseButton icon={PenIcon} /> */}
                <CloseButton
                  icon={CloseIcon}
                  onClick={() => onDeleteZone(zone.id)}
                />
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  // Функция для отображения списка масок
  const renderMasksList = () => {
    if (masks.length === 0) {
      return <p>Вы еще не создали ни одной маски.</p>;
    }

    return (
      <div className={styles.zonesItems}>
        {masks.map((mask) => (
          <div
            key={mask.id}
            className={styles.zoneItem}
            onMouseEnter={() => onMaskHover(mask.id)}
            onMouseLeave={() => onMaskLeave()}
          >
            <div className={styles.zoneName}>
              <div
                className={styles.zoneIcon}
                style={{ "--zone-color": mask.color }}
              >
                <MaskIcon />
              </div>
              <p>{mask.name}</p>
            </div>
            {(videoState === "edit" || videoState === "add") && (
              <div className={styles.zoneButtons}>
                {/* <CloseButton icon={PenIcon} /> */}
                <CloseButton
                  icon={CloseIcon}
                  onClick={() => onDeleteMask(mask.id)}
                />
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "general":
        return (
          <>
            <div className={styles.fileInfo}>
              <div className={styles.fileName}>
                <h2>Название файла</h2>
                <p>
                  {originalFileName ||
                    currentVideoFile?.name ||
                    "Файл не выбран"}
                </p>
              </div>
              <div className={styles.videoFrame}>
                {isProcessing || !thumbnailCreatedRef.current ? (
                  <VideoIcon />
                ) : videoThumbnail ? (
                  <img src={videoThumbnail} alt="Кадр из видео" />
                ) : (
                  <VideoIcon />
                )}
              </div>
              <div className={styles.uploadingInfo}>
                <div className={styles.loadingTime}>
                  <h2>Время загрузки</h2>
                  <p>{parseServerDate().time}</p>
                </div>
                <div className={`${styles.loadingTime} ${styles.date}`}>
                  <h2>Дата загрузки</h2>
                  <p>{parseServerDate().date}</p>
                </div>
              </div>
            </div>
            <div className={styles.connectedDashboards}>
              <h2>Подключенные дашборды</h2>
              {renderConnectedDashboards()}
              {renderAddButtons()}
            </div>
          </>
        );
      case "zones":
        if (isCreatingZone) {
          return null;
        }

        return (
          <div className={styles.zonesMasks}>
            <div className={styles.zones}>
              <div className={styles.zonesHeader}>
                <h2>Зоны</h2>
                {(videoState === "edit" || videoState === "add") && (
                  <CloseButton
                    icon={PlusIcon}
                    onClick={handleStartCreatingZone}
                  />
                )}
              </div>
              <SimpleBar
                className={styles.simplebarContainer}
                style={{
                  width: "100%",
                  height: "100%",
                }}
                autoHide={false}
                forceVisible="y"
              >
                <div className={styles.zonesList}>{renderZonesList()}</div>
              </SimpleBar>
            </div>
            <div className={styles.zones}>
              <div className={styles.zonesHeader}>
                <h2>Маски</h2>
                {(videoState === "edit" || videoState === "add") && (
                  <CloseButton icon={PlusIcon} onClick={onStartCreatingMask} />
                )}
              </div>
              <SimpleBar
                className={styles.simplebarContainer}
                autoHide={false}
                forceVisible="y"
              >
                <div className={styles.zonesList}>{renderMasksList()}</div>
              </SimpleBar>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className={styles.infoContainer}>
      {!isCreatingZone && (
        <Tabs
          tabs={[
            {
              id: "general",
              label: "Общая информация",
            },
            {
              id: "zones",
              label: "Зоны и Маски",
              disabled: isProcessing || errorType,
            },
          ]}
          activeTab={activeTab}
          onTabClick={onTabClick}
          minWidth={"408px"}
          tabWidth={"188px"}
        />
      )}
      {renderTabContent()}
    </div>
  );
};
