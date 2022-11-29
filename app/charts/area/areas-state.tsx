import {
  ascending,
  extent,
  group,
  max,
  min,
  rollup,
  ScaleLinear,
  scaleLinear,
  ScaleOrdinal,
  scaleOrdinal,
  ScaleTime,
  scaleTime,
  stack,
  stackOrderAscending,
  stackOrderDescending,
  stackOrderReverse,
  sum,
} from "d3";
import keyBy from "lodash/keyBy";
import orderBy from "lodash/orderBy";
import { ReactNode, useCallback, useMemo } from "react";

import { LEFT_MARGIN_OFFSET } from "@/charts/area/constants";
import { BRUSH_BOTTOM_SPACE } from "@/charts/shared/brush";
import {
  getLabelWithUnit,
  getWideData,
  stackOffsetDivergingPositiveZeros,
  useOptionalNumericVariable,
  usePlottableData,
  useDataAfterInteractiveFilters,
  useSegment,
  useStringVariable,
  useTemporalVariable,
} from "@/charts/shared/chart-helpers";
import { CommonChartState } from "@/charts/shared/chart-state";
import { TooltipInfo } from "@/charts/shared/interaction/tooltip";
import useChartFormatters from "@/charts/shared/use-chart-formatters";
import { ChartContext, ChartProps } from "@/charts/shared/use-chart-state";
import { InteractionProvider } from "@/charts/shared/use-interaction";
import { Observer, useWidth } from "@/charts/shared/use-width";
import { AreaFields } from "@/configurator";
import { isTemporalDimension, Observation } from "@/domain/data";
import {
  useFormatNumber,
  formatNumberWithUnit,
  useTimeFormatUnit,
} from "@/formatters";
import { DimensionMetadataFragment } from "@/graphql/query-hooks";
import { getPalette } from "@/palettes";
import { sortByIndex } from "@/utils/array";
import { estimateTextWidth } from "@/utils/estimate-text-width";
import {
  getSortingOrders,
  makeDimensionValueSorters,
} from "@/utils/sorting-values";

export interface AreasState extends CommonChartState {
  chartType: "area";
  data: Observation[];
  allData: Observation[];
  preparedData: Observation[];
  getX: (d: Observation) => Date;
  xScale: ScaleTime<number, number>;
  xEntireScale: ScaleTime<number, number>;
  getY: (d: Observation) => number | null;
  yScale: ScaleLinear<number, number>;
  getSegment: (d: Observation) => string;
  getSegmentLabel: (s: string) => string;
  segments: string[];
  colors: ScaleOrdinal<string, string>;
  yAxisLabel: string;
  yAxisDimension: DimensionMetadataFragment;
  chartWideData: ArrayLike<Observation>;
  allDataWide: ArrayLike<Observation>;
  series: $FixMe[];
  getAnnotationInfo: (d: Observation) => TooltipInfo;
}

const useAreasState = (
  chartProps: Pick<
    ChartProps,
    "data" | "dimensions" | "measures" | "interactiveFiltersConfig"
  > & {
    fields: AreaFields;
    aspectRatio: number;
  }
): AreasState => {
  const {
    data,
    fields,
    dimensions,
    measures,
    interactiveFiltersConfig,
    aspectRatio,
  } = chartProps;
  const width = useWidth();
  const formatNumber = useFormatNumber({ decimals: "auto" });
  const estimateNumberWidth = (d: number) => estimateTextWidth(formatNumber(d));
  const timeFormatUnit = useTimeFormatUnit();

  const xDimension = dimensions.find((d) => d.iri === fields.x.componentIri);

  if (!xDimension) {
    throw Error(`No dimension <${fields.x.componentIri}> in cube!`);
  }
  if (!isTemporalDimension(xDimension)) {
    throw Error(`Dimension <${fields.x.componentIri}> is not temporal!`);
  }

  const getX = useTemporalVariable(fields.x.componentIri);
  const getY = useOptionalNumericVariable(fields.y.componentIri);
  const getGroups = useStringVariable(fields.x.componentIri);
  const getSegment = useSegment(fields.segment?.componentIri);

  const { segmentValuesByLabel, segmentValuesByValue } = useMemo(() => {
    const segmentDimension = dimensions.find(
      (d) => d.iri === fields.segment?.componentIri
    ) || { values: [] };
    return {
      segmentValuesByValue: keyBy(segmentDimension.values, (x) => x.value),
      segmentValuesByLabel: keyBy(segmentDimension.values, (x) => x.label),
    };
  }, [dimensions, fields.segment?.componentIri]);

  const getSegmentLabel = useCallback(
    (segment: string): string => {
      return segmentValuesByValue[segment]?.label || segment;
    },
    [segmentValuesByValue]
  );

  const hasSegment = fields.segment;
  const allSegments = useMemo(
    () => [...new Set(data.map((d) => getSegment(d)))],
    [data, getSegment]
  );

  const xKey = fields.x.componentIri;

  // All Data (used for brushing)
  const sortedData = useMemo(
    () =>
      [...data]
        // Always sort by x first (TemporalDimension)
        .sort((a, b) => ascending(getX(a), getX(b))),
    [data, getX]
  );

  const dataGroupedByX = useMemo(
    () => group(data, getGroups),
    [data, getGroups]
  );

  const allDataWide = useMemo(
    () =>
      getWideData({
        dataGroupedByX,
        xKey,
        getY,
        getSegment,
      }),
    [dataGroupedByX, xKey, getY, getSegment]
  );

  const plottableSortedData = usePlottableData({
    data: sortedData,
    plotters: [getX, getY],
  });

  const preparedData = useDataAfterInteractiveFilters({
    sortedData: plottableSortedData,
    interactiveFiltersConfig,
    getX,
    getSegment,
  });

  const chartWideData = useMemo(() => {
    const preparedDataGroupedByX = group(preparedData, getGroups);
    return getWideData({
      dataGroupedByX: preparedDataGroupedByX,
      xKey,
      getY,
      allSegments,
      getSegment,
      imputationType: fields.y.imputationType,
    });
  }, [
    preparedData,
    getGroups,
    xKey,
    getY,
    allSegments,
    getSegment,
    fields.y.imputationType,
  ]);

  const yMeasure = measures.find((d) => d.iri === fields.y.componentIri);

  if (!yMeasure) {
    throw Error(`No dimension <${fields.y.componentIri}> in cube!`);
  }

  const yAxisLabel = getLabelWithUnit(yMeasure);

  /** Ordered segments */
  const segmentSorting = fields.segment?.sorting;
  const segmentSortingType = segmentSorting?.sortingType;
  const segmentSortingOrder = segmentSorting?.sortingOrder;

  const segments = useMemo(() => {
    const totalValueBySegment = Object.fromEntries([
      ...rollup(
        plottableSortedData,
        (v) => sum(v, (x) => getY(x)),
        (x) => getSegment(x)
      ),
    ]);

    const uniqueSegments = Array.from(
      new Set(plottableSortedData.map((d) => getSegment(d)))
    );
    const dimension = dimensions.find(
      (dim) => dim.iri === fields.segment?.componentIri
    );
    const sorters = makeDimensionValueSorters(dimension, {
      sorting: segmentSorting,
      sumsBySegment: totalValueBySegment,
    });
    return orderBy(
      uniqueSegments,
      sorters,
      getSortingOrders(sorters, segmentSorting)
    );
  }, [
    plottableSortedData,
    dimensions,
    segmentSorting,
    getY,
    getSegment,
    fields.segment?.componentIri,
  ]);

  /** Transform data  */
  const series = useMemo(() => {
    const stackOrder =
      segmentSortingType === "byTotalSize" && segmentSortingOrder === "asc"
        ? stackOrderAscending
        : segmentSortingType === "byTotalSize" && segmentSortingOrder === "desc"
        ? stackOrderDescending
        : stackOrderReverse;

    const stacked = stack()
      .order(stackOrder)
      .offset(stackOffsetDivergingPositiveZeros)
      .keys(segments);
    return stacked(chartWideData as { [key: string]: number }[]);
  }, [chartWideData, segmentSortingOrder, segmentSortingType, segments]);

  /** Scales */
  const entireMaxTotalValue = max<$FixMe>(
    allDataWide,
    (d) => d.total ?? 0
  ) as unknown as number;

  const { colors, xScale, yScale, xEntireScale } = useMemo(() => {
    const minTotal = min(series, (d) => min(d, (d) => d[0])) ?? 0;
    const maxTotal = max(series, (d) => max(d, (d) => d[1])) ?? NaN;
    const yDomain = [minTotal, maxTotal];
    const xDomain = extent(preparedData, (d) => getX(d)) as [Date, Date];
    const xScale = scaleTime().domain(xDomain);

    const xEntireDomain = extent(plottableSortedData, (d) => getX(d)) as [
      Date,
      Date
    ];
    const xEntireScale = scaleTime().domain(xEntireDomain);
    const yScale = scaleLinear().domain(yDomain).nice();
    const colors = scaleOrdinal<string, string>();
    const segmentDimension = dimensions.find(
      (d) => d.iri === fields.segment?.componentIri
    ) as $FixMe;

    if (fields.segment && segmentDimension && fields.segment.colorMapping) {
      const orderedSegmentLabelsAndColors = segments.map((segment) => {
        const dvIri =
          segmentValuesByLabel[segment]?.value ||
          segmentValuesByValue[segment]?.value;

        return {
          label: segment,
          color: fields.segment?.colorMapping![dvIri] || "#006699",
        };
      });

      colors.domain(orderedSegmentLabelsAndColors.map((s) => s.label));
      colors.range(orderedSegmentLabelsAndColors.map((s) => s.color));
      colors.unknown(() => undefined);
    } else {
      colors.domain(segments);
      colors.range(getPalette(fields.segment?.palette));
      colors.unknown(() => undefined);
    }
    return { colors, xScale, yScale, xEntireScale };
  }, [
    dimensions,
    fields.segment,
    getX,
    plottableSortedData,
    preparedData,
    segmentValuesByLabel,
    segmentValuesByValue,
    segments,
    series,
  ]);

  /** Dimensions */
  const [yMin, yMax] = yScale.domain();
  const left = interactiveFiltersConfig?.timeRange.active
    ? estimateNumberWidth(entireMaxTotalValue)
    : Math.max(estimateNumberWidth(yMin), estimateNumberWidth(yMax));
  const bottom = interactiveFiltersConfig?.timeRange.active
    ? BRUSH_BOTTOM_SPACE
    : 40;

  const margins = {
    top: 50,
    right: 40,
    bottom,
    left: left + LEFT_MARGIN_OFFSET,
  };
  const chartWidth = width - margins.left - margins.right;
  const chartHeight = chartWidth * aspectRatio;
  const bounds = {
    width,
    height: chartHeight + margins.top + margins.bottom,
    margins,
    chartWidth,
    chartHeight,
  };

  /** Adjust scales according to dimensions */
  xScale.range([0, chartWidth]);
  xEntireScale.range([0, chartWidth]);
  yScale.range([chartHeight, 0]);

  const formatters = useChartFormatters(chartProps);

  /** Tooltip */
  const getAnnotationInfo = (datum: Observation): TooltipInfo => {
    const xAnchor = xScale(getX(datum));

    const tooltipValues = preparedData.filter(
      (j) => getX(j).getTime() === getX(datum).getTime()
    );
    const sortedTooltipValues = sortByIndex({
      data: tooltipValues,
      order: segments,
      getCategory: getSegment,
      sortOrder: "asc",
    });

    const yAnchor = 0;
    const xPlacement = "center";
    const yPlacement = "top";
    const yValueFormatter = (value: number | null) =>
      formatNumberWithUnit(
        value,
        formatters[yMeasure.iri] || formatNumber,
        yMeasure.unit
      );

    return {
      xAnchor,
      yAnchor,
      placement: { x: xPlacement, y: yPlacement },
      xValue: timeFormatUnit(getX(datum), xDimension.timeUnit),
      datum: {
        label: hasSegment ? getSegment(datum) : undefined,
        value: yValueFormatter(getY(datum)),
        color: colors(getSegment(datum)) as string,
      },
      values: hasSegment
        ? sortedTooltipValues.map((td) => ({
            label: getSegment(td),
            value: yValueFormatter(getY(td)),
            color: colors(getSegment(td)) as string,
          }))
        : undefined,
    };
  };

  return {
    chartType: "area",
    bounds,
    data,
    allData: plottableSortedData,
    preparedData,
    getX,
    xScale,
    xEntireScale,
    getY,
    yScale,
    getSegment,
    yAxisLabel,
    yAxisDimension: yMeasure,
    segments,
    colors,
    chartWideData,
    allDataWide,
    series,
    getAnnotationInfo,
    getSegmentLabel,
  };
};

const AreaChartProvider = ({
  data,
  fields,
  measures,
  dimensions,
  interactiveFiltersConfig,
  aspectRatio,
  children,
}: Pick<
  ChartProps,
  "data" | "fields" | "dimensions" | "measures" | "interactiveFiltersConfig"
> & {
  children: ReactNode;
  aspectRatio: number;
} & { fields: AreaFields }) => {
  const state = useAreasState({
    data,
    fields,
    dimensions,
    measures,
    interactiveFiltersConfig,
    aspectRatio,
  });
  return (
    <ChartContext.Provider value={state}>{children}</ChartContext.Provider>
  );
};

export const AreaChart = ({
  data,
  fields,
  measures,
  dimensions,
  interactiveFiltersConfig,
  aspectRatio,
  children,
}: Pick<
  ChartProps,
  "data" | "fields" | "dimensions" | "measures" | "interactiveFiltersConfig"
> & {
  children: ReactNode;
  fields: AreaFields;
  aspectRatio: number;
}) => {
  return (
    <Observer>
      <InteractionProvider>
        <AreaChartProvider
          data={data}
          fields={fields}
          dimensions={dimensions}
          measures={measures}
          interactiveFiltersConfig={interactiveFiltersConfig}
          aspectRatio={aspectRatio}
        >
          {children}
        </AreaChartProvider>
      </InteractionProvider>
    </Observer>
  );
};
