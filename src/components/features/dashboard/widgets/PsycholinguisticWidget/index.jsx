import React, { useEffect, useRef, useState, useMemo } from "react";
import * as echarts from "echarts";
import { loadSpeechData } from "@utils/speechAnalytics/loadData";
import {
  filterDataBySpeaker,
  getSpeakerFullName,
} from "@utils/speechAnalytics/prepareData";
import styles from "../widgets.module.scss";
import Icon from "@icons/checkout.svg";

// Измените ID для другого спикера: SPEAKER_01, SPEAKER_02, SPEAKER_03, SPEAKER_04, SPEAKER_05
const TARGET_SPEAKER_ID = "SPEAKER_03";

export const PsycholinguisticWidget = ({
  data: propData,
  widgetId,
  realTimeData,
}) => {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);
  const [rawData, setRawData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Загрузка данных
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

  // Получаем данные для выбранного спикера
  const speakerData = useMemo(() => {
    if (!rawData) return null;
    const filtered = filterDataBySpeaker(rawData, TARGET_SPEAKER_ID);
    return filtered.metrics;
  }, [rawData]);

  const speakerName = useMemo(() => getSpeakerFullName(TARGET_SPEAKER_ID), []);

  // Отрисовка графика
  useEffect(() => {
    if (!chartRef.current || !speakerData || speakerData.length === 0) return;

    if (chartInstance.current) {
      chartInstance.current.dispose();
    }

    chartInstance.current = echarts.init(chartRef.current);

    const option = {
      tooltip: {
        trigger: "axis",
        axisPointer: { type: "cross", label: { backgroundColor: "#6a7985" } },
      },
      legend: {
        data: [
          "Коэффициент агрессивности",
          "Коэффициент Трейгера",
          "Коэффициент определённости действий",
        ],
        top: 10,
        left: 0,
        textStyle: { fontSize: 10 },
      },
      grid: {
        bottom: "3%",
        top: "18%",
        containLabel: true,
      },
      xAxis: {
        type: "category",
        boundaryGap: false,
        data: speakerData.map((item) => item.end.toFixed(2)),
        axisLabel: { fontSize: 9, rotate: 30 },
        // name: "Время окончания (сек)",
      },
      yAxis: {
        type: "value",
        axisLabel: { fontSize: 9 },
        // name: "Значение коэффициента",
      },
      series: [
        {
          name: "Коэффициент агрессивности",
          type: "line",
          stack: "Total",
          areaStyle: { opacity: 0.3 },
          color: "#E74C3C",
          emphasis: { focus: "series" },
          label: { show: true, position: "top", fontSize: 9 },
          data: speakerData.map((item) => item.aggressiveness?.toFixed(2) ?? 0),
        },
        {
          name: "Коэффициент Трейгера",
          type: "line",
          stack: "Total",
          areaStyle: { opacity: 0.3 },
          color: "#F39C12",
          emphasis: { focus: "series" },
          label: { show: true, position: "top", fontSize: 9 },
          data: speakerData.map((item) => item.trager?.toFixed(2) ?? 0),
        },
        {
          name: "Коэффициент определённости действий",
          type: "line",
          stack: "Total",
          areaStyle: { opacity: 0.3 },
          color: "#2ECC71",
          emphasis: { focus: "series" },
          label: { show: true, position: "top", fontSize: 9 },
          data: speakerData.map(
            (item) => item.action_certainty?.toFixed(2) ?? 0,
          ),
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
  }, [speakerData]);

  if (loading) return <div className={styles.loading}>Загрузка данных...</div>;
  if (error) return <div className={styles.error}>Ошибка: {error}</div>;
  if (!speakerData || speakerData.length === 0) {
    return (
      <div className={styles.noData}>
        Нет психолингвистических данных для участника {speakerName}
      </div>
    );
  }

  return (
    <div className={styles.widgetContent}>
      <div className={styles.widgetHeader}>
        <img src={Icon} alt="psycholinguistic" />
        <div className={styles.headerText}>
          <h2>Психолингвистические маркеры эмоционального возбуждения</h2>
          <p>Агрессивность, рефлексия (Трейгер) и определённость действий</p>
        </div>
      </div>
      <div className={styles.widgetBody}>
        <div ref={chartRef} style={{ width: "100%", height: "100%" }} />
      </div>
    </div>
  );
};
