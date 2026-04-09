import React, { useEffect, useRef, useState } from "react";
import * as echarts from "echarts";
import { loadSpeechData } from "@utils/speechAnalytics/loadData";
import { getSpeakerFullName } from "@utils/speechAnalytics/prepareData";
import styles from "../widgets.module.scss";
import Icon from "@icons/checkout.svg";

// Выберите, какие части отображать (1, 2, 3). Можно указать одну или несколько.
const SELECTED_PARTS = [1];

// Укажите ID спикеров, которых нужно отобразить
const SELECTED_SPEAKERS = ["SPEAKER_02", "SPEAKER_03"];

export const EmotionalityWidget = ({
  data: propData,
  widgetId,
  realTimeData,
}) => {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);
  const [rawData, setRawData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (realTimeData?.speechData) {
      setRawData(realTimeData.speechData);
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        const data = await loadSpeechData();
        if (data) {
          setRawData(data);
        } else {
          setError("Не удалось загрузить данные");
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [realTimeData]);

  useEffect(() => {
    if (!chartRef.current || !rawData) return;

    if (chartInstance.current) {
      chartInstance.current.dispose();
      chartInstance.current = null;
    }

    // Фильтруем данные по спикерам
    const filteredSpeaker = [];
    const filteredJoyStamps = [];
    const filteredAggressionStamps = [];
    const filteredText = [];

    rawData.speaker.forEach((speaker, idx) => {
      if (SELECTED_SPEAKERS.includes(speaker)) {
        filteredSpeaker.push(speaker);
        filteredJoyStamps.push(rawData.joy_stamps_time_ratio?.[idx] ?? 0);
        filteredAggressionStamps.push(
          rawData.aggression_stamps_time_ratio?.[idx] ?? 0,
        );
        filteredText.push(rawData.text?.[idx] ?? "");
      }
    });

    if (filteredSpeaker.length === 0) {
      setError("Нет данных для выбранных участников");
      return;
    }

    // Собираем индексы для выбранных частей
    const partSize = 25;
    let selectedIndices = [];
    SELECTED_PARTS.forEach((part) => {
      const startIdx = (part - 1) * partSize;
      const endIdx = Math.min(startIdx + partSize, filteredSpeaker.length);
      for (let i = startIdx; i < endIdx; i++) {
        selectedIndices.push(i);
      }
    });
    selectedIndices = [...new Set(selectedIndices)].sort((a, b) => a - b);

    if (selectedIndices.length === 0) {
      setError("Нет данных для выбранных частей");
      return;
    }

    // Формируем данные для графика
    const chartData = {
      speakers: selectedIndices.map((i) =>
        getSpeakerFullName(filteredSpeaker[i]),
      ),
      joyValues: selectedIndices.map((i) => filteredJoyStamps[i]),
      aggressionValues: selectedIndices.map((i) => filteredAggressionStamps[i]),
      texts: selectedIndices.map((i) => filteredText[i]),
    };

    chartInstance.current = echarts.init(chartRef.current);

    const option = {
      tooltip: {
        trigger: "axis",
        gap: 8,
        paddingTop: 4,
        paddingRight: 8,
        paddingBottom: 6,
        paddingLeft: 8,
        borderRadius: 4,
        backgroundColor: "#00000066",
        backdropFilter: "blur(24px)",
        borderWidth: 0,
        axisPointer: { type: "shadow" },
        formatter: (params) => {
          const idx = params[0].dataIndex;
          const speaker = chartData.speakers[idx];
          const text =
            chartData.texts[idx].length > 50
              ? chartData.texts[idx].substring(0, 50) + "..."
              : chartData.texts[idx];
          let tooltip = `<b>${speaker}</b><br/>"${text}"<br/><br/>`;
          if (chartData.joyValues[idx] > 0) {
            tooltip += `Позитив: ${chartData.joyValues[idx].toFixed(2)}</span><br/>`;
          }
          if (chartData.aggressionValues[idx] > 0) {
            tooltip += `Агрессия: ${chartData.aggressionValues[idx].toFixed(2)}</span>`;
          }
          return tooltip;
        },
        textStyle: {
          color: "#FFFFFF",
          fontFamily: "Roboto",
          fontWeight: 400,
          fontStyle: "Regular",
          fontSize: 14,
        },
      },
      xAxis: {
        type: "value",
        position: "top",
        splitLine: { lineStyle: { type: "dashed" } },
        axisLabel: {
          fontFamily: "Roboto",
          fontSize: 14,
        },
      },
      yAxis: {
        type: "category",
        axisLine: { show: false },
        axisLabel: { show: false },
        axisTick: { show: false },
        splitLine: { show: false },
        data: chartData.speakers.map((speaker, idx) => {
          const shortText =
            chartData.texts[idx].length > 30
              ? chartData.texts[idx].substring(0, 30) + "..."
              : chartData.texts[idx];
          return `${speaker}: ${shortText}`;
        }),
      },
      series: [
        {
          name: "Эмоциональность",
          type: "bar",
          stack: "Total",
          label: {
            show: true,
            formatter: (params) => Math.abs(params.value).toFixed(2),
            position: "right",
            fontFamily: "Roboto",
            fontSize: 14,
          },
          itemStyle: {
            color: (params) => (params.value >= 0 ? "#3CAB17" : "#EB3134"),
          },
          data: chartData.joyValues.map((joy, idx) => {
            return chartData.aggressionValues[idx] > 0
              ? {
                  value: -chartData.aggressionValues[idx],
                  label: { position: "right" },
                }
              : joy;
          }),
        },
      ],
    };

    if (chartInstance.current) {
      chartInstance.current.setOption(option);
    }

    const handleResize = () => {
      if (chartInstance.current) chartInstance.current.resize();
    };
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      if (chartInstance.current) {
        chartInstance.current.dispose();
        chartInstance.current = null;
      }
    };
  }, [rawData]);

  if (loading) return <div className={styles.loading}>Загрузка данных...</div>;
  if (error) return <div className={styles.error}>Ошибка: {error}</div>;
  if (!rawData) return <div className={styles.noData}>Нет данных</div>;

  const partsStr = SELECTED_PARTS.join(", ");
  const partTitle = `Части ${partsStr}`;

  return (
    <div className={styles.widgetContent}>
      <div className={styles.widgetHeader}>
        <img src={Icon} alt="emotionality" />
        <div className={styles.headerText}>
          <h2>Эмоциональность высказываний</h2>
          <p>Зелёные столбцы — позитив, красные — агрессия</p>
        </div>
      </div>
      <div className={styles.widgetBody}>
        <div ref={chartRef} style={{ width: "100%", height: "100%" }} />
      </div>
    </div>
  );
};
