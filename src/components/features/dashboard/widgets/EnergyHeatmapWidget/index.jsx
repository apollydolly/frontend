import React, { useEffect, useRef, useState } from "react";
import * as echarts from "echarts";
import { loadSpeechData } from "@utils/speechAnalytics/loadData";
import { prepareHeatmapData } from "@utils/speechAnalytics/prepareData.js";
import styles from "../widgets.module.scss";
import Icon from "@icons/checkout.svg";

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
    }

    chartInstance.current = echarts.init(chartRef.current);
    const { days, hours, heatmapData, maxValue, timeValues } =
      prepareHeatmapData(chartData, "mean_norm_energy");

    const axisInterval = Math.ceil(hours.length / 20); // Примерно 15 меток на графике
    const option = {
      tooltip: {
        position: "top",
        formatter: (params) => {
          const speaker = days[params.data[1]];
          const time = timeValues[params.data[0]];
          const value = params.data[2];
          return `${speaker}<br/>${time}<br/>Энергичность: ${value.toFixed(2)}`;
        },
      },
      grid: {
        height: "55%",
        top: "15%",
        left: "10%",
        right: "5%",
      },
      xAxis: {
        type: "category",
        data: hours,
        splitArea: { show: true },
        axisLabel: {
          interval: axisInterval,
          fontSize: 10,
          formatter: (value) => value.replace("сек", ""),
        },
      },
      yAxis: {
        type: "category",
        data: days,
        splitArea: { show: true },
        axisLabel: { fontSize: 11 },
      },
      visualMap: {
        min: 0,
        max: maxValue,
        calculable: true,
        orient: "horizontal",
        left: "center",
        //   bottom: "10%",
        inRange: {
          color: [
            // "#313695",
            // "#4575b4",
            // "#74add1",
            // "#abd9e9",
            // "#e0f3f8",
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
            fontSize: 9,
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
        <img src={Icon} alt="energy" />
        <div className={styles.headerText}>
          <h2>Энергичность участников</h2>
          <p>
            В целом встреча характеризуется средней энергичностью участников.
            Наблюдается сниженная активность в начале встречи, в начале
            длительных высказываний, в конце встречи.
          </p>
        </div>
      </div>
      <div className={styles.widgetBody}>
        <div ref={chartRef} style={{ width: "100%", height: "100%" }} />
      </div>
    </div>
  );
};
