import React, { useEffect, useRef, useState } from "react";
import * as echarts from "echarts";
import { loadSpeechData } from "@utils/speechAnalytics/loadData";
import { prepareAvgWordSpeedData } from "@utils/speechAnalytics/prepareData.js";
import styles from "../widgets.module.scss";
import Icon from "@icons/checkout.svg";

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
    chart.on("updateAxisPointer", (event) => {
      const xAxisInfo = event.axesInfo?.[0];
      if (xAxisInfo) {
        const dimension = xAxisInfo.value + 1; // +1 потому что первый столбец - имена
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
    }

    chartInstance.current = echarts.init(chartRef.current);
    const datasetSource = prepareAvgWordSpeedData(chartData);
    const speakersCount = datasetSource.length - 1;
    const option = {
      tooltip: {
        trigger: "axis",
        showContent: false,
        axisPointer: { type: "shadow" },
      },
      legend: {
        top: "bottom",
        data: datasetSource.slice(1).map((row) => row[0]), // имена спикеров
      },
      dataset: {
        source: datasetSource,
      },
      xAxis: {
        type: "category",
        gridIndex: 0,
      },
      yAxis: {
        gridIndex: 0,
      },
      grid: {
        top: "55%",
        bottom: "15%",
      },
      series: [
        // Линейные серии для каждого спикера
        ...datasetSource.slice(1).map(() => ({
          type: "line",
          smooth: true,
          seriesLayoutBy: "row",
          emphasis: { focus: "series" },
        })),
        // Круговая диаграмма вверху
        {
          type: "pie",
          id: "pie",
          radius: "30%",
          center: ["50%", "25%"],
          emphasis: { focus: "self" },
          label: {
            formatter: (params) => {
              const value = parseFloat(params.data[params.encode.value[0]]);
              return `${params.name}: ${value.toFixed(2)} слов/мин (${params.percent.toFixed(1)}%)`;
            },
          },
          encode: {
            itemName: "product",
            value: 1, // по умолчанию первый интервал
            tooltip: 1,
          },
        },
      ],
    };
    chartInstance.current.setOption(option);

    // Активируем обновление круговой диаграммы при наведении
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

  if (loading) {
    return <div className={styles.loading}>Загрузка данных...</div>;
  }

  if (error) {
    return <div className={styles.error}>Ошибка: {error}</div>;
  }

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
      </div>
    </div>
  );
};
