import { Box, Theme, Typography } from "@mui/material";
import { makeStyles } from "@mui/styles";
import {
  axisBottom,
  NumberValue,
  range,
  ScaleLinear,
  scaleLinear,
  ScaleQuantile,
  ScaleQuantize,
  ScaleThreshold,
  select,
  Selection,
} from "d3";
import React, { useEffect, useMemo, useRef } from "react";

import { MapState } from "@/charts/map/map-state";
import { convertRgbArrayToHex } from "@/charts/shared/colors";
import { MapLegendColor } from "@/charts/shared/legend-color";
import { useChartState } from "@/charts/shared/use-chart-state";
import { useChartTheme } from "@/charts/shared/use-chart-theme";
import { useInteraction } from "@/charts/shared/use-interaction";
import { useWidth } from "@/charts/shared/use-width";
import Flex from "@/components/flex";
import { ColorRamp } from "@/configurator/components/chart-controls/color-ramp";
import {
  getColorInterpolator,
  useDimensionFormatters,
  useFormatInteger,
} from "@/configurator/components/ui-helpers";
import { Observation } from "@/domain/data";
import { truthy } from "@/domain/types";

const MAX_WIDTH = 204;
const HEIGHT = 80;
const COLOR_RAMP_HEIGHT = 10;
const MARGIN = { top: 6, right: 4, bottom: 0, left: 4 };

const useLegendWidth = () => Math.min(useWidth(), MAX_WIDTH);

const makeAxis = (
  g: Selection<SVGGElement, unknown, null, undefined>,
  {
    axisLabelColor,
    fontFamily,
    formatNumber,
    labelColor,
    legendFontSize,
    scale,
    thresholds,
  }: {
    axisLabelColor: string;
    fontFamily: string;
    formatNumber: (x: NumberValue | undefined | null) => string;
    labelColor: string;
    legendFontSize: number;
    scale: ScaleLinear<number, number, number>;
    thresholds: number[];
  }
) => {
  g.call(
    axisBottom(scale)
      .tickValues(thresholds)
      .tickSizeInner(-COLOR_RAMP_HEIGHT)
      .tickFormat(formatNumber)
  );
  g.select("path.domain").remove();
  g.selectAll(".tick line").attr("stroke", axisLabelColor);
  g.selectAll(".tick text")
    .attr("font-size", legendFontSize)
    .attr("font-family", fontFamily)
    .attr("fill", labelColor)
    .attr("transform", "rotate(45)")
    .attr("text-anchor", "start");
};

export const MapLegend = () => {
  const { areaLayer, symbolLayer } = useChartState() as MapState;
  const showAreaLegend =
    areaLayer &&
    areaLayer.data.length >= 3 &&
    (areaLayer.colorScaleInterpolationType === "linear" ||
      areaLayer.colorScale.range().length >= 3);
  const measureDimensions = [
    areaLayer?.measureDimension,
    symbolLayer?.measureDimension,
    symbolLayer?.colors.type === "continuous"
      ? symbolLayer.colors.component
      : undefined,
  ].filter(truthy);
  const formatters = useDimensionFormatters(measureDimensions);

  return (
    <>
      <Flex sx={{ minHeight: 100, flexWrap: "wrap", gap: 4, mt: 4 }}>
        {areaLayer && showAreaLegend && (
          <Box>
            {areaLayer.measureLabel && (
              <Typography
                component="div"
                variant="caption"
                sx={{ marginLeft: `${MARGIN.left}px` }}
              >
                {areaLayer.measureLabel}
              </Typography>
            )}
            {areaLayer.colorScaleInterpolationType === "linear" ? (
              <ContinuousColorLegend
                palette={areaLayer.palette}
                domain={areaLayer.dataDomain}
                getValue={areaLayer.getValue}
                valueFormatter={formatters[areaLayer.measureDimension!.iri]}
              />
            ) : areaLayer.colorScaleInterpolationType === "quantize" ? (
              <QuantizeColorLegend
                colorScale={areaLayer.colorScale as ScaleQuantize<string>}
                domain={areaLayer.dataDomain}
                getValue={areaLayer.getValue}
              />
            ) : areaLayer.colorScaleInterpolationType === "quantile" ? (
              <QuantileColorLegend
                colorScale={areaLayer.colorScale as ScaleQuantile<string>}
                domain={areaLayer.dataDomain}
                getValue={areaLayer.getValue}
              />
            ) : areaLayer.colorScaleInterpolationType === "jenks" ? (
              <JenksColorLegend
                colorScale={
                  areaLayer.colorScale as ScaleThreshold<number, string>
                }
                domain={areaLayer.dataDomain}
                getValue={areaLayer.getValue}
              />
            ) : null}
          </Box>
        )}

        {symbolLayer && (
          <Flex sx={{ gap: 4 }}>
            {symbolLayer.colors.type === "continuous" && (
              <Box>
                <Typography component="div" variant="caption">
                  {symbolLayer.colors.component.label}
                </Typography>
                {symbolLayer.colors.interpolationType === "linear" ? (
                  <ContinuousColorLegend
                    palette={symbolLayer.colors.palette}
                    domain={symbolLayer.colors.domain}
                    getValue={(d: Observation) => {
                      // @ts-ignore
                      return d[symbolLayer.colors.component.iri] as number;
                    }}
                    valueFormatter={
                      formatters[symbolLayer.colors.component.iri]
                    }
                  />
                ) : symbolLayer.colors.interpolationType === "quantize" ? (
                  <QuantizeColorLegend
                    colorScale={
                      symbolLayer.colors.scale as ScaleQuantize<string>
                    }
                    domain={symbolLayer.colors.domain}
                    getValue={symbolLayer.colors.getValue}
                  />
                ) : symbolLayer.colors.interpolationType === "quantile" ? (
                  <QuantileColorLegend
                    colorScale={
                      symbolLayer.colors.scale as ScaleQuantile<string>
                    }
                    domain={symbolLayer.colors.domain}
                    getValue={symbolLayer.colors.getValue}
                  />
                ) : symbolLayer.colors.interpolationType === "jenks" ? (
                  <JenksColorLegend
                    colorScale={
                      symbolLayer.colors.scale as ScaleThreshold<number, string>
                    }
                    domain={symbolLayer.colors.domain}
                    getValue={symbolLayer.colors.getValue}
                  />
                ) : null}
              </Box>
            )}
            <Box>
              <Typography component="div" variant="caption">
                {symbolLayer.measureLabel}
              </Typography>
              <CircleLegend
                valueFormatter={formatters[symbolLayer.measureDimension!.iri]}
              />
            </Box>
          </Flex>
        )}
      </Flex>

      {symbolLayer?.colors.type === "categorical" && (
        <MapLegendColor
          component={symbolLayer.colors.component}
          getColor={symbolLayer.colors.getColor}
        />
      )}
    </>
  );
};

interface CircleProps {
  value: string;
  label: string;
  fill?: string;
  stroke: string;
  radius: number;
  maxRadius: number;
  fontSize: number;
  showLine?: boolean;
}

const Circle = (props: CircleProps) => {
  const {
    value,
    label,
    fill,
    stroke,
    radius,
    maxRadius,
    fontSize,
    showLine = true,
  } = props;

  return (
    <g transform={`translate(0, ${maxRadius - radius})`}>
      <circle
        cx={0}
        cy={0}
        r={radius}
        fill={fill}
        stroke={stroke}
        fillOpacity={0.1}
      />
      {showLine && (
        <>
          <line
            x1={0}
            y1={-radius}
            x2={maxRadius + 4}
            y2={-radius}
            stroke={stroke}
          />
          <text
            x={maxRadius + 6}
            y={-radius}
            dy={5}
            fill={stroke}
            textAnchor="start"
            fontSize={fontSize}
          >
            {value} {label}
          </text>
        </>
      )}
    </g>
  );
};

const CircleLegend = ({
  valueFormatter,
}: {
  valueFormatter: (d: Observation[string]) => string;
}) => {
  const width = useLegendWidth();

  const [{ interaction }] = useInteraction();
  const { axisLabelColor, legendFontSize } = useChartTheme();
  const { symbolLayer } = useChartState() as MapState;
  const {
    data,
    dataDomain,
    getLabel,
    getValue,
    colors: { getColor },
    radiusScale,
  } = symbolLayer as NonNullable<MapState["symbolLayer"]>;

  const maybeValue = interaction.d && getValue(interaction.d);
  const value = typeof maybeValue === "number" ? maybeValue : undefined;

  const radius = value && radiusScale(value);
  const maxRadius = radiusScale.range()[1];

  const color = interaction.d
    ? convertRgbArrayToHex(getColor(interaction.d))
    : undefined;

  const domainObservations = useMemo(
    () => dataDomain.map((d) => data.find((x) => getValue(x) === d)),
    [data, dataDomain, getValue]
  ) as [Observation | undefined, Observation | undefined];

  return (
    <svg width={width} height={HEIGHT}>
      <g
        transform={`translate(${MARGIN.left + maxRadius}, ${
          MARGIN.top + maxRadius
        })`}
      >
        {dataDomain.map((d, i) => {
          const observation = domainObservations[i];

          if (observation) {
            const label = getLabel(observation);
            const radius = radiusScale(d);

            return (
              <Circle
                key={i}
                value={valueFormatter(d)}
                label={label}
                fill="none"
                stroke={axisLabelColor}
                radius={radius}
                maxRadius={maxRadius}
                fontSize={legendFontSize}
                showLine={!interaction.visible}
              />
            );
          }
        })}

        {/* Hovered data point indicator */}
        {interaction.d &&
          interaction.visible &&
          value !== undefined &&
          radius !== undefined &&
          color !== undefined && (
            <Circle
              value={valueFormatter(value)}
              label={getLabel(interaction.d)}
              fill={color}
              stroke={axisLabelColor}
              radius={radius}
              maxRadius={maxRadius}
              fontSize={legendFontSize}
            />
          )}
      </g>
    </svg>
  );
};

const JenksColorLegend = ({
  colorScale,
  domain,
  getValue,
}: {
  colorScale: ScaleThreshold<number, string>;
  domain: [number, number];
  getValue: (d: Observation) => number | null;
}) => {
  const width = useLegendWidth();
  const legendAxisRef = useRef<SVGGElement>(null);

  const { axisLabelColor, labelColor, fontFamily, legendFontSize } =
    useChartTheme();
  const formatNumber = useFormatInteger();
  const thresholds = useMemo(
    () => (colorScale.domain ? colorScale.domain() : []),
    [colorScale]
  );

  const [min, max] = domain;

  // From color index to threshold value
  const thresholdsScale = scaleLinear()
    .domain(range(colorScale.range().length + 1))
    .range([min || 0, ...thresholds, max || 100]);

  // From threshold value to pixel value
  const scale = scaleLinear()
    .domain([min || 0, max || 10000])
    .range([MARGIN.left, width - MARGIN.right]);

  const tickValues = thresholds.splice(0, thresholds.length - 1);

  useEffect(
    () =>
      makeAxis(select(legendAxisRef.current) as any, {
        axisLabelColor,
        fontFamily,
        formatNumber,
        labelColor,
        legendFontSize,
        scale,
        thresholds: tickValues,
      }),
    [
      axisLabelColor,
      fontFamily,
      formatNumber,
      labelColor,
      legendFontSize,
      scale,
      tickValues,
    ]
  );

  return (
    <svg width={width} height={HEIGHT}>
      <g>
        <DataPointIndicator scale={scale} getValue={getValue} />
      </g>
      <g transform={`translate(0, ${MARGIN.top})`}>
        {(colorScale as ScaleThreshold<number, string>).range().map((c, i) => {
          return (
            <rect
              key={i}
              x={scale(thresholdsScale(i))}
              y={0}
              width={scale(thresholdsScale(i + 1)) - scale(thresholdsScale(i))}
              height={COLOR_RAMP_HEIGHT}
              fill={c}
            />
          );
        })}
      </g>
      <g
        ref={legendAxisRef}
        key="legend-axis"
        transform={`translate(0, ${COLOR_RAMP_HEIGHT + MARGIN.top})`}
      />
    </svg>
  );
};

const QuantileColorLegend = ({
  colorScale,
  domain,
  getValue,
}: {
  colorScale: ScaleQuantile<string>;
  domain: [number, number];
  getValue: (d: Observation) => number | null;
}) => {
  const width = useLegendWidth();
  const legendAxisRef = useRef<SVGGElement>(null);

  const { axisLabelColor, labelColor, fontFamily, legendFontSize } =
    useChartTheme();
  const formatNumber = useFormatInteger();

  const thresholds = useMemo(
    // @ts-ignore
    () => (colorScale.quantiles ? colorScale.quantiles() : []),
    [colorScale]
  );

  const [min, max] = domain;

  // From color index to threshold value
  const thresholdsScale = scaleLinear()
    .domain(range(colorScale.range().length + 1))
    .range([min, ...thresholds, max]);

  // From threshold value to pixel value
  const scale = scaleLinear()
    .domain([min || 0, max || 10000])
    .range([MARGIN.left, width - MARGIN.right]);

  useEffect(
    () =>
      makeAxis(select(legendAxisRef.current) as any, {
        axisLabelColor,
        fontFamily,
        formatNumber,
        labelColor,
        legendFontSize,
        scale,
        thresholds,
      }),
    [
      axisLabelColor,
      fontFamily,
      formatNumber,
      labelColor,
      legendFontSize,
      scale,
      thresholds,
    ]
  );

  return (
    <svg width={width} height={HEIGHT}>
      <g>
        <DataPointIndicator scale={scale} getValue={getValue} />
      </g>
      <g transform={`translate(0, ${MARGIN.top})`}>
        {(colorScale as ScaleQuantile<string>).range().map((c, i) => {
          return (
            <rect
              key={i}
              x={scale(thresholdsScale(i))}
              y={0}
              width={scale(thresholdsScale(i + 1)) - scale(thresholdsScale(i))}
              height={COLOR_RAMP_HEIGHT}
              fill={c}
            />
          );
        })}
      </g>
      <g
        ref={legendAxisRef}
        key="legend-axis"
        transform={`translate(0, ${COLOR_RAMP_HEIGHT + MARGIN.top})`}
      />
    </svg>
  );
};

const QuantizeColorLegend = ({
  colorScale,
  domain,
  getValue,
}: {
  colorScale: ScaleQuantize<string>;
  domain: [number, number];
  getValue: (d: Observation) => number | null;
}) => {
  const width = useLegendWidth();
  const legendAxisRef = useRef<SVGGElement>(null);

  const { axisLabelColor, labelColor, fontFamily, legendFontSize } =
    useChartTheme();
  const formatNumber = useFormatInteger();

  const classesScale = scaleLinear()
    .domain([0, colorScale.range().length])
    .range([MARGIN.left, width - MARGIN.right]);

  const scale = scaleLinear()
    .domain(domain)
    .range([MARGIN.left, width - MARGIN.right]);

  const thresholds = useMemo(
    // @ts-ignore
    () => (colorScale.thresholds ? colorScale.thresholds() : []),
    [colorScale]
  );

  useEffect(
    () =>
      makeAxis(select(legendAxisRef.current) as any, {
        axisLabelColor,
        fontFamily,
        formatNumber,
        labelColor,
        legendFontSize,
        scale,
        thresholds,
      }),
    [
      axisLabelColor,
      fontFamily,
      formatNumber,
      labelColor,
      legendFontSize,
      scale,
      thresholds,
    ]
  );

  return (
    <svg width={width} height={HEIGHT}>
      <g>
        <DataPointIndicator scale={scale} getValue={getValue} />
      </g>
      <g transform={`translate(0, ${MARGIN.top})`}>
        {(colorScale as ScaleQuantize<string>).range().map((c, i) => (
          <rect
            key={i}
            x={classesScale(i)}
            width={
              (width - MARGIN.left - MARGIN.right) / colorScale.range().length
            }
            height={COLOR_RAMP_HEIGHT}
            fill={c}
          />
        ))}
      </g>
      <g
        ref={legendAxisRef}
        key="legend-axis"
        transform={`translate(0, ${COLOR_RAMP_HEIGHT + MARGIN.top})`}
      />
    </svg>
  );
};

const ContinuousColorLegend = ({
  palette,
  domain,
  getValue,
  valueFormatter,
}: {
  palette: string;
  domain: [number, number];
  getValue: (d: Observation) => number | null;
  valueFormatter: (v: Observation[string]) => string;
}) => {
  const width = useLegendWidth();
  const { legendLabelColor, labelFontSize, fontFamily } = useChartTheme();
  const scale = scaleLinear()
    .domain(domain)
    .range([MARGIN.left, width - MARGIN.right]);
  const [min, max] = domain;

  return (
    <svg width={width} height={HEIGHT}>
      <g>
        <DataPointIndicator scale={scale} getValue={getValue} />
      </g>
      <foreignObject
        x={MARGIN.left}
        y={1} // needed to align with other legends, not sure why
        width={width - MARGIN.left - MARGIN.right}
        height={COLOR_RAMP_HEIGHT}
      >
        <ColorRamp
          width={width - MARGIN.left - MARGIN.right}
          height={COLOR_RAMP_HEIGHT}
          colorInterpolator={getColorInterpolator(palette as any)}
          nbClass={width - MARGIN.left - MARGIN.right}
        />
      </foreignObject>
      <g
        transform={`translate(${MARGIN.left}, ${
          MARGIN.top + COLOR_RAMP_HEIGHT + 14
        })`}
        fontFamily={fontFamily}
        fontSize={labelFontSize}
        fill={legendLabelColor}
      >
        <text textAnchor="start" fontSize={labelFontSize}>
          {valueFormatter(min)}
        </text>
        <text x={width - MARGIN.right - MARGIN.left} textAnchor="end">
          {valueFormatter(max)}
        </text>
      </g>
    </svg>
  );
};

const useDataPointIndicatorStyles = makeStyles((theme: Theme) => ({
  root: {
    transition: `transform ${theme.transitions.duration.shorter}ms ease`,
  },
}));

const DataPointIndicator = ({
  scale,
  getValue,
}: {
  scale: ScaleLinear<number, number>;
  getValue: (d: Observation) => number | null;
}) => {
  const [state] = useInteraction();
  const { labelColor } = useChartTheme();
  const classes = useDataPointIndicatorStyles();
  return (
    <>
      {state.interaction.d &&
        state.interaction.visible &&
        !isNaN(getValue(state.interaction.d) ?? NaN) && (
          <polygon
            fill={labelColor}
            points="-4,0 4,0 0,4"
            className={classes.root}
            style={{
              transform: `translate(${scale(
                getValue(state.interaction.d) ?? 0
              )}px, 0)`,
            }}
          />
        )}
    </>
  );
};
