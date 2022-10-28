import { InternMap } from "d3";
import merge from "lodash/merge";

import {
  getWideData,
  prepareQueryFilters,
} from "@/charts/shared/chart-helpers";
import { InteractiveFiltersState } from "@/charts/shared/use-interactive-filters";
import { LineConfig } from "@/configurator";
import { FIELD_VALUE_NONE } from "@/configurator/constants";
import { Observation } from "@/domain/data";
import line1Fixture from "@/test/__fixtures/config/prod/line-1.json";

const makeCubeNsGetters = (cubeIri: string) => ({
  col: (col: string) => `${cubeIri}/dimension/${col}`,
  val: (col: string, n: string) => `${cubeIri}/dimension/${col}/${n}`,
});

const { col, val } = makeCubeNsGetters(
  "http://environment.ld.admin.ch/foen/px/0703010000_105"
);

const commonInteractiveFiltersConfig = {
  legend: {
    active: false,
    componentIri: col("2"),
  },
  timeRange: {
    active: false,
    componentIri: col("1"),
    presets: {
      type: "range",
      from: "2010-01-01",
      to: "2020-01-01",
    },
  },
  dataFilters: {
    componentIris: [col("3"), col("4")],
    active: false,
  },
};
const commonInteractiveFiltersState: InteractiveFiltersState = {
  categories: {
    type: true,
  },
  timeRange: {
    from: new Date(2021, 0, 1),
    to: new Date(2021, 11, 31),
  },
  dataFilters: {
    [col("3")]: {
      type: "single",
      value: val("3", "1"),
    },
  },
};

describe("useQueryFilters", () => {
  it("should not merge interactive filters state if interactive filters are disabled at publish time", () => {
    const queryFilters = prepareQueryFilters(
      {
        ...line1Fixture.data.chartConfig,
        interactiveFiltersConfig: commonInteractiveFiltersConfig,
      } as LineConfig,
      commonInteractiveFiltersState
    );
    expect(queryFilters[col("3")]).toEqual({
      type: "single",
      value: val("3", "0"),
    });
  });

  it("should merge interactive filters state if interactive filters are active at publish time", () => {
    const queryFilters = prepareQueryFilters(
      {
        ...line1Fixture.data.chartConfig,
        interactiveFiltersConfig: merge({}, commonInteractiveFiltersConfig, {
          dataFilters: {
            active: true,
          },
        }),
      } as LineConfig,
      commonInteractiveFiltersState
    );
    expect(queryFilters[col("3")]).toEqual({
      type: "single",
      value: val("3", "1"),
    });
  });

  it("should omit none values since they should not be passed to graphql layer", () => {
    const queryFilters = prepareQueryFilters(
      {
        ...line1Fixture.data.chartConfig,
        interactiveFiltersConfig: merge({}, commonInteractiveFiltersConfig, {
          dataFilters: {
            active: true,
          },
        }),
      } as LineConfig,
      merge({}, commonInteractiveFiltersState, {
        dataFilters: {
          [col("3")]: {
            type: "single",
            value: FIELD_VALUE_NONE,
          },
        },
      })
    );
    expect(queryFilters[col("3")]).toBeUndefined();
  });
});

describe("getWideData", () => {
  const exampleMap: InternMap<string, Observation[]> = new Map();
  exampleMap.set("2021-01-02", [{ segment: "abc", value: 1 }]);
  exampleMap.set("2015-03-03", [{ segment: "abc", value: 10 }]);
  exampleMap.set("2028-12-12", [{ segment: "abc", value: 12 }]);

  it("should return sorted data", () => {
    const wideData = getWideData({
      dataGroupedByX: exampleMap,
      xKey: "date",
      getY: (d: Observation) => Number(d["value"]),
      getSegment: (d: Observation) => String(d["segment"]),
    });

    expect(wideData.map((d) => d["date"])).toEqual([
      "2015-03-03",
      "2021-01-02",
      "2028-12-12",
    ]);
  });
});
