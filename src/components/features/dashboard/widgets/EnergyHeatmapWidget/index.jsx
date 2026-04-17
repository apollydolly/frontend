import React, { useEffect, useRef, useState } from "react";
import * as echarts from "echarts";
import { loadSpeechData } from "@utils/speechAnalytics/loadData";
import { prepareHeatmapData } from "@utils/speechAnalytics/prepareData.js";
import styles from "../widgets.module.scss";
import Icon from "@icons/checkout.svg";

// Укажите ID спикеров, которых нужно отобразить
const SELECTED_SPEAKERS = ["SPEAKER_02", "SPEAKER_03"];

export const EnergyHeatmapWidget = ({
  data: propData,
  widgetId,
  realTimeData,
}) => {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (realTimeData?.speechData) {
      setChartData(realTimeData.speechData);
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        const data = await loadSpeechData();
        if (data) {
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

    // Фильтрация данных (без изменений)
    const filteredSpeaker = [];
    const filteredEnergy = [];
    const filteredEnd = [];
    chartData.speaker.forEach((speaker, idx) => {
      if (SELECTED_SPEAKERS.includes(speaker)) {
        filteredSpeaker.push(speaker);
        filteredEnergy.push(chartData.mean_norm_energy[idx]);
        filteredEnd.push(chartData.end[idx]);
      }
    });
    if (filteredSpeaker.length === 0) {
      setError("Нет данных для выбранных участников");
      return;
    }
    const filteredData = {
      ...chartData,
      speaker: filteredSpeaker,
      mean_norm_energy: filteredEnergy,
      end: filteredEnd,
    };

    const { days, hours, heatmapData, maxValue, timeValues } =
      prepareHeatmapData(filteredData, "mean_norm_energy");
    const axisInterval = Math.ceil(hours.length / 20);

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
          const time = timeValues[params.data[0]];
          const value = params.data[2];
          return `${speaker}<br/>${time}<br/>Энергичность: ${value.toFixed(2)}`;
        },
        textStyle: {
          color: "#FFFFFF",
          fontFamily: "Roboto",
          fontWeight: 400,
          fontStyle: "Regular",
          fontSize: 14,
        },
      },
      grid: { height: "50%", top: "10%", left: "10%", right: "5%" },
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
        max: maxValue,
        calculable: true,
        orient: "horizontal",
        left: "center",
        inRange: {
          color: [
            "#ffffbf",
            "#fee090",
            "#fdae61",
            "#f46d43",
            "#d73027",
            "#a50026",
          ],
        },
        formatter: (value) => value.toFixed(2),
      },
      series: [
        {
          name: "Энергичность",
          type: "heatmap",
          data: heatmapData,
          label: {
            show: true,
            formatter: (params) => params.data[2].toFixed(2),
            fontSize: 14,
            fontFamily: "Roboto",
          },
          emphasis: {
            itemStyle: { shadowBlur: 10, shadowColor: "rgba(0, 0, 0, 0.5)" },
          },
        },
      ],
    };

    chartInstance.current = echarts.init(chartRef.current);
    chartInstance.current.setOption(option, true);
    // Принудительно пересчитываем размеры, чтобы применить стили
    setTimeout(() => chartInstance.current?.resize(), 0);

    const handleResize = () => chartInstance.current?.resize();
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
        <img src={Icon} alt="energy" />
        <div className={styles.headerText}>
          <h2>Энергичность участников</h2>
          <p>
            Характеристика энергичности высказываний участников на протяжении
            всей встречи
          </p>
        </div>
      </div>
      <div className={styles.widgetBody}>
        <div ref={chartRef} style={{ width: "100%", height: "80%" }} />
        <div className={styles.widgetText}>
          <p>
            <span>Кандидат: </span>
            средняя энергичность. Наблюдается небольшой спад в середине
            длительных ответов.
          </p>
          <p>
            <span>Рекрутер (бот): </span>
            стабильная энергичность. Бот поддерживает ровный тонус на протяжении
            всего диалога.
          </p>
          <p>
            <span>Возможные причины снижения энергичности кандидата: </span>
            волнение, необходимость вспоминать детали проектов. Рекомендуется
            делать короткие паузы для переключения внимания.
          </p>
        </div>
      </div>
    </div>
  );
};
