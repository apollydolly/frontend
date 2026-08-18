import React, { useEffect, useRef, useState } from "react";
import * as echarts from "echarts";
import { loadSpeechData } from "@utils/speechAnalytics/loadData";
import { prepareHeatmapData } from "@utils/speechAnalytics/prepareData";
import styles from "../widgets.module.scss";
import Icon from "@icons/checkout.svg";

const SELECTED_SPEAKERS = ["SPEAKER_02", "SPEAKER_03"];

// const scaleTimeData = (rawData, targetMaxTime = 416) => {
//   if (!rawData || !rawData.end || rawData.end.length === 0) return rawData;
//   const maxEnd = Math.max(...rawData.end);
//   if (maxEnd <= targetMaxTime) return rawData;
//   const scale = targetMaxTime / maxEnd;

//   const scaledStart = rawData.start
//     ? rawData.start.map((t) => t * scale)
//     : undefined;
//   const scaledEnd = rawData.end.map((t) => t * scale);

//   return {
//     ...rawData,
//     start: scaledStart,
//     end: scaledEnd,
//   };
// };

export const EmotionalHeatmapWidget = ({
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
      // const scaled = scaleTimeData(realTimeData.speechData);
      // setRawData(scaled);
      setRawData(realTimeData.speechData);
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        const data = await loadSpeechData();
        if (data) {
          // const scaled = scaleTimeData(data);
          // setRawData(scaled);
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

    const filteredSpeaker = [];
    const filteredJoyWordsRatio = [];
    const filteredEnd = [];

    rawData.speaker.forEach((speaker, idx) => {
      if (SELECTED_SPEAKERS.includes(speaker)) {
        filteredSpeaker.push(speaker);
        filteredJoyWordsRatio.push(rawData.joy_words_ratio?.[idx] ?? 0);
        filteredEnd.push(rawData.end[idx]);
      }
    });

    if (filteredSpeaker.length === 0) {
      setError("Нет данных для выбранных участников");
      return;
    }

    const filteredData = {
      ...rawData,
      speaker: filteredSpeaker,
      joy_words_ratio: filteredJoyWordsRatio,
      end: filteredEnd,
    };

    const { days, hours, heatmapData, maxValue, timeValues } =
      prepareHeatmapData(filteredData, "joy_words_ratio");
    const axisInterval = Math.ceil(hours.length / 15);

    chartInstance.current = echarts.init(chartRef.current);
    const option = {
      tooltip: {
        position: "top",
        gap: 8,
        paddingTop: 4,
        paddingRight: 8,
        paddingBottom: 6,
        paddingLeft: 8,
        borderRadius: 4,
        backgroundColor: "#00000066",
        backdropFilter: "blur(24px)",
        borderWidth: 0,
        formatter: (params) => {
          const speaker = days[params.data[1]];
          const time = timeValues[params.data[0]].toFixed(1);
          const value = params.data[2];
          return `${speaker}<br/>Время: ${time}с<br/>Эмоциональность: ${value.toFixed(2)}`;
        },
        textStyle: {
          color: "#FFFFFF",
          fontFamily: "Roboto",
          fontWeight: 400,
          fontSize: 14,
        },
      },
      grid: {
        height: "50%",
        top: "10%",
        left: "10%",
        right: "5%",
      },
      xAxis: {
        type: "category",
        data: hours,
        splitArea: { show: true },
        axisLabel: {
          interval: axisInterval,
          fontSize: 14,
          fontFamily: "Roboto",
          formatter: (value) => value.replace("сек", ""),
        },
      },
      yAxis: {
        type: "category",
        data: days,
        splitArea: { show: true },
        axisLabel: { fontSize: 14, fontFamily: "Roboto" },
      },
      visualMap: {
        min: 0,
        max: 1,
        calculable: true,
        orient: "horizontal",
        left: "center",
        inRange: {
          color: [
            "#fffacd",
            "#f0e68c",
            "#d8e887",
            "#b8e080",
            "#98d979",
            "#78d173",
          ],
        },
        formatter: (value) => value.toFixed(2),
      },
      series: [
        {
          name: "Эмоциональность",
          type: "heatmap",
          data: heatmapData,
          label: {
            show: true,
            formatter: (params) => params.data[2].toFixed(2),
            fontSize: 14,
            fontFamily: "Roboto",
          },
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowColor: "rgba(0, 0, 0, 0.5)",
            },
          },
        },
      ],
    };

    chartInstance.current.setOption(option);

    const handleResize = () => {
      if (chartInstance.current) {
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
  }, [rawData]);

  if (loading) return <div className={styles.loading}>Загрузка данных...</div>;
  if (error) return <div className={styles.error}>Ошибка: {error}</div>;
  if (!rawData) return <div className={styles.noData}>Нет данных</div>;

  return (
    <div className={styles.widgetContent}>
      <div className={styles.widgetHeader}>
        <img src={Icon} alt="emotion" />
        <div className={styles.headerText}>
          <h2>Эмоциональный климат</h2>
          <p>
            Высказывания всех участников на протяжении встречи (тепловая карта
            эмоциональности)
          </p>
        </div>
      </div>
      <div className={styles.widgetBody}>
        <div ref={chartRef} style={{ width: "100%", height: "80%" }} />
        <div className={styles.widgetText}>
          <p>
            Общее настроение – <span>конструктивное, деловое.</span> Кандидат
            проявляет позитивный настрой, открытость к вопросам. Рекрутёр
            поддерживает ровную доброжелательную атмосферу. Давления или
            конфликтных моментов не зафиксировано.
          </p>
        </div>
      </div>
    </div>
  );
};
