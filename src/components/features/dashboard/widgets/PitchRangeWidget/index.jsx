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

export const PitchRangeWidget = ({
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

  const speakerData = useMemo(() => {
    if (!rawData) return null;
    const filtered = filterDataBySpeaker(rawData, TARGET_SPEAKER_ID);
    return filtered.metrics;
  }, [rawData]);

  const speakerName = useMemo(() => getSpeakerFullName(TARGET_SPEAKER_ID), []);

  useEffect(() => {
    if (!chartRef.current || !speakerData || speakerData.length === 0) return;

    if (chartInstance.current) {
      chartInstance.current.dispose();
    }

    chartInstance.current = echarts.init(chartRef.current);
    const speakerId = TARGET_SPEAKER_ID;
    const option = {
      tooltip: {
        trigger: "axis",
        formatter: (params) => {
          return `Высказывание ${params[0].dataIndex + 1}<br/>
                    Время окончания: ${params[0].name} сек<br/>
                    Диапазон тона: ${params[0].value}`;
        },
      },
      xAxis: {
        type: "category",
        // name: "Время окончания высказывания (сек)",
        data: speakerData.map((item) => item.end.toFixed(2)),
      },
      yAxis: {
        type: "value",
        // name: "Диапазон тона",
      },
      series: [
        {
          name: `Диапазон тона (${getSpeakerFullName(speakerId)})`,
          data: speakerData.map((item) => item.pitch_range.toFixed(2)),
          type: "line",
          symbol: "triangle",
          symbolSize: 8,
          lineStyle: {
            color: "#5470C6",
            width: 3,
            type: "dashed",
          },
          itemStyle: {
            borderWidth: 2,
            borderColor: "#EE6666",
            color: "#FFD700",
          },
          label: {
            show: true,
            position: "top",
            fontSize: 10,
            formatter: (params) => `${params.value}`,
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
  }, [speakerData]);

  if (loading) return <div className={styles.loading}>Загрузка данных...</div>;
  if (error) return <div className={styles.error}>Ошибка: {error}</div>;
  if (!speakerData || speakerData.length === 0) {
    return (
      <div className={styles.noData}>
        Нет данных о тоне для участника {speakerName}
      </div>
    );
  }

  return (
    <div className={styles.widgetContent}>
      <div className={styles.widgetHeader}>
        <img src={Icon} alt="pitch" />
        <div className={styles.headerText}>
          <h2>Диапазон тона речи</h2>
          <p>
            Монотонность (малое изменение тона, &lt;30) может снижать качество
            восприятия
          </p>
        </div>
      </div>
      <div className={styles.widgetBody}>
        <div ref={chartRef} style={{ width: "100%", height: "100%" }} />
      </div>
    </div>
  );
};
