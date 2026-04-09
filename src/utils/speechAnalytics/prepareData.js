import {
  getSpeakerFullName as getFullName,
  speakersConfig,
} from "./speakersConfig.js";

// Реэкспортируем getSpeakerFullName
export const getSpeakerFullName = getFullName;

// Получаем список всех спикеров
export const getAllSpeakers = (data) => {
  const uniqueSpeakers = [...new Set(data.speaker)];
  return uniqueSpeakers.map((id) => ({
    id,
    name: getSpeakerFullName(id),
  }));
};

// Подготовка данных для графика длительности речи
export const prepareSpeechDurationData = (data) => {
  const source = [];
  const durationMap = {};

  data.speaker.forEach((speaker, index) => {
    if (!durationMap[speaker]) {
      durationMap[speaker] = 0;
    }
    durationMap[speaker] += data.speech_length[index];
  });

  Object.entries(durationMap).forEach(([speaker, duration]) => {
    source.push([
      getSpeakerFullName(speaker), // name
      speaker, // speakerId
      duration, // duration
    ]);
  });

  return source;
};

// Фильтрация данных по спикеру
export const filterDataBySpeaker = (data, speakerId) => {
  const metrics = [];
  const wordCounts = {};

  data.speaker.forEach((speaker, index) => {
    if (speaker === speakerId) {
      metrics.push({
        end: data.end[index],
        total_pauses_ratio: data.total_pauses_ratio[index],
        pitch_range: data.pitch_range[index],
        aggressiveness: data.aggressiveness[index],
        trager: data.trager[index],
        action_certainty: data.action_certainty[index],
        congruence_emotion: data.congruence_emotion[index],
        congruence_value: data.congruence_value[index],
      });

      const wordParasites = data.word_parasites[index];
      wordParasites.forEach(([word, count]) => {
        wordCounts[word] = (wordCounts[word] || 0) + count;
      });
    }
  });

  const parasites = Object.entries(wordCounts)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

  return { metrics, parasites };
};

// Подготовка данных для тепловой карты
export const prepareHeatmapData = (data, valueKey) => {
  const uniqueSpeakers = [...new Set(data.speaker)];
  const days = uniqueSpeakers.map((speaker) => getSpeakerFullName(speaker));
  const hours = data.end.map((time) => time.toFixed(1) + "сек");

  const heatmapData = [];
  let maxValue = 0;

  data.speaker.forEach((speaker, index) => {
    const speakerIndex = uniqueSpeakers.indexOf(speaker);
    const value = data[valueKey][index];

    if (value > maxValue) maxValue = value;

    heatmapData.push([
      index, // x
      speakerIndex, // y
      value || 0,
    ]);
  });

  maxValue = Math.ceil(maxValue * 10) / 10;

  return {
    days,
    hours,
    heatmapData,
    maxValue,
    timeValues: data.end,
  };
};

// Подготовка данных для темпа речи
export const prepareAvgWordSpeedData = (data) => {
  const speechData = {};
  const speakers = [...new Set(data.speaker)];

  speakers.forEach((speaker) => {
    speechData[speaker] = [];
    data.speaker.forEach((s, index) => {
      if (s === speaker) {
        speechData[speaker].push(data.avg_word_speed[index]);
      }
    });
  });

  const maxIntervals = Math.max(
    ...Object.values(speechData).map((arr) => arr.length),
  );
  const intervals = Array.from({ length: maxIntervals }, (_, i) =>
    (i + 1).toString(),
  );

  const datasetSource = [["product", ...intervals]];
  speakers.forEach((speaker) => {
    const row = [getSpeakerFullName(speaker)];
    for (let i = 0; i < maxIntervals; i++) {
      row.push(speechData[speaker][i] || "-");
    }
    datasetSource.push(row);
  });

  return datasetSource;
};

// Подготовка данных эмоциональности
export const prepareEmotionalityData = (data, startIdx, endIdx) => {
  const result = {
    speakers: [],
    joyValues: [],
    aggressionValues: [],
    texts: [],
  };

  for (let i = startIdx; i < endIdx && i < data.speaker.length; i++) {
    result.speakers.push(getSpeakerFullName(data.speaker[i]));
    result.joyValues.push(data.joy_stamps_time_ratio?.[i] ?? 0);
    result.aggressionValues.push(data.aggression_stamps_time_ratio?.[i] ?? 0);
    result.texts.push(data.text?.[i] ?? "");
  }

  return result;
};
