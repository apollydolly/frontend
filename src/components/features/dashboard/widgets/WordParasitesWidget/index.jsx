import React, { useEffect, useRef, useState, useMemo } from "react";
import * as echarts from "echarts";
import { loadSpeechData } from "@utils/speechAnalytics/loadData";
import {
  filterDataBySpeaker,
  getSpeakerFullName,
} from "@utils/speechAnalytics/prepareData";
import styles from "../widgets.module.scss";
import Icon from "@icons/checkout.svg";

// Измените ID для другого спикера: SPEAKER_00, SPEAKER_01, SPEAKER_02, SPEAKER_03, SPEAKER_04, SPEAKER_05
const TARGET_SPEAKER_ID = "SPEAKER_03";

export const WordParasitesWidget = ({
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
    return Math.min(Math.max(width * 0.013, 5), 16);
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

  // Получаем данные о словах-паразитах для выбранного спикера
  const parasitesData = useMemo(() => {
    if (!rawData) return null;
    const filtered = filterDataBySpeaker(rawData, TARGET_SPEAKER_ID);
    return filtered.parasites; // массив { name, value }
  }, [rawData]);

  // Имя спикера для отображения
  const speakerName = useMemo(() => getSpeakerFullName(TARGET_SPEAKER_ID), []);

  // Отрисовка графика
  useEffect(() => {
    if (!chartRef.current || !parasitesData || parasitesData.length === 0)
      return;

    if (chartInstance.current) {
      chartInstance.current.dispose();
    }

    chartInstance.current = echarts.init(chartRef.current);
    const fontSize = getFontSize();

    const option = {
      tooltip: {
        trigger: "item",
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
          return `${params.name}<br/>Количество: ${params.value}<br/>Доля: ${params.percent.toFixed(1)}%`;
        },
        textStyle: {
          color: "#FFFFFF",
          fontFamily: "Roboto",
          fontWeight: 400,
          fontStyle: "Regular",
          fontSize: fontSize,
        },
      },
      legend: {
        bottom: 10,
        left: "center",
        orient: "horizontal",
        textStyle: {
          fontFamily: "Roboto",
          fontSize: fontSize,
        },
      },
      series: [
        {
          name: "Слова-паразиты",
          type: "pie",
          radius: ["40%", "70%"],
          center: ["50%", "38%"],
          roseType: "area",
          itemStyle: {
            borderRadius: 8,
          },
          data: parasitesData,
          label: {
            formatter: "{b}: {c} ({d}%)",
            fontFamily: "Roboto",
            fontSize: fontSize,
          },
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: "rgba(0, 0, 0, 0.5)",
            },
          },
          avoidLabelOverlap: true,
        },
      ],
    };

    chartInstance.current.setOption(option);

    const handleResize = () => {
      if (chartInstance.current) {
        const newFontSize = getFontSize();
        chartInstance.current.setOption({
          tooltip: { textStyle: { fontSize: newFontSize } },
          legend: { textStyle: { fontSize: newFontSize } },
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
  }, [parasitesData]);

  if (loading) return <div className={styles.loading}>Загрузка данных...</div>;
  if (error) return <div className={styles.error}>Ошибка: {error}</div>;
  if (!parasitesData || parasitesData.length === 0) {
    return (
      <div className={styles.noData}>
        Нет данных о словах-паразитах для участника {speakerName}
      </div>
    );
  }

  return (
    <div className={styles.widgetContent}>
      <div className={styles.widgetHeader}>
        <img src={Icon} alt="word parasites" />
        <div className={styles.headerText}>
          <h2>Замусоренность речи</h2>
          <p>Слова-паразиты, не несущие информационной нагрузки</p>
        </div>
      </div>
      <div className={styles.widgetBody}>
        <div ref={chartRef} style={{ width: "100%", height: "100%" }} />
        <div className={styles.widgetText}>
          <p>
            <span>Совет: </span>
            кандидату следует избегать слов-заполнителей, особенно в начале
            ответов.
          </p>
        </div>
      </div>
    </div>
  );
};
