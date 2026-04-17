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

// Укажите ID спикеров, которых нужно отобразить
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

  useEffect(() => {
    if (!chartRef.current || !chartData) return;

    if (chartInstance.current) {
      chartInstance.current.dispose();
      chartInstance.current = null;
    }

    // Получаем полные имена выбранных спикеров
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

    // Массив цветов для линий (в том же порядке, что и спикеры)
    const lineColors = filteredSpeakerIds.map(
      (id) => SPEAKER_COLORS[id] || "#5470C6",
    );

    chartInstance.current = echarts.init(chartRef.current);

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
          fontSize: 14,
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
          fontSize: 14,
        },
        nameTextStyle: {
          fontSize: 14,
        },
      },
      yAxis: {
        gridIndex: 0,
        name: "Скорость (слов/мин)",
        axisLabel: {
          fontFamily: "Roboto",
          fontWeight: 400,
          fontStyle: "Regular",
          fontSize: 14,
        },
        nameTextStyle: {
          fontSize: 14,
        },
      },
      grid: {
        top: "55%",
        bottom: "15%",
        left: "8%",
        right: "5%",
      },
      series: [
        // Линейные серии для каждого выбранного спикера
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
        // Круговая диаграмма — используем те же цвета, что и для линий
        {
          type: "pie",
          id: "pie",
          radius: "30%",
          center: ["50%", "25%"],
          emphasis: { focus: "self" },
          color: lineColors, // 👈 теперь цвета круговой диаграммы совпадают с цветами линий
          label: {
            formatter: (params) => {
              const value = parseFloat(params.data[params.encode.value[0]]);
              return `${params.name}: ${value.toFixed(2)} слов/мин (${params.percent.toFixed(1)}%)`;
            },
            fontFamily: "Roboto",
            fontWeight: 400,
            fontStyle: "Regular",
            fontSize: 14,
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
