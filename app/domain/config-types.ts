import * as t from "io-ts";

const Filters = t.record(
  t.string,
  t.record(t.string, t.boolean, "FilterValue"),
  "FilterDimension"
);

export type Filters = t.TypeOf<typeof Filters>;

const NoneConfig = t.type(
  {
    chartType: t.literal("none"),
    filters: Filters
  },
  "NoneConfig"
);
export type NoneConfig = t.TypeOf<typeof NoneConfig>;

const AreaConfig = t.type(
  {
    chartType: t.literal("area"),
    filters: Filters
  },
  "AreaConfig"
);
export type AreaConfig = t.TypeOf<typeof AreaConfig>;

const BarConfig = t.type(
  {
    chartType: t.literal("bar"),
    filters: Filters
  },
  "BarConfig"
);
export type BarConfig = t.TypeOf<typeof BarConfig>;

const LineConfig = t.type(
  {
    chartType: t.literal("line"),
    filters: Filters
  },
  "LineConfig"
);
export type LineConfig = t.TypeOf<typeof LineConfig>;

const ScatterPlotConfig = t.type(
  {
    chartType: t.literal("scatterplot"),
    filters: Filters
  },
  "ScatterPlotConfig"
);
export type ScatterPlotConfig = t.TypeOf<typeof ScatterPlotConfig>;

// interface IriBrand {
//   readonly IRI: unique symbol;
// }
// const Iri = t.brand(
//   t.string,
//   (s): s is t.Branded<string, IriBrand> => true,
//   "IRI"
// );

const ChartConfig = t.intersection([
  t.union([AreaConfig, BarConfig, LineConfig, ScatterPlotConfig, NoneConfig]),
  t.record(t.string, t.any)
]);
export type ChartConfig = t.TypeOf<typeof ChartConfig>;

const Config = t.type(
  {
    dataSet: t.string,
    // filters: Filters,
    chartConfig: ChartConfig
  },
  "Config"
);

export type Config = t.TypeOf<typeof Config>;

export const isValidConfig = (config: unknown): config is Config =>
  Config.is(config);

export const decodeConfig = (config: unknown) => Config.decode(config);

const ConfiguratorStateInitial = t.type({ state: t.literal("INITIAL") });
const ConfiguratorStateSelectingDataSet = t.type({
  state: t.literal("SELECTING_DATASET"),
  dataSet: t.undefined,
  chartConfig: NoneConfig
});

const ConfiguratorStateSelectingChartType = t.intersection([
  t.type({
    state: t.literal("SELECTING_CHART_TYPE")
  }),
  Config
]);
const ConfiguratorStateConfiguringChart = t.intersection([
  t.type({
    state: t.literal("CONFIGURING_CHART")
  }),
  Config
]);
const ConfiguratorStatePublishing = t.intersection([
  t.type({
    state: t.literal("PUBLISHING")
  }),
  Config
]);
const ConfiguratorStatePublished = t.intersection([
  t.type({
    state: t.literal("PUBLISHED"),
    configKey: t.string
  }),
  Config
]);

export type ConfiguratorStatePublishing = t.TypeOf<
  typeof ConfiguratorStatePublishing
>;

const ConfiguratorState = t.union([
  ConfiguratorStateInitial,
  ConfiguratorStateSelectingDataSet,
  ConfiguratorStateSelectingChartType,
  ConfiguratorStateConfiguringChart,
  ConfiguratorStatePublishing,
  ConfiguratorStatePublished
]);

export type ConfiguratorState = t.TypeOf<typeof ConfiguratorState>;

export const isValidConfiguratorState = (
  state: unknown
): state is ConfiguratorState => ConfiguratorState.is(state);