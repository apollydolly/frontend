export const speakersConfig = {
  SPEAKER_00: "Головачева Полина0",
  SPEAKER_01: "Головачева Полина1",
  SPEAKER_02: "Разговорный ассистент",
  SPEAKER_03: "Головачева Полина3",
  SPEAKER_04: "Головачева Полина4",
  SPEAKER_05: "Головачева Полина5",
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
