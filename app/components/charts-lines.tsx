import React from "react";
import { formatDataForLineChart, getDimensionLabelFromIri } from "../domain";
import { Lines } from "./charts-generic/lines";
import { Dimension, Measure } from "@zazuko/query-rdf-data-cube";

export const ChartLines = ({
  observations,
  dimensions,
  measures,

  xField,
  groupByField,
  heightField,
  aggregationFunction
}: {
  observations: any[];
  dimensions: Dimension[];
  measures: Measure[];

  xField: string;
  groupByField: string;
  heightField: string;
  aggregationFunction: "sum";
}) => {
  const formattedData = formatDataForLineChart({
    observations,
    dimensions,
    measures,

    xField,
    groupByField,
    heightField
  });
  return (
    <Lines
      data={formattedData}
      width={600}
      xField={getDimensionLabelFromIri({ dimensionIri: xField, dimensions })}
      // yField={getDimensionLabelFromIri({
      //   dimensionIri: heightField,
      //   dimensions
      // })}
      yField="measure"
      groupBy={getDimensionLabelFromIri({
        dimensionIri: groupByField,
        dimensions
      })}
      groupByLabel={getDimensionLabelFromIri({
        dimensionIri: groupByField,
        dimensions
      })}
      aggregateFunction={aggregationFunction}
    />
  );
};