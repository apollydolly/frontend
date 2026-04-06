import { ChartWidget } from "@dashboard/widgets/ChartWidget";
import { MetricWidget } from "@dashboard/widgets/MetricWidget";
import { PhotoWidget } from "@dashboard/widgets/PhotoWidget";
import { TableWidget } from "@dashboard/widgets/TableWidget";
import { TextWidget } from "@dashboard/widgets/TextWidget";
import { VideoWidget } from "@dashboard/widgets/VideoWidget";
import { CheckoutWidget } from "@dashboard/widgets/CheckoutWidget";
import { QueueCheckoutWidget } from "@dashboard/widgets/QueueCheckoutWidget";
import { GenderDistWidget } from "@dashboard/widgets/GenderDistWidget";
import { AgeDistWidget } from "@dashboard/widgets/AgeDistWidget";
import { DangerWidget } from "@dashboard/widgets/DangerWidget";
import { ViolationsWidget } from "@dashboard/widgets/ViolationsWidget";
import { ThreatsWidget } from "@dashboard/widgets/ThreatsWidget";
import { LogisticsWidget } from "@dashboard/widgets/LogisticsWidget";
import { CheckpointWidget } from "@dashboard/widgets/CheckpointWidget";
import { CheckpointLargeWidget } from "@dashboard/widgets/CheckpointLargeWidget";
import { DangersLargeWidget } from "@dashboard/widgets/DangersLargeWidget";
import { AnalysisUserWidget } from "@dashboard/widgets/AnalysisUserWidget";
import { AnomalyDetectionWidget } from "@dashboard/widgets/AnomalyDetectionWidget";
import { UniqueVisitorsWidget } from "@dashboard/widgets/UniqueVisitorsWidget";
import { RepeatVisitorsWidget } from "@dashboard/widgets/RepeatVisitorsWidget";
import { TotalVisitorsWidget } from "@dashboard/widgets/TotalVisitorsWidget";
import { AverageTimeWidget } from "@dashboard/widgets/AverageTimeWidget";
import { AnomaliesWidget } from "@dashboard/widgets/AnomaliesWidget";
import { CamerasWidget } from "@dashboard/widgets/CamerasWidget";
import { NotificationsWidget } from "@dashboard/widgets/NotificationsWidget";
import { HeatmapWidget } from "@dashboard/widgets/HeatmapWidget";
import { MonitoringStaffActivityWidget } from "@dashboard/widgets/MonitoringStaffActivityWidget";
import { MonitoringStaffActivityPeriodWidget } from "@dashboard/widgets/MonitoringStaffActivityPeriodWidget";

export const WIDGET_CONFIG = {
  checkout: {
    name: "Касса",
    component: CheckoutWidget,
    defaultSize: { w: 2, h: 1 },
    availableSizes: [
      { w: 2, h: 1 }, // default
      { w: 2, h: 1 }, // min
      { w: 2, h: 1 }, // max
    ],
    constraints: {
      minW: 2,
      minH: 1,
      maxW: 2,
      maxH: 1,
    },
  },
  queueCheckout: {
    name: "Очередь",
    component: QueueCheckoutWidget,
    defaultSize: { w: 2, h: 1 },
    availableSizes: [
      { w: 2, h: 1 }, // default
      { w: 2, h: 1 }, // min
      { w: 2, h: 1 }, // max
    ],
    constraints: {
      minW: 2,
      minH: 1,
      maxW: 2,
      maxH: 1,
    },
  },
  genderDist: {
    name: "Распределение по полу",
    component: GenderDistWidget,
    defaultSize: { w: 2, h: 2 },
    availableSizes: [
      { w: 2, h: 2 }, // default
      { w: 2, h: 2 }, // min
      { w: 2, h: 2 }, // max
    ],
    constraints: {
      minW: 2,
      minH: 2,
      maxW: 2,
      maxH: 2,
    },
  },
  ageDist: {
    name: "Распределение по возрасту",
    component: AgeDistWidget,
    defaultSize: { w: 2, h: 3 },
    availableSizes: [
      { w: 2, h: 3 }, // default
      { w: 2, h: 3 }, // min
      { w: 2, h: 3 }, // max
    ],
    constraints: {
      minW: 2,
      minH: 3,
      maxW: 2,
      maxH: 3,
    },
  },
  danger: {
    name: "Опасности",
    component: DangerWidget,
    defaultSize: { w: 2, h: 1 },
    availableSizes: [
      { w: 2, h: 1 }, // default
      { w: 2, h: 1 }, // min
      { w: 2, h: 1 }, // max
    ],
    constraints: {
      minW: 2,
      minH: 1,
      maxW: 2,
      maxH: 1,
    },
  },
  violations: {
    name: "Нарушения",
    component: ViolationsWidget,
    defaultSize: { w: 2, h: 1 },
    availableSizes: [
      { w: 2, h: 1 }, // default
      { w: 2, h: 1 }, // min
      { w: 2, h: 1 }, // max
    ],
    constraints: {
      minW: 2,
      minH: 1,
      maxW: 2,
      maxH: 1,
    },
  },
  threats: {
    name: "Угрозы",
    component: ThreatsWidget,
    defaultSize: { w: 2, h: 1 },
    availableSizes: [
      { w: 2, h: 1 }, // default
      { w: 2, h: 1 }, // min
      { w: 2, h: 1 }, // max
    ],
    constraints: {
      minW: 2,
      minH: 1,
      maxW: 2,
      maxH: 1,
    },
  },
  logistics: {
    name: "Логистика",
    component: LogisticsWidget,
    defaultSize: { w: 3, h: 4 },
    availableSizes: [
      { w: 3, h: 4 }, // default
      { w: 3, h: 4 }, // min
      { w: 3, h: 4 }, // max
    ],
    constraints: {
      minW: 3,
      minH: 4,
      maxW: 3,
      maxH: 4,
    },
  },
  checkpoint: {
    name: "КПП",
    component: CheckpointWidget,
    defaultSize: { w: 2, h: 1 },
    availableSizes: [
      { w: 2, h: 1 }, // default
      { w: 2, h: 1 }, // min
      { w: 2, h: 1 }, // max
    ],
    constraints: {
      minW: 2,
      minH: 1,
      maxW: 2,
      maxH: 1,
    },
  },
  checkpointLarge: {
    name: "КПП большой",
    component: CheckpointLargeWidget,
    defaultSize: { w: 3, h: 4 },
    availableSizes: [
      { w: 3, h: 4 }, // default
      { w: 3, h: 4 }, // min
      { w: 3, h: 4 }, // max
    ],
    constraints: {
      minW: 3,
      minH: 4,
      maxW: 3,
      maxH: 4,
    },
  },
  dangersLarge: {
    name: "Нарушения, угрозы, опасности",
    component: DangersLargeWidget,
    defaultSize: { w: 4, h: 3 },
    availableSizes: [
      { w: 4, h: 3 }, // default
      { w: 4, h: 3 }, // min
      { w: 4, h: 3 }, // max
    ],
    constraints: {
      minW: 4,
      minH: 3,
      maxW: 4,
      maxH: 3,
    },
  },
  analysisUser: {
    name: "Анализ поведения посетителей",
    component: AnalysisUserWidget,
    defaultSize: { w: 5, h: 4 },
    availableSizes: [
      { w: 5, h: 4 }, // default
      { w: 5, h: 4 }, // min
      { w: 5, h: 4 }, // max
    ],
    constraints: {
      minW: 5,
      minH: 4,
      maxW: 5,
      maxH: 4,
    },
  },
  anomalyDetection: {
    name: "Детекция аномалий",
    component: AnomalyDetectionWidget,
    defaultSize: { w: 5, h: 4 },
    availableSizes: [
      { w: 5, h: 4 }, // default
      { w: 5, h: 4 }, // min
      { w: 5, h: 4 }, // max
    ],
    constraints: {
      minW: 5,
      minH: 4,
      maxW: 5,
      maxH: 4,
    },
  },
  uniqueVisitors: {
    name: "Уникальные посетители",
    component: UniqueVisitorsWidget,
    defaultSize: { w: 2, h: 1 },
    availableSizes: [
      { w: 2, h: 1 }, // default
      { w: 2, h: 1 }, // min
      { w: 2, h: 1 }, // max
    ],
    constraints: {
      minW: 2,
      minH: 1,
      maxW: 2,
      maxH: 1,
    },
  },
  repeatVisitors: {
    name: "Повторные посетители",
    component: RepeatVisitorsWidget,
    defaultSize: { w: 2, h: 1 },
    availableSizes: [
      { w: 2, h: 1 }, // default
      { w: 2, h: 1 }, // min
      { w: 2, h: 1 }, // max
    ],
    constraints: {
      minW: 2,
      minH: 1,
      maxW: 2,
      maxH: 1,
    },
  },
  totalVisitors: {
    name: "Всего посетителей",
    component: TotalVisitorsWidget,
    defaultSize: { w: 2, h: 1 },
    availableSizes: [
      { w: 2, h: 1 }, // default
      { w: 2, h: 1 }, // min
      { w: 2, h: 1 }, // max
    ],
    constraints: {
      minW: 2,
      minH: 1,
      maxW: 2,
      maxH: 1,
    },
  },
  averageTime: {
    name: "Среднее время",
    component: AverageTimeWidget,
    defaultSize: { w: 2, h: 1 },
    availableSizes: [
      { w: 2, h: 1 }, // default
      { w: 2, h: 1 }, // min
      { w: 2, h: 1 }, // max
    ],
    constraints: {
      minW: 2,
      minH: 1,
      maxW: 2,
      maxH: 1,
    },
  },
  anomalies: {
    name: "Аномалии",
    component: AnomaliesWidget,
    defaultSize: { w: 2, h: 1 },
    availableSizes: [
      { w: 2, h: 1 }, // default
      { w: 2, h: 1 }, // min
      { w: 2, h: 1 }, // max
    ],
    constraints: {
      minW: 2,
      minH: 1,
      maxW: 2,
      maxH: 1,
    },
  },
  cameras: {
    name: "Камеры",
    component: CamerasWidget,
    defaultSize: { w: 2, h: 1 },
    availableSizes: [
      { w: 2, h: 1 }, // default
      { w: 2, h: 1 }, // min
      { w: 2, h: 1 }, // max
    ],
    constraints: {
      minW: 2,
      minH: 1,
      maxW: 2,
      maxH: 1,
    },
  },
  notifications: {
    name: "Уведомления",
    component: NotificationsWidget,
    defaultSize: { w: 2, h: 1 },
    availableSizes: [
      { w: 2, h: 1 }, // default
      { w: 2, h: 1 }, // min
      { w: 2, h: 1 }, // max
    ],
    constraints: {
      minW: 2,
      minH: 1,
      maxW: 2,
      maxH: 1,
    },
  },
  heatmap: {
    name: "Тепловая карта",
    component: HeatmapWidget,
    defaultSize: { w: 5, h: 4 },
    availableSizes: [
      { w: 5, h: 4 }, // default
      { w: 5, h: 4 }, // min
      { w: 5, h: 4 }, // max
    ],
    constraints: {
      minW: 5,
      minH: 4,
      maxW: 5,
      maxH: 4,
    },
  },
  monitoringStaffActivity: {
    name: "Контроль активности персонала",
    component: MonitoringStaffActivityWidget,
    defaultSize: { w: 4, h: 3 },
    availableSizes: [
      { w: 4, h: 3 }, // default
      { w: 4, h: 3 }, // min
      { w: 4, h: 3 }, // max
    ],
    constraints: {
      minW: 4,
      minH: 3,
      maxW: 4,
      maxH: 3,
    },
  },
  monitoringStaffActivityPeriod: {
    name: "Контроль активности персонала с выбором периода",
    component: MonitoringStaffActivityPeriodWidget,
    defaultSize: { w: 4, h: 3 },
    availableSizes: [
      { w: 4, h: 3 }, // default
      { w: 4, h: 3 }, // min
      { w: 4, h: 3 }, // max
    ],
    constraints: {
      minW: 4,
      minH: 3,
      maxW: 4,
      maxH: 3,
    },
  },
  // chart: {
  //   name: "График",
  //   component: ChartWidget,
  //   defaultSize: { w: 4, h: 3 },
  //   availableSizes: [
  //     { w: 4, h: 3 }, // default
  //     { w: 2, h: 2 }, // min
  //     { w: 6, h: 4 }, // max
  //   ],
  //   constraints: {
  //     minW: 2,
  //     minH: 2,
  //     maxW: 6,
  //     maxH: 4,
  //   },
  // },
  // table: {
  //   name: "Таблица",
  //   component: TableWidget,
  //   defaultSize: { w: 6, h: 4 },
  //   availableSizes: [
  //     { w: 6, h: 4 }, // default
  //     { w: 4, h: 3 }, // min
  //     { w: 8, h: 6 }, // max
  //   ],
  //   constraints: {
  //     minW: 4,
  //     minH: 3,
  //     maxW: 8,
  //     maxH: 6,
  //   },
  // },
  // metric: {
  //   name: "Метрика",
  //   component: MetricWidget,
  //   defaultSize: { w: 2, h: 2 },
  //   availableSizes: [
  //     { w: 2, h: 2 }, // default
  //     { w: 1, h: 1 }, // min
  //     { w: 4, h: 2 }, // max
  //   ],
  //   constraints: {
  //     minW: 1,
  //     minH: 1,
  //     maxW: 4,
  //     maxH: 2,
  //   },
  // },
  // text: {
  //   name: "Текст",
  //   component: TextWidget,
  //   defaultSize: { w: 3, h: 2 },
  //   availableSizes: [
  //     { w: 3, h: 2 }, // default
  //     { w: 2, h: 1 }, // min
  //     { w: 6, h: 4 }, // max
  //   ],
  //   constraints: {
  //     minW: 2,
  //     minH: 1,
  //     maxW: 6,
  //     maxH: 4,
  //   },
  // },
  // photo: {
  //   name: "Фото",
  //   component: PhotoWidget,
  //   defaultSize: { w: 3, h: 3 },
  //   availableSizes: [
  //     { w: 3, h: 3 }, // default
  //     { w: 2, h: 2 }, // min
  //     { w: 6, h: 6 }, // max
  //   ],
  //   constraints: {
  //     minW: 2,
  //     minH: 2,
  //     maxW: 6,
  //     maxH: 6,
  //   },
  // },
  // video: {
  //   name: "Видео",
  //   component: VideoWidget,
  //   defaultSize: { w: 4, h: 3 },
  //   availableSizes: [
  //     { w: 4, h: 3 }, // default
  //     { w: 3, h: 2 }, // min
  //     { w: 8, h: 6 }, // max
  //   ],
  //   constraints: {
  //     minW: 3,
  //     minH: 2,
  //     maxW: 8,
  //     maxH: 6,
  //   },
  // },
};

// Вспомогательные функции
export const getWidgetConfig = (type) =>
  WIDGET_CONFIG[type] || WIDGET_CONFIG.chart;

export const getDefaultWidgetSize = (type) => {
  const config = getWidgetConfig(type);
  return config.defaultSize;
};

export const getAvailableSizes = (type) => {
  const config = getWidgetConfig(type);
  return config.availableSizes;
};

export const getNextSize = (type, currentSize) => {
  const sizes = getAvailableSizes(type);
  const currentIndex = sizes.findIndex(
    (size) => size.w === currentSize.w && size.h === currentSize.h,
  );
  return sizes[(currentIndex + 1) % sizes.length];
};

export const isValidSize = (type, size) => {
  const sizes = getAvailableSizes(type);
  return sizes.some(
    (validSize) => validSize.w === size.w && validSize.h === size.h,
  );
};

export const getWidgetConstraints = (type) => {
  const config = getWidgetConfig(type);
  return config.constraints || { minW: 1, minH: 1, maxW: 12, maxH: 12 };
};
