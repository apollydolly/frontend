import React, { useEffect, useRef, useState } from "react";
import * as echarts from "echarts";
import { loadSpeechData } from "@utils/speechAnalytics/loadData";
import {
  prepareAvgWordSpeedData,
  getSpeakerFullName,
} from "@utils/speechAnalytics/prepareData.js";
import { SPEAKER_COLORS } from "@utils/speechAnalytics/speakersConfig.js";
import styles from "../widgets.module.scss";
import Icon from "@icons/checkout.svg";

const SELECTED_SPEAKERS = ["SPEAKER_02", "SPEAKER_03"];

export const AvgWordSpeedWidget = ({
  data: propData,
  widgetId,
  realTimeData,
}) => {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Функция получения актуального размера шрифта
  const getFontSize = () => {
    const container = chartRef.current;
    if (!container) return 12;
    const width = container.clientWidth;
    return Math.min(Math.max(width * 0.013, 5), 16);
  };

  const updatePieChart = (chart) => {
    chart.off("updateAxisPointer");
    chart.on("updateAxisPointer", (event) => {
      const xAxisInfo = event.axesInfo?.[0];
      if (xAxisInfo) {
        const dimension = xAxisInfo.value + 1;
        chart.setOption({
          series: {
            id: "pie",
            label: {
              formatter: (params) => {
                const value = parseFloat(params.data[dimension]);
                return `${params.name}: ${value.toFixed(2)} слов/мин (${params.percent.toFixed(1)}%)`;
              },
            },
            encode: {
              value: dimension,
              tooltip: dimension,
            },
          },
        });
      }
    });
  };

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

  // Основной эффект для построения графика
  useEffect(() => {
    if (!chartRef.current || !chartData) return;

    if (chartInstance.current) {
      chartInstance.current.dispose();
      chartInstance.current = null;
    }

    const selectedFullNames = SELECTED_SPEAKERS.map((id) =>
      getSpeakerFullName(id),
    );

    const fullDataset = prepareAvgWordSpeedData(chartData);
    if (fullDataset.length <= 1) {
      setError("Нет данных для отображения");
      return;
    }

    const headers = fullDataset[0];
    const filteredRows = [];
    const filteredSpeakerIds = [];

    fullDataset.slice(1).forEach((row) => {
      const fullName = row[0];
      const speakerId = Object.keys(SPEAKER_COLORS).find(
        (id) => getSpeakerFullName(id) === fullName,
      );
      if (selectedFullNames.includes(fullName)) {
        filteredRows.push(row);
        if (speakerId) filteredSpeakerIds.push(speakerId);
      }
    });

    if (filteredRows.length === 0) {
      setError("Нет данных для выбранных участников");
      return;
    }

    const filteredDataset = [headers, ...filteredRows];
    const speakerNames = filteredRows.map((row) => row[0]);
    const lineColors = filteredSpeakerIds.map(
      (id) => SPEAKER_COLORS[id] || "#5470C6",
    );

    chartInstance.current = echarts.init(chartRef.current);

    const fontSize = getFontSize();

    const option = {
      tooltip: {
        trigger: "axis",
        showContent: false,
        axisPointer: { type: "shadow" },
      },
      legend: {
        top: "bottom",
        data: speakerNames,
        itemGap: 70,
        textStyle: {
          fontFamily: "Roboto",
          fontWeight: 400,
          fontStyle: "Regular",
          fontSize: fontSize,
        },
      },
      dataset: {
        source: filteredDataset,
      },
      xAxis: {
        type: "category",
        gridIndex: 0,
        name: "Интервал \nвысказывания",
        axisLabel: {
          fontFamily: "Roboto",
          fontWeight: 400,
          fontStyle: "Regular",
          fontSize: fontSize,
        },
        nameTextStyle: {
          fontSize: fontSize,
        },
      },
      yAxis: {
        gridIndex: 0,
        name: "Скорость (слов/мин)",
        axisLabel: {
          fontFamily: "Roboto",
          fontWeight: 400,
          fontStyle: "Regular",
          fontSize: fontSize,
        },
        nameTextStyle: {
          fontSize: fontSize,
        },
      },
      grid: {
        top: "55%",
        bottom: "15%",
        left: "8%",
        right: "12%",
      },
      series: [
        ...filteredRows.map((_, idx) => ({
          type: "line",
          smooth: true,
          seriesLayoutBy: "row",
          emphasis: { focus: "series" },
          lineStyle: { color: lineColors[idx], width: 2 },
          itemStyle: {
            color: lineColors[idx],
            borderColor: "#fff",
            borderWidth: 1,
          },
          symbol: "circle",
          symbolSize: 6,
          label: { show: false },
        })),
        {
          type: "pie",
          id: "pie",
          radius: "30%",
          center: ["50%", "25%"],
          emphasis: { focus: "self" },
          color: lineColors,
          label: {
            formatter: (params) => {
              const value = parseFloat(params.data[params.encode.value[0]]);
              return `${params.name}: ${value.toFixed(2)} слов/мин (${params.percent.toFixed(1)}%)`;
            },
            fontFamily: "Roboto",
            fontWeight: 400,
            fontStyle: "Regular",
            fontSize: fontSize,
          },
          encode: {
            itemName: "product",
            value: 1,
            tooltip: 1,
          },
        },
      ],
    };

    chartInstance.current.setOption(option);
    updatePieChart(chartInstance.current);

    const handleResize = () => {
      if (chartInstance.current) {
        const newFontSize = getFontSize();
        chartInstance.current.setOption({
          legend: {
            textStyle: { fontSize: newFontSize },
          },
          xAxis: {
            axisLabel: { fontSize: newFontSize },
            nameTextStyle: { fontSize: newFontSize },
          },
          yAxis: {
            axisLabel: { fontSize: newFontSize },
            nameTextStyle: { fontSize: newFontSize },
          },
          series: {
            id: "pie",
            label: { fontSize: newFontSize },
          },
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
        <img src={Icon} alt="speech speed" />
        <div className={styles.headerText}>
          <h2>Темп речи участников</h2>
          <p>Темп речи отдельных участников и доля пауз в их речи.</p>
        </div>
      </div>
      <div className={styles.widgetBody}>
        <div ref={chartRef} style={{ width: "100%", height: "100%" }} />
        <div className={styles.widgetText}>
          <p>
            <span>Кандидат: </span>нормальный темп, позволяет удерживать
            внимание.
          </p>
          <p>
            <span>Рекрутер (бот): </span>чуть выше среднего, характерно для
            чётко структурированных вопросов.
          </p>
          <p>
            <span>Рекомендация: </span>
            кандидату поддерживать текущий темп, избегать ускорения в сложных
            вопросах.
          </p>
        </div>
      </div>
    </div>
  );
};
