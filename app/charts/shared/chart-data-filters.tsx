import { Trans } from "@lingui/macro";
import * as React from "react";
import { useState } from "react";
import { Box, Button, Flex } from "theme-ui";
import { ChartFiltersList } from "../../components/chart-filters-list";
import { Select } from "../../components/form";
import { Loading } from "../../components/hint";
import { ChartConfig, InteractiveFiltersDataConfig } from "../../configurator";
import { useDimensionValuesQuery } from "../../graphql/query-hooks";
import { Icon } from "../../icons";
import { useLocale } from "../../locales/use-locale";
import { useInteractiveFilters } from "./use-interactive-filters";

export const ChartDataFilters = ({
  dataSet,
  chartConfig,
  dataFiltersConfig,
}: {
  dataSet: string;
  chartConfig: ChartConfig;
  dataFiltersConfig: InteractiveFiltersDataConfig;
}) => {
  const [filtersAreHidden, toggleFilters] = useState(true);
  const { componentIris } = dataFiltersConfig;

  return (
    <>
      {dataSet && (
        <Flex sx={{ flexDirection: "column", my: 4 }}>
          <Flex
            sx={{
              justifyContent: "space-between",
              alignItems: "flex-start",
              minHeight: 20,
            }}
          >
            {(dataFiltersConfig.active && filtersAreHidden) ||
            !dataFiltersConfig.active ? (
              <ChartFiltersList
                dataSetIri={dataSet}
                chartConfig={chartConfig}
              />
            ) : (
              <Box></Box>
            )}

            {dataFiltersConfig.active && (
              <Button
                variant="inline"
                sx={{
                  display: "flex",
                  fontSize: [2, 2, 2],
                  alignItems: "center",
                  minWidth: "fit-content",
                }}
                onClick={() => toggleFilters(!filtersAreHidden)}
              >
                {filtersAreHidden ? (
                  <Trans id="interactive.data.filters.show">Show Filters</Trans>
                ) : (
                  <Trans id="interactive.data.filters.hide">Hide Filters</Trans>
                )}
                <Icon
                  name={filtersAreHidden ? "add" : "close"}
                  size={15}
                ></Icon>
              </Button>
            )}
          </Flex>

          {dataFiltersConfig.active && (
            <Box
              sx={{
                display: filtersAreHidden ? "none" : "grid",
                columnGap: 3,
                rowGap: 2,
                gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
              }}
            >
              {componentIris.map((d, i) => (
                <DataFilterDropdown
                  key={d}
                  dataSetIri={dataSet}
                  dimensionIri={d}
                />
              ))}
            </Box>
          )}
        </Flex>
      )}
    </>
  );
};

const DataFilterDropdown = ({
  dimensionIri,
  dataSetIri,
}: {
  dimensionIri: string;
  dataSetIri: string;
}) => {
  const [state, dispatch] = useInteractiveFilters();
  const { dataFilters } = state;

  const locale = useLocale();

  const [{ data }] = useDimensionValuesQuery({
    variables: { dimensionIri, locale, dataCubeIri: dataSetIri },
  });

  const setDataFilter = (e: React.ChangeEvent<HTMLSelectElement>) => {
    dispatch({
      type: "UPDATE_DATA_FILTER",
      value: { dimensionIri, dimensionValueIri: e.currentTarget.value },
    });
  };
  if (data?.dataCubeByIri?.dimensionByIri) {
    const dimension = data?.dataCubeByIri?.dimensionByIri;

    return (
      <Flex
        sx={{
          mr: 3,
          width: "100%",
          flex: "1 1 100%",
          ":last-of-type": {
            mr: 0,
          },
          " > div": { width: "100%" },
        }}
      >
        <Select
          id="interactiveDataFilter"
          label={dimension.label}
          options={dimension.values.map((v) => ({
            label: v.label,
            value: v.value,
          }))}
          value={
            dataFilters &&
            dataFilters[dimension.iri] &&
            dataFilters[dimension.iri].value
              ? dataFilters[dimension.iri].value
              : dimension.values[0].value
          }
          disabled={false}
          onChange={setDataFilter}
        />
      </Flex>
    );
  } else {
    return <Loading />;
  }
};