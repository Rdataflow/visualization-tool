import { Trans } from "@lingui/macro";
import { Box, Theme, Typography } from "@mui/material";
import { makeStyles } from "@mui/styles";
import Head from "next/head";
import * as React from "react";
import { useMemo } from "react";

import { ChartDataFilters } from "@/charts/shared/chart-data-filters";
import { useQueryFilters } from "@/charts/shared/chart-helpers";
import { InteractiveFiltersProvider } from "@/charts/shared/use-interactive-filters";
import useSyncInteractiveFilters from "@/charts/shared/use-sync-interactive-filters";
import { ChartErrorBoundary } from "@/components/chart-error-boundary";
import { ChartFiltersList } from "@/components/chart-filters-list";
import { ChartFootnotes } from "@/components/chart-footnotes";
import {
  ChartTablePreviewProvider,
  useChartTablePreview,
} from "@/components/chart-table-preview";
import GenericChart from "@/components/common-chart";
import DebugPanel from "@/components/debug-panel";
import Flex from "@/components/flex";
import { HintYellow } from "@/components/hint";
import { MetadataPanel } from "@/components/metadata-panel";
import { ChartConfig, DataSource, useConfiguratorState } from "@/configurator";
import { DataSetTable } from "@/configurator/components/datatable";
import { flag } from "@/configurator/components/flag";
import {
  DimensionMetadataFragment,
  useDataCubeMetadataWithComponentValuesQuery,
} from "@/graphql/query-hooks";
import { DataCubePublicationStatus } from "@/graphql/resolver-types";
import { useLocale } from "@/locales/use-locale";
import useEvent from "@/utils/use-event";

export const ChartPreview = ({
  dataSetIri,
  dataSource,
}: {
  dataSetIri: string;
  dataSource: DataSource;
}) => {
  return (
    <ChartTablePreviewProvider>
      <ChartPreviewInner dataSetIri={dataSetIri} dataSource={dataSource} />
    </ChartTablePreviewProvider>
  );
};

const useStyles = makeStyles<Theme>({
  title: {
    marginBottom: 2,
    cursor: "pointer",
    "&:hover": {
      textDecoration: "underline",
    },
  },
  description: {
    marginBottom: 2,
    cursor: "pointer",
    "&:hover": {
      textDecoration: "underline",
    },
  },
});

export const ChartPreviewInner = ({
  dataSetIri,
  dataSource,
}: {
  dataSetIri: string;
  dataSource: DataSource;
}) => {
  const [state, dispatch] = useConfiguratorState();
  const locale = useLocale();
  const classes = useStyles();
  const [{ data: metaData }] = useDataCubeMetadataWithComponentValuesQuery({
    variables: {
      iri: dataSetIri,
      sourceType: dataSource.type,
      sourceUrl: dataSource.url,
      locale,
    },
  });
  const {
    state: isTablePreview,
    setState: setIsTablePreview,
    containerRef,
    containerHeight,
  } = useChartTablePreview();

  const handleToggleTableView = useEvent(() => setIsTablePreview((c) => !c));

  const allDimensions: DimensionMetadataFragment[] = useMemo(() => {
    return [
      ...(metaData?.dataCubeByIri?.dimensions ?? []),
      ...(metaData?.dataCubeByIri?.measures ?? []),
    ];
  }, [metaData?.dataCubeByIri?.dimensions, metaData?.dataCubeByIri?.measures]);

  return (
    <Flex
      sx={{
        flexDirection: "column",
        justifyContent: "space-between",
        flexGrow: 1,
        color: "grey.800",
        p: 5,
        width: "100%",
      }}
    >
      <ChartErrorBoundary resetKeys={[state]}>
        {metaData?.dataCubeByIri?.publicationStatus ===
          DataCubePublicationStatus.Draft && (
          <Box sx={{ mb: 4 }}>
            <HintYellow iconName="datasetError" iconSize={64}>
              <Trans id="dataset.publicationStatus.draft.warning">
                Careful, this dataset is only a draft.
                <br />
                <strong>Don&apos;t use for reporting!</strong>
              </Trans>
            </HintYellow>
          </Box>
        )}
        {(state.state === "CONFIGURING_CHART" ||
          state.state === "PUBLISHING") && (
          <>
            <>
              <Flex
                sx={{
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                }}
              >
                <Typography
                  variant="h2"
                  sx={{
                    color:
                      state.meta.title[locale] === "" ? "grey.500" : "text",
                  }}
                  className={classes.title}
                  onClick={() =>
                    dispatch({
                      type: "ACTIVE_FIELD_CHANGED",
                      value: "title",
                    })
                  }
                >
                  {state.meta.title[locale] === "" ? (
                    <Trans id="annotation.add.title">[ Title ]</Trans>
                  ) : (
                    state.meta.title[locale]
                  )}
                </Typography>

                {flag("metadata") && (
                  <MetadataPanel
                    datasetIri={dataSetIri}
                    dataSource={dataSource}
                    dimensions={allDimensions}
                    top={96}
                  />
                )}
              </Flex>
              <Head>
                <title key="title">
                  {state.meta.title[locale] === ""
                    ? metaData?.dataCubeByIri?.title
                    : state.meta.title[locale]}{" "}
                  - visualize.admin.ch
                </title>
              </Head>
              <Typography
                variant="body1"
                className={classes.description}
                sx={{
                  color:
                    state.meta.description[locale] === "" ? "grey.500" : "text",
                }}
                onClick={() =>
                  dispatch({
                    type: "ACTIVE_FIELD_CHANGED",
                    value: "description",
                  })
                }
              >
                {state.meta.description[locale] === "" ? (
                  <Trans id="annotation.add.description">[ Description ]</Trans>
                ) : (
                  state.meta.description[locale]
                )}
              </Typography>
            </>
            <InteractiveFiltersProvider>
              <Box ref={containerRef} height={containerHeight.current!}>
                {isTablePreview ? (
                  <DataSetTable
                    sx={{
                      width: "100%",
                      maxHeight: "100%",
                    }}
                    dataSetIri={dataSetIri}
                    dataSource={dataSource}
                    chartConfig={state.chartConfig}
                  />
                ) : (
                  <ChartWithInteractiveFilters
                    dataSet={dataSetIri}
                    dataSource={dataSource}
                    chartConfig={state.chartConfig}
                  />
                )}
              </Box>
              {state.chartConfig && (
                <ChartFootnotes
                  dataSetIri={dataSetIri}
                  dataSource={dataSource}
                  chartConfig={state.chartConfig}
                  onToggleTableView={handleToggleTableView}
                />
              )}
              <DebugPanel configurator={true} interactiveFilters={true} />
            </InteractiveFiltersProvider>
          </>
        )}
      </ChartErrorBoundary>
    </Flex>
  );
};

const ChartWithInteractiveFilters = React.forwardRef(
  (
    {
      dataSet,
      dataSource,
      chartConfig,
    }: {
      dataSet: string;
      dataSource: DataSource;
      chartConfig: ChartConfig;
    },
    ref
  ) => {
    useSyncInteractiveFilters(chartConfig);

    return (
      <Flex
        ref={ref}
        sx={{
          flexDirection: "column",
          justifyContent: "space-between",
          flexGrow: 1,
        }}
      >
        {/* Filters list & Interactive filters */}
        {chartConfig.interactiveFiltersConfig?.dataFilters.active ? (
          <ChartDataFilters
            dataSet={dataSet}
            dataSource={dataSource}
            dataFiltersConfig={chartConfig.interactiveFiltersConfig.dataFilters}
            chartConfig={chartConfig}
          />
        ) : (
          <Flex sx={{ flexDirection: "column", my: 4 }}>
            <ChartFiltersList
              dataSetIri={dataSet}
              dataSource={dataSource}
              chartConfig={chartConfig}
            />
          </Flex>
        )}
        <Chart
          dataSet={dataSet}
          dataSource={dataSource}
          chartConfig={chartConfig}
        />
      </Flex>
    );
  }
);

const Chart = ({
  dataSet,
  dataSource,
  chartConfig,
}: {
  dataSet: string;
  dataSource: DataSource;
  chartConfig: ChartConfig;
}) => {
  // Combine filters from config + interactive filters
  const queryFilters = useQueryFilters({
    chartConfig,
  });

  const props = {
    dataSet,
    dataSource,
    chartConfig: chartConfig,
    queryFilters: queryFilters,
  };

  return <GenericChart {...props} />;
};
