import * as React from "react";
import { useChartState } from "../use-chart-state";
import { ColumnsState } from "./columns-state";

export const ColumnsStacked = () => {
  const {
    bounds,
    getX,
    xScale,
    yStackScale,
    colors,
    series
  } = useChartState() as ColumnsState;
  const { margins } = bounds;

  return (
    <g transform={`translate(${margins.left} ${margins.top})`}>
      {series.map(sv => (
        <g key={sv.key} fill={colors(sv.key)} data-n={sv.key}>
          {sv.map((segment: $FixMe, i: number) => (
            <Column
              key={`${segment.key}-${i}`}
              x={xScale(getX(segment.data)) as number}
              y={yStackScale(segment[1])}
              width={xScale.bandwidth()}
              height={yStackScale(segment[0]) - yStackScale(segment[1])}
            />
          ))}
        </g>
      ))}
    </g>
  );
};

const Column = React.memo(
  ({
    x,
    y,
    width,
    height
  }: {
    x: number;
    y: number;
    width: number;
    height: number;
  }) => {
    return <rect x={x} y={y} width={width} height={height} stroke="none" />;
  }
);