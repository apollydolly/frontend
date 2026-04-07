export const speakersConfig = {
  SPEAKER_00: "Guzalya Sabiryanova",
  SPEAKER_01: "Даниил Лебедев",
  SPEAKER_02: "Alex Krass",
  SPEAKER_03: "Sergei Dubrovin",
  SPEAKER_04: "Alex Krass",
  SPEAKER_05: "Дарья Гартунг",
};

export const SPEAKER_COLORS = {
  SPEAKER_00: "#c23531",
  SPEAKER_01: "#2f4554",
  SPEAKER_02: "#61a0a8",
  SPEAKER_03: "#d48265",
  SPEAKER_04: "#91c7ae",
  SPEAKER_05: "#749f83",
};

export const getSpeakerFullName = (speakerId) =>
  speakersConfig[speakerId] || speakerId;
