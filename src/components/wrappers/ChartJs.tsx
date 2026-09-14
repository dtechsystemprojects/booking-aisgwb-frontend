"use client";
import { useLayoutContext } from "@/context/useLayoutContext";
import { getColor } from "@/utils/helpers";
import {
  CategoryScale,
  ChartComponentLike,
  type ChartConfiguration,
  Chart as ChartJS,
  ChartOptions,
  Decimation,
  Legend,
  LinearScale,
  SubTitle,
  Title,
  Tooltip,
} from "chart.js";
import { merge } from "lodash";
import { useEffect, useState } from "react";
import { Chart } from "react-chartjs-2";

type PropsType = {
  type: ChartConfiguration["type"];
  height?: number | string;
  width?: number | string;
  getOptions: () => ChartJSOptionsType;
  plugins?: ChartComponentLike;
  style?: React.CSSProperties;
};

export type ChartJSOptionsType = {
  data: ChartConfiguration["data"];
  options?: ChartConfiguration["options"];
};

function getDefaultChartOptions(): ChartOptions {
  if (typeof window === "undefined") {
    return {};
  }

  const bodyFont = getComputedStyle(document.body).fontFamily.trim();

  return {
    responsive: true,
    maintainAspectRatio: false,
    layout: {
      padding: {
        top: -10,
      },
    },
    scales: {
      x: {
        ticks: {
          font: { family: bodyFont },
          color: getColor("secondary-color"),
          display: true,
        },
        grid: { display: false },
        border: { display: false },
      },
      y: {
        ticks: {
          font: { family: bodyFont },
          color: getColor("secondary-color"),
        },
        grid: {
          display: true,
          color: getColor("chart-border-color"),
          lineWidth: 1,
        },
        border: {
          display: false,
          dash: [5, 5],
        },
      },
    },
    plugins: {
      legend: {
        display: true,
        position: "top",
        labels: {
          font: { family: bodyFont },
          color: getColor("secondary-color"),
          usePointStyle: true,
          pointStyle: "circle",
          boxWidth: 8,
          boxHeight: 8,
          padding: 15,
        },
      },
      tooltip: {
        enabled: true,
        titleFont: { family: bodyFont },
        bodyFont: { family: bodyFont },
      },
    },
  };
}

const ChartJs = ({
  type,
  height = "100%",
  width = "100%",
  getOptions,
  plugins,
  style,
}: PropsType) => {
  ChartJS.register(
    Tooltip,
    Legend,
    Title,
    SubTitle,
    Decimation,
    CategoryScale,
    LinearScale,
    plugins ?? [],
  );

  const { skin, theme } = useLayoutContext();

  const [mounted] = useState(() => typeof window !== "undefined");

  const [chartState, setChartState] = useState<{
    data: ChartConfiguration["data"];
    options: ChartConfiguration["options"];
  }>({
    data: { labels: [], datasets: [] },
    options: {},
  });

  useEffect(() => {
    if (!mounted) return;

    const delay = theme === "system" ? 10 : 0;

    const timer = setTimeout(() => {
      const { data, options } = getOptions();
      const mergedOptions = merge({}, getDefaultChartOptions(), options);
      setChartState({ data, options: mergedOptions });
    }, delay);

    return () => clearTimeout(timer);
  }, [mounted, skin, theme, getOptions]);

  return (
    <Chart
      key={`${theme}-${skin}`}
      type={type}
      data={chartState.data}
      options={chartState.options}
      width={width}
      height={height}
      style={{ maxHeight: height, ...style }}
    />
  );
};

export default ChartJs;
