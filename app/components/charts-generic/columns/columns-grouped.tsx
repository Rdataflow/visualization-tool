import * as React from "react";
import { useChartState } from "../use-chart-state";
import { ColumnsState } from "./columns-state";

export const ColumnsGrouped = () => {
  const {
    bounds,
    xScale,
    xScaleIn,
    getY,
    yScale,
    getSegment,
    colors,
    grouped
  } = useChartState() as ColumnsState;
  const { margins } = bounds;

  return (
    <g transform={`translate(${margins.left} ${margins.top})`}>
      {grouped.map(segment => (
        <g key={segment[0]} transform={`translate(${xScale(segment[0])}, 0)`}>
          {segment[1].map((d, i) => (
            <Column
              key={i}
              x={xScaleIn(getSegment(d)) as number}
              y={yScale(getY(d))}
              width={xScaleIn.bandwidth()}
              height={yScale(0) - yScale(getY(d))}
              color={colors(getSegment(d))}
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
    height,
    color
  }: {
    x: number;
    y: number;
    width: number;
    height: number;
    color: string;
  }) => {
    return (
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        stroke="none"
        fill={color}
      />
    );
  }
);