import { Dimension, Measure } from "@zazuko/query-rdf-data-cube";
import React from "react";
import { formatDataForBarChart, getDimensionLabelFromIri } from "../domain";
import { Bars } from "./charts-generic/bars";

export const ChartBars = ({
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
  const formattedData = formatDataForBarChart({
    observations,
    dimensions,
    measures,
    xField,
    groupByField,
    heightField
  });

  return (
    <Bars
      data={formattedData}
      width={600}
      xField={getDimensionLabelFromIri({ dimensionIri: xField, dimensions })}
      // heightField={getDimensionLabelFromIri({
      //   dimensionIri: heightField,
      //   dimensions
      // })}
      heightField="measure"
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