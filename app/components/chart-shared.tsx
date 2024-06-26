import { Box } from "@mui/material";
import { ComponentProps } from "react";

import {
  ChartDataFiltersList,
  ChartDataFiltersToggle,
  useChartDataFiltersState,
} from "@/charts/shared/chart-data-filters";
import { MetadataPanel } from "@/components/metadata-panel";
import { ChartConfig, DataSource } from "@/configurator";

export const ChartControls = ({
  dataSource,
  chartConfig,
  metadataPanelProps,
}: {
  dataSource: DataSource;
  chartConfig: ChartConfig;
  metadataPanelProps: Omit<
    ComponentProps<typeof MetadataPanel>,
    "dataSource" | "chartConfigs"
  >;
}) => {
  const showFilters = chartConfig.interactiveFiltersConfig?.dataFilters.active;
  const chartFiltersState = useChartDataFiltersState({
    dataSource,
    chartConfig,
  });
  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateAreas: `
    "filtersToggle metadataToggle"
    "filtersList filtersList"`,
        mt: 4,
      }}
    >
      <Box sx={{ gridArea: "filtersToggle" }}>
        {showFilters && <ChartDataFiltersToggle {...chartFiltersState} />}
      </Box>
      <Box
        sx={{
          display: "flex",
          justifyContent: "flex-end",
          gridArea: "metadataToggle",
        }}
      >
        <MetadataPanel
          dataSource={dataSource}
          chartConfigs={[chartConfig]}
          {...metadataPanelProps}
        />
      </Box>
      <Box sx={{ gridArea: "filtersList" }}>
        {showFilters && <ChartDataFiltersList {...chartFiltersState} />}
      </Box>
    </Box>
  );
};
