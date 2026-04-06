import React, { useMemo } from "react";
import ReactECharts from "echarts-for-react";
import styles from "./ChartWidget.module.scss";

export const ChartWidget = () => {
  const chartOptions = useMemo(() => {
    return {
      title: {
        // text: "Пример графика",
        left: "center",
      },
      tooltip: {
        trigger: "axis",
      },
      xAxis: {
        type: "category",
        data: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
      },
      yAxis: {
        type: "value",
      },
      series: [
        {
          data: [120, 200, 150, 80, 70, 110, 130],
          type: "bar",
        },
      ],
      grid: {
        left: "3%",
        right: "3%",
        bottom: "3%",
        top: "15%",
        containLabel: true,
      },
    };
  }, []);

  return (
    <div className={styles.chartPlaceholder}>
      <ReactECharts
        option={chartOptions}
        style={{ height: "100%", width: "100%" }}
        opts={{ renderer: "svg" }}
      />
    </div>
  );
};
