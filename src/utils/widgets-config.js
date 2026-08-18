import { SpeechLenghtWidget } from "@dashboard/widgets/SpeechLengthWidget";
import { AvgWordSpeedWidget } from "@dashboard/widgets/AvgWordSpeedWidget";
import { EnergyHeatmapWidget } from "@dashboard/widgets/EnergyHeatmapWidget";
import { TotalPausesRatioWidget } from "@dashboard/widgets/TotalPausesRatioWidget";
import { PitchRangeWidget } from "@dashboard/widgets/PitchRangeWidget";
import { WordParasitesWidget } from "@dashboard/widgets/WordParasitesWidget";
import { PsycholinguisticWidget } from "@dashboard/widgets/PsycholinguisticWidget";
import { CongruenceWidget } from "@dashboard/widgets/CongruenceWidget";
import { EmotionalHeatmapWidget } from "@dashboard/widgets/EmotionalHeatmapWidget";
import { EmotionalityWidget } from "@dashboard/widgets/EmotionalityWidget";
import { MeetingInfoWidget } from "@dashboard/widgets/MeetingInfoWidget";
import { MeetingSummaryWidget } from "@dashboard/widgets/MeetingSummaryWidget";
import { ChangingEmotionsWidget } from "@dashboard/widgets/ChangingEmotionsWidget";

export const WIDGET_CONFIG = {
  meetingInfo: {
    name: "Информация о встрече",
    component: MeetingInfoWidget,
    defaultSize: { w: 4, h: 2 },
    availableSizes: [
      { w: 4, h: 2 },
      { w: 4, h: 2 },
      { w: 4, h: 2 },
    ],
    constraints: {
      minW: 4,
      minH: 2,
      maxW: 4,
      maxH: 2,
    },
  },
  meetingSummary: {
    name: "Краткое содержание встречи",
    component: MeetingSummaryWidget,
    defaultSize: { w: 4, h: 2 },
    availableSizes: [
      { w: 4, h: 2 },
      { w: 4, h: 2 },
      { w: 4, h: 2 },
    ],
    constraints: {
      minW: 4,
      minH: 2,
      maxW: 4,
      maxH: 2,
    },
  },
  speechLenght: {
    name: "Длительность речи участников",
    component: SpeechLenghtWidget,
    defaultSize: { w: 5, h: 3 },
    availableSizes: [
      { w: 5, h: 3 }, // default
      { w: 5, h: 3 }, // min
      { w: 5, h: 3 }, // max
    ],
    constraints: {
      minW: 5,
      minH: 3,
      maxW: 5,
      maxH: 3,
    },
  },
  avgWordSpeed: {
    name: "Темп речи участников",
    component: AvgWordSpeedWidget,
    defaultSize: { w: 7, h: 5 },
    availableSizes: [
      { w: 7, h: 5 },
      { w: 7, h: 5 },
      { w: 7, h: 5 },
    ],
    constraints: {
      minW: 7,
      minH: 5,
      maxW: 7,
      maxH: 5,
    },
  },
  energyHeatmap: {
    name: "Энергичность участников",
    component: EnergyHeatmapWidget,
    defaultSize: { w: 10, h: 3 },
    availableSizes: [
      { w: 10, h: 3 },
      { w: 10, h: 3 },
      { w: 10, h: 3 },
    ],
    constraints: {
      minW: 10,
      minH: 3,
      maxW: 10,
      maxH: 3,
    },
  },
  totalPausesRatio: {
    name: "Доля пауз в речи",
    component: TotalPausesRatioWidget,
    defaultSize: { w: 5, h: 3 },
    availableSizes: [
      { w: 5, h: 3 },
      { w: 5, h: 3 },
      { w: 5, h: 3 },
    ],
    constraints: {
      minW: 5,
      minH: 3,
      maxW: 5,
      maxH: 3,
    },
  },
  pitchRange: {
    name: "Диапазон тона речи",
    component: PitchRangeWidget,
    defaultSize: { w: 5, h: 3 },
    availableSizes: [
      { w: 5, h: 3 },
      { w: 5, h: 3 },
      { w: 5, h: 3 },
    ],
    constraints: {
      minW: 5,
      minH: 3,
      maxW: 5,
      maxH: 3,
    },
  },
  wordParasites: {
    name: "Слова-паразиты",
    component: WordParasitesWidget,
    defaultSize: { w: 8, h: 5 },
    availableSizes: [
      { w: 8, h: 5 },
      { w: 8, h: 5 },
      { w: 8, h: 5 },
    ],
    constraints: {
      minW: 8,
      minH: 5,
      maxW: 8,
      maxH: 5,
    },
  },
  psycholinguistic: {
    name: "Психолингвистические маркеры",
    component: PsycholinguisticWidget,
    defaultSize: { w: 6, h: 4 },
    availableSizes: [
      { w: 6, h: 4 },
      { w: 6, h: 4 },
      { w: 6, h: 4 },
    ],
    constraints: {
      minW: 6,
      minH: 4,
      maxW: 6,
      maxH: 4,
    },
  },
  congruence: {
    name: "Конгруэнтность",
    component: CongruenceWidget,
    defaultSize: { w: 6, h: 4 },
    availableSizes: [
      { w: 6, h: 4 },
      { w: 6, h: 4 },
      { w: 6, h: 4 },
    ],
    constraints: {
      minW: 6,
      minH: 4,
      maxW: 6,
      maxH: 4,
    },
  },
  emotionalHeatmap: {
    name: "Эмоциональный климат",
    component: EmotionalHeatmapWidget,
    defaultSize: { w: 10, h: 3 },
    availableSizes: [
      { w: 10, h: 3 },
      { w: 10, h: 3 },
      { w: 10, h: 3 },
    ],
    constraints: {
      minW: 10,
      minH: 3,
      maxW: 10,
      maxH: 3,
    },
  },
  emotionality: {
    name: "Эмоциональность высказываний",
    component: EmotionalityWidget,
    defaultSize: { w: 6, h: 4 },
    availableSizes: [
      { w: 6, h: 4 },
      { w: 6, h: 4 },
      { w: 6, h: 4 },
    ],
    constraints: {
      minW: 6,
      minH: 4,
      maxW: 6,
      maxH: 4,
    },
  },
  changingEmotions: {
    name: "Изменение эмоционального состояния собеседников",
    component: ChangingEmotionsWidget,
    defaultSize: { w: 10, h: 6 },
    availableSizes: [
      { w: 10, h: 6 },
      { w: 10, h: 6 },
      { w: 10, h: 6 },
    ],
    constraints: {
      minW: 10,
      minH: 6,
      maxW: 10,
      maxH: 6,
    },
  },
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
