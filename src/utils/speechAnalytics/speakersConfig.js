export const speakersConfig = {
  SPEAKER_00: "Guzalya Sabiryanova",
  SPEAKER_01: "Даниил Лебедев",
  SPEAKER_02: "Разговорный ассистент",
  SPEAKER_03: "Головачева Полина",
  SPEAKER_04: "Alex Krass",
  SPEAKER_05: "Дарья Гартунг",
};

export const SPEAKER_COLORS = {
  SPEAKER_00: "#FDC44C",
  SPEAKER_01: "#D429C5",
  SPEAKER_02: "#1776E0",
  SPEAKER_03: "#3CAB17",
  SPEAKER_04: "#E1760B",
  SPEAKER_05: "#5137D3",
};

export const getSpeakerFullName = (speakerId) =>
  speakersConfig[speakerId] || speakerId;
