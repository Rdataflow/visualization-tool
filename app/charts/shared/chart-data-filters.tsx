import { t, Trans } from "@lingui/macro";
import { Box, Button, SelectChangeEvent } from "@mui/material";
import * as React from "react";

import { useInteractiveFilters } from "@/charts/shared/use-interactive-filters";
import { ChartFiltersList } from "@/components/chart-filters-list";
import Flex from "@/components/flex";
import { Select } from "@/components/form";
import { Loading } from "@/components/hint";
import {
  ChartConfig,
  DataSource,
  InteractiveFiltersDataConfig,
  OptionGroup,
  Option,
} from "@/configurator";
import { TimeInput } from "@/configurator/components/field";
import {
  getTimeIntervalFormattedSelectOptions,
  getTimeIntervalWithProps,
} from "@/configurator/components/ui-helpers";
import useHierarchyParents from "@/configurator/components/use-hierarchy-parents";
import { FIELD_VALUE_NONE } from "@/configurator/constants";
import { isTemporalDimension } from "@/domain/data";
import { useTimeFormatLocale } from "@/formatters";
import {
  Dimension,
  TemporalDimension,
  TimeUnit,
  useDimensionValuesQuery,
} from "@/graphql/query-hooks";
import { Icon } from "@/icons";
import { useLocale } from "@/locales/use-locale";
import { makeOptionGroups } from "@/utils/hierarchy";

export const ChartDataFilters = ({
  dataSet,
  dataSource,
  chartConfig,
  dataFiltersConfig,
}: {
  dataSet: string;
  dataSource: DataSource;
  chartConfig: ChartConfig;
  dataFiltersConfig: InteractiveFiltersDataConfig;
}) => {
  const [filtersVisible, setFiltersVisible] = React.useState(false);
  const { componentIris } = dataFiltersConfig;

  React.useEffect(() => {
    if (componentIris.length === 0) {
      setFiltersVisible(false);
    }
  }, [componentIris.length]);

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
            {!filtersVisible ? (
              <ChartFiltersList
                dataSetIri={dataSet}
                dataSource={dataSource}
                chartConfig={chartConfig}
              />
            ) : (
              <Box></Box>
            )}

            {componentIris.length > 0 && (
              <Button
                variant="text"
                endIcon={
                  <Icon name={filtersVisible ? "close" : "add"} size={15} />
                }
                sx={{
                  display: "flex",
                  fontSize: ["0.75rem", "0.75rem", "0.75rem"],
                  alignItems: "center",
                  minWidth: "fit-content",
                }}
                onClick={() => setFiltersVisible(!filtersVisible)}
              >
                {filtersVisible ? (
                  <Trans id="interactive.data.filters.hide">Hide Filters</Trans>
                ) : (
                  <Trans id="interactive.data.filters.show">Show Filters</Trans>
                )}
              </Button>
            )}
          </Flex>

          {componentIris.length > 0 && (
            <Box
              data-testid="published-chart-interactive-filters"
              sx={{
                display: filtersVisible ? "grid" : "none",
                columnGap: 3,
                rowGap: 2,
                gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
              }}
            >
              {componentIris.map((d) => (
                <DataFilter
                  key={d}
                  dataSetIri={dataSet}
                  dataSource={dataSource}
                  chartConfig={chartConfig}
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

const DataFilter = ({
  dimensionIri,
  dataSetIri,
  dataSource,
  chartConfig,
}: {
  dimensionIri: string;
  dataSetIri: string;
  dataSource: DataSource;
  chartConfig: ChartConfig;
}) => {
  const [state, dispatch] = useInteractiveFilters();
  const { dataFilters } = state;

  const locale = useLocale();

  const [{ data }] = useDimensionValuesQuery({
    variables: {
      dimensionIri,
      sourceType: dataSource.type,
      sourceUrl: dataSource.url,
      locale,
      dataCubeIri: dataSetIri,
    },
  });

  const { data: hierarchyParents } = useHierarchyParents({
    datasetIri: dataSetIri,
    dataSource,
    dimension: data?.dataCubeByIri?.dimensionByIri!,
    locale,
    pause: !data?.dataCubeByIri?.dimensionByIri,
  });

  const optionGroups = React.useMemo(() => {
    return makeOptionGroups(hierarchyParents);
  }, [hierarchyParents]);

  const setDataFilter = (e: SelectChangeEvent<unknown>) => {
    dispatch({
      type: "UPDATE_DATA_FILTER",
      value: { dimensionIri, dimensionValueIri: e.target.value as string },
    });
  };

  if (data?.dataCubeByIri?.dimensionByIri) {
    const dimension = data?.dataCubeByIri?.dimensionByIri;

    const configFilter = chartConfig.filters[dimension.iri];
    const configFilterValue =
      configFilter && configFilter.type === "single"
        ? configFilter.value
        : undefined;

    const value =
      dataFilters?.[dimension.iri]?.value ??
      configFilterValue ??
      FIELD_VALUE_NONE;

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
        {!isTemporalDimension(dimension) ? (
          <DataFilterBaseDimension
            dimension={dimension}
            optionGroups={optionGroups}
            onChange={setDataFilter}
            value={value as string}
          />
        ) : dimension.timeUnit === TimeUnit.Year ? (
          <DataFilterTemporalDimension
            value={value as string}
            dimension={dimension}
            onChange={setDataFilter}
          />
        ) : null}
      </Flex>
    );
  } else {
    return <Loading />;
  }
};

const DataFilterBaseDimension = ({
  dimension,
  value,
  onChange,
  options: propOptions,
  optionGroups,
}: {
  dimension: Dimension;
  value: string;
  onChange: (e: SelectChangeEvent<unknown>) => void;
  options?: Array<{ label: string; value: string }>;
  optionGroups?: [OptionGroup, Option[]][];
}) => {
  const noneLabel = t({
    id: "controls.dimensionvalue.none",
    message: `No Filter`,
  });

  const { label, isKeyDimension, description: tooltipText } = dimension;
  const options = propOptions || dimension.values;

  const allOptions = React.useMemo(() => {
    return isKeyDimension
      ? options
      : [
          {
            value: FIELD_VALUE_NONE,
            label: noneLabel,
            isNoneValue: true,
          },
          ...options,
        ];
  }, [isKeyDimension, options, noneLabel]);

  return (
    <Select
      id="dataFilterBaseDimension"
      label={label}
      options={allOptions}
      optionGroups={optionGroups}
      value={value}
      tooltipText={tooltipText || undefined}
      onChange={onChange}
    />
  );
};

const DataFilterTemporalDimension = ({
  dimension,
  value,
  tooltipText,
  onChange,
}: {
  dimension: TemporalDimension;
  value: string;
  tooltipText?: string;
  onChange: (e: SelectChangeEvent<unknown>) => void;
}) => {
  const {
    isKeyDimension,
    label,
    values: options,
    timeUnit,
    timeFormat,
  } = dimension;

  const formatLocale = useTimeFormatLocale();
  const timeIntervalWithProps = React.useMemo(
    () =>
      getTimeIntervalWithProps(
        options[0].value,
        options[1].value,
        timeUnit,
        timeFormat,
        formatLocale
      ),
    [options, timeUnit, timeFormat, formatLocale]
  );
  const timeIntervalOptions = React.useMemo(() => {
    return getTimeIntervalFormattedSelectOptions(timeIntervalWithProps);
  }, [timeIntervalWithProps]);

  if (timeIntervalWithProps.range < 100) {
    return (
      <DataFilterBaseDimension
        dimension={dimension}
        options={timeIntervalOptions}
        value={value}
        onChange={onChange}
      />
    );
  }

  return (
    <TimeInput
      id="dataFilterTemporalDimension"
      label={label}
      value={value}
      tooltipText={tooltipText}
      timeFormat={timeFormat}
      formatLocale={formatLocale}
      isOptional={!isKeyDimension}
      onChange={onChange}
    />
  );
};
