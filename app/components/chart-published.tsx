import { Flex, Text } from "rebass";
import { ChartAreasVisualization } from "./chart-areas";
import { ChartColumnsVisualization } from "./chart-columns";
import { ChartFootnotes } from "./chart-footnotes";
import { ChartLinesVisualization } from "./chart-lines";
import { ChartScatterplotVisualization } from "./chart-scatterplot";
import {
  AttributeWithMeta,
  DimensionWithMeta,
  useDataSetAndMetadata
} from "../domain";
import { ChartConfig, Meta } from "../domain/config-types";
import { useLocale } from "../lib/use-locale";

export const ChartPublished = ({
  dataSet,
  meta,
  chartConfig
}: {
  dataSet: string;
  meta: Meta;
  chartConfig: ChartConfig;
}) => {
  const { data: metaData } = useDataSetAndMetadata(dataSet);
  const locale = useLocale();

  return metaData ? (
    <Flex
      p={5}
      flexDirection="column"
      justifyContent="space-between"
      sx={{ height: "100%", color: "monochrome.800" }}
    >
      <Text variant="heading2" mb={2}>
        {meta.title[locale] === ""
          ? metaData.dataSet.label.value
          : meta.title[locale]}
      </Text>
      <Text variant="paragraph1" mb={2}>
        {meta.description[locale] === ""
          ? metaData.dataSet.extraMetadata.get("description")!.value
          : meta.description[locale]}
      </Text>
      {chartConfig.chartType === "column" && (
        <ChartColumnsVisualization
          dataSet={metaData.dataSet}
          dimensions={metaData.dimensions}
          measures={metaData.measures}
          chartConfig={chartConfig}
        />
      )}
      {chartConfig.chartType === "line" && (
        <ChartLinesVisualization
          dataSet={metaData.dataSet}
          dimensions={metaData.dimensions}
          measures={metaData.measures}
          chartConfig={chartConfig}
        />
      )}
      {chartConfig.chartType === "area" && (
        <ChartAreasVisualization
          dataSet={metaData.dataSet}
          dimensions={metaData.dimensions}
          measures={metaData.measures}
          chartConfig={chartConfig}
        />
      )}
      {chartConfig.chartType === "scatterplot" && (
        <ChartScatterplotVisualization
          dataSet={metaData.dataSet}
          dimensions={metaData.dimensions}
          measures={metaData.measures}
          chartConfig={chartConfig}
        />
      )}
      <ChartFootnotes
        source={metaData.dataSet.extraMetadata.get("contact")!.value} // FIXME: use "source" instead of "contact" when the API is fixed
        dataSetName={metaData.dataSet.label.value}
        filters={chartConfig.filters}
        componentsByIri={
          metaData.componentsByIri as Record<
            string,
            DimensionWithMeta | AttributeWithMeta
          >
        }
      />
    </Flex>
  ) : null;
};