import React, { useEffect, useRef, useState, useMemo } from "react";
import * as echarts from "echarts";
import { loadSpeechData } from "@utils/speechAnalytics/loadData";
import {
  filterDataBySpeaker,
  getSpeakerFullName,
} from "@utils/speechAnalytics/prepareData";
import styles from "../widgets.module.scss";
import Icon from "@icons/checkout.svg";

// Возможные значения: SPEAKER_00, SPEAKER_01, SPEAKER_02, SPEAKER_03, SPEAKER_04, SPEAKER_05
const TARGET_SPEAKER_ID = "SPEAKER_03";

export const TotalPausesRatioWidget = ({
  data: propData,
  widgetId,
  realTimeData,
}) => {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);
  const [rawData, setRawData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const getFontSize = () => {
    const container = chartRef.current;
    if (!container) return 12;
    const width = container.clientWidth;
    return Math.min(Math.max(width * 0.02, 5), 16);
  };

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

  // Имя спикера для отображения
  const speakerName = useMemo(() => {
    return getSpeakerFullName(TARGET_SPEAKER_ID);
  }, []);

  // Отрисовка графика
  useEffect(() => {
    if (!chartRef.current || !speakerData || speakerData.length === 0) return;

    if (chartInstance.current) {
      chartInstance.current.dispose();
    }

    chartInstance.current = echarts.init(chartRef.current);
    const speakerId = TARGET_SPEAKER_ID;
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
        formatter: (params) => {
          return `Высказывание ${params[0].dataIndex + 1}<br/>
                    Время окончания: ${params[0].name} сек<br/>
                    Доля пауз: ${params[0].value}%`;
        },
        textStyle: {
          color: "#FFFFFF",
          fontFamily: "Roboto",
          fontWeight: 400,
          fontStyle: "Regular",
          fontSize: fontSize,
        },
      },
      xAxis: {
        type: "category",
        axisLabel: {
          fontSize: fontSize,
          fontFamily: "Roboto",
        },
        data: speakerData.map((item) => item.end.toFixed(2)),
      },
      yAxis: {
        axisLabel: {
          fontSize: fontSize,
          fontFamily: "Roboto",
        },
        //   type: "value",
        //   axisLabel: { formatter: "{value}%" },
      },
      series: [
        {
          name: `Доля пауз (${getSpeakerFullName(speakerId)})`,
          data: speakerData.map((item) => item.total_pauses_ratio.toFixed(2)),
          type: "line",
          symbol: "circle",
          symbolSize: 12,
          lineStyle: {
            color: "#1776E0",
            width: 4,
            type: "dashed",
          },
          itemStyle: {
            borderWidth: 2,
            borderColor: "#D429C5",
            color: "#FDC44C",
          },
          label: {
            show: true,
            position: "top",
            fontSize: fontSize,
            fontFamily: "Roboto",
            formatter: (params) => `${params.value}%`,
          },
        },
      ],
    };
    chartInstance.current.setOption(option);

    const handleResize = () => {
      if (chartInstance.current) {
        const newFontSize = getFontSize();
        chartInstance.current.setOption({
          tooltip: { textStyle: { fontSize: newFontSize } },
          xAxis: { axisLabel: { fontSize: newFontSize } },
          yAxis: { axisLabel: { fontSize: newFontSize } },
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
  }, [speakerData]);

  if (loading) return <div className={styles.loading}>Загрузка данных...</div>;
  if (error) return <div className={styles.error}>Ошибка: {error}</div>;
  if (!speakerData || speakerData.length === 0) {
    return (
      <div className={styles.noData}>
        Нет данных о паузах для участника {speakerName}
      </div>
    );
  }

  return (
    <div className={styles.widgetContent}>
      <div className={styles.widgetHeader}>
        <img src={Icon} alt="pauses" />
        <div className={styles.headerText}>
          <h2>Доля пауз в речи</h2>
          <p>Отношение длительности пауз к общей длительности высказываний</p>
        </div>
      </div>
      <div className={styles.widgetBody}>
        <div ref={chartRef} style={{ width: "100%", height: "100%" }} />
      </div>
    </div>
  );
};
