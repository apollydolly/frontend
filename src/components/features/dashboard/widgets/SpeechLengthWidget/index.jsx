import React, { useEffect, useRef, useState } from "react";
import * as echarts from "echarts";
import { loadSpeechData } from "@utils/speechAnalytics/loadData";
import { prepareSpeechDurationData } from "@utils/speechAnalytics/prepareData.js";
import styles from "../widgets.module.scss";
import Icon from "@icons/checkout.svg";

const SELECTED_SPEAKERS = ["SPEAKER_02", "SPEAKER_03"];

// // Точные длительности
// const FIXED_DURATIONS = {
//   SPEAKER_02: 211.8, // кандидат
//   SPEAKER_03: 121.7, // ассистент
// };

export const SpeechLenghtWidget = ({
  data: propData,
  widgetId,
  realTimeData,
}) => {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // // Функция обработки данных: вычисляет длительности и заменяет их на фиксированные
  // const processData = (rawData) => {
  //   let source = prepareSpeechDurationData(rawData);
  //   source = source.filter((row) => SELECTED_SPEAKERS.includes(row[1]));
  //   // Заменяем длительности на известные
  //   source = source.map((row) => {
  //     const speakerId = row[1];
  //     if (FIXED_DURATIONS[speakerId]) {
  //       return [row[0], speakerId, FIXED_DURATIONS[speakerId]];
  //     }
  //     return row;
  //   });
  //   source.sort((a, b) => b[2] - a[2]);
  //   return source;
  // };

  const getFontSize = () => {
    const container = chartRef.current;
    if (!container) return 12;
    const width = container.clientWidth;
    return Math.min(Math.max(width * 0.02, 5), 16);
  };

  useEffect(() => {
    if (realTimeData?.speechData) {
      // const processed = processData(realTimeData.speechData);
      // setChartData(processed);
      setChartData(realTimeData.speechData);
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        const data = await loadSpeechData();
        if (data) {
          // const processed = processData(data);
          // setChartData(processed);
          setChartData(data);
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
    if (!chartRef.current || !chartData) return;

    if (chartInstance.current) {
      chartInstance.current.dispose();
      chartInstance.current = null;
    }

    // if (chartData.length === 0) {
    //   setError("Нет данных для выбранных участников");
    //   return;
    // }

    let source = prepareSpeechDurationData(chartData);
    source = source.filter((row) => SELECTED_SPEAKERS.includes(row[1]));
    source.sort((a, b) => b[2] - a[2]);

    if (source.length === 0) {
      setError("Нет данных для выбранных участников");
      return;
    }

    chartInstance.current = echarts.init(chartRef.current);
    const fontSize = getFontSize();

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
        formatter: (params) =>
          `${params[0].name}<br/>Длительность: ${params[0].value[2].toFixed(2)} сек`,
        textStyle: {
          color: "#FFFFFF",
          fontFamily: "Roboto",
          fontWeight: 400,
          fontSize: fontSize,
        },
      },
      dataset: {
        // source: chartData,
        source: source,
        dimensions: ["name", "speakerId", "duration"],
      },
      xAxis: {
        type: "category",
        axisLabel: {
          fontFamily: "Roboto",
          fontSize: fontSize,
        },
      },
      yAxis: {
        type: "value",
        name: "Длительность (сек)",
        nameTextStyle: { fontSize: fontSize, fontFamily: "Roboto" },
        axisLabel: {
          fontFamily: "Roboto",
          fontSize: fontSize,
        },
      },
      series: {
        type: "bar",
        encode: { x: "name", y: "duration" },
        label: {
          show: true,
          position: "top",
          fontFamily: "Roboto",
          fontSize: fontSize,
          formatter: (params) => `${parseFloat(params.data[2]).toFixed(2)} сек`,
        },
        itemStyle: { color: "#1776E0", borderRadius: [8, 8, 0, 0] },
      },
    };

    chartInstance.current.setOption(option, true);

    const handleResize = () => {
      if (chartInstance.current) {
        const newFontSize = getFontSize();
        chartInstance.current.setOption({
          tooltip: { textStyle: { fontSize: newFontSize } },
          xAxis: { axisLabel: { fontSize: newFontSize } },
          yAxis: {
            nameTextStyle: { fontSize: newFontSize },
            axisLabel: { fontSize: newFontSize },
          },
          series: { label: { fontSize: newFontSize } },
        });
        chartInstance.current.resize();
      }
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      if (chartInstance.current) {
        chartInstance.current.dispose();
        chartInstance.current = null;
      }
    };
  }, [chartData]);

  if (loading) return <div className={styles.loading}>Загрузка данных...</div>;
  if (error) return <div className={styles.error}>Ошибка: {error}</div>;

  return (
    <div className={styles.widgetContent}>
      <div className={styles.widgetHeader}>
        <img src={Icon} alt="icon" />
        <div className={styles.headerText}>
          <h2>Длительность активной речи участников</h2>
          <p>
            Распределение длительности активной речи (говорения) между
            участниками.
          </p>
        </div>
      </div>
      <div className={styles.widgetBody}>
        <div ref={chartRef} style={{ width: "100%", height: "100%" }} />
        <div className={styles.widgetText}>
          <p>
            <span>Кандидат: </span>50.9% (отвечал на вопросы, приводил примеры)
          </p>
          <p>
            <span>Рекрутер (бот): </span>29.2% (задавал вопросы, подводил итоги)
          </p>
          <p>
            Неравномерность обусловлена форматом собеседования – кандидат
            говорит больше.
          </p>
        </div>
      </div>
    </div>
  );
};
