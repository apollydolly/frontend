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

export const CongruenceWidget = ({
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
    return Math.min(Math.max(width * 0.016, 5), 16);
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

  const speakerName = useMemo(() => getSpeakerFullName(TARGET_SPEAKER_ID), []);

  // Отрисовка графика
  useEffect(() => {
    if (!chartRef.current || !speakerData || speakerData.length === 0) return;

    if (chartInstance.current) {
      chartInstance.current.dispose();
    }

    chartInstance.current = echarts.init(chartRef.current);
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
        axisPointer: { type: "shadow" },
        formatter: (params) => {
          const time = params[0].axisValue;
          const happiness = params[0].value;
          const anger = -params[1].value;
          return `Время: ${time}<br/>
                  Радость: ${happiness.toFixed(2)}<br/>
                  Злость: ${anger.toFixed(2)}`;
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
        data: ["Радость", "Злость"],
        top: 10,
        left: "center",
        textStyle: {
          fontFamily: "Roboto",
          fontSize: fontSize,
        },
      },
      xAxis: {
        type: "value",
        axisLabel: {
          formatter: (value) => Math.abs(value).toFixed(2),
          fontFamily: "Roboto",
          fontSize: fontSize,
        },
      },
      yAxis: {
        type: "category",
        axisTick: { show: false },
        axisLabel: {
          margin: 40,
          align: "right",
          fontFamily: "Roboto",
          fontSize: fontSize,
        },
        data: speakerData.map((item) => item.end.toFixed(0) + "сек"),
      },
      series: [
        {
          name: "Радость",
          type: "bar",
          stack: "congruence",
          label: {
            show: true,
            position: "right",
            fontFamily: "Roboto",
            fontSize: fontSize,
            formatter: (params) => params.value.toFixed(2),
          },
          emphasis: { focus: "series" },
          itemStyle: { color: "#3CAB17" },
          data: speakerData.map((item) =>
            item.congruence_emotion === "happiness" ? item.congruence_value : 0,
          ),
        },
        {
          name: "Злость",
          type: "bar",
          stack: "congruence",
          label: {
            show: true,
            position: "left",
            fontFamily: "Roboto",
            fontSize: fontSize,
            formatter: (params) => (-params.value).toFixed(2),
          },
          emphasis: { focus: "series" },
          itemStyle: { color: "#EB3134" },
          data: speakerData.map((item) =>
            item.congruence_emotion === "angry" ? -item.congruence_value : 0,
          ),
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
          xAxis: { axisLabel: { fontSize: newFontSize } },
          yAxis: { axisLabel: { fontSize: newFontSize } },
          series: [
            { label: { fontSize: newFontSize } },
            { label: { fontSize: newFontSize } },
          ],
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
        Нет данных о конгруэнтности для участника {speakerName}
      </div>
    );
  }

  return (
    <div className={styles.widgetContent}>
      <div className={styles.widgetHeader}>
        <img src={Icon} alt="congruence" />
        <div className={styles.headerText}>
          <h2>Конгруэнтность</h2>
          <p>
            Рассогласование эмоций (неконгруэнтность), одновременно передаваемых
            в разных коммуникативных каналах с помощью мимики, голоса и в тексте
            речи.
          </p>
        </div>
      </div>
      <div className={styles.widgetBody}>
        <div ref={chartRef} style={{ width: "100%", height: "100%" }} />
        <div className={styles.widgetText}>
          <p>
            <span>Рассогласование эмоций (неконгруэнтность): </span>
            Низкий уровень (0,2 и менее) у обоих участников. Вербальные и
            невербальные сигналы (мимика, интонация) согласованы. Кандидат
            выглядит искренне заинтересованной, бот сохраняет профессиональную
            нейтральность.
          </p>
        </div>
      </div>
    </div>
  );
};
