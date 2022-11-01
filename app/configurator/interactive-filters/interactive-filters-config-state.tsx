import produce from "immer";
import get from "lodash/get";
import { ChangeEvent, useCallback } from "react";

import { InteractiveFiltersConfig } from "@/configurator/config-types";
import {
  isDescribing,
  useConfiguratorState,
} from "@/configurator/configurator-state";
import { DimensionMetadataFragment } from "@/graphql/query-hooks";
import useEvent from "@/utils/use-event";

export const useInteractiveLegendFiltersToggle = () => {
  const [state, dispatch] = useConfiguratorState(isDescribing);
  const onChange = useEvent((e: ChangeEvent<HTMLInputElement>) => {
    const newConfig = produce(
      state.chartConfig.interactiveFiltersConfig,
      (draft) => {
        if (draft?.legend) {
          draft.legend.active = e.currentTarget.checked;
        }

        return draft;
      }
    );

    dispatch({
      type: "INTERACTIVE_FILTER_CHANGED",
      value: newConfig,
    });
  });

  const stateValue = get(
    state,
    "chartConfig.interactiveFiltersConfig.legend.active"
  );
  const checked = stateValue ? stateValue : false;

  return {
    name: "legend",
    checked,
    onChange,
  };
};

export const useInteractiveTimeRangeFiltersToggle = ({
  timeExtent,
}: {
  timeExtent: [string, string];
}) => {
  const [state, dispatch] = useConfiguratorState(isDescribing);
  const { chartConfig } = state;

  const onChange = useCallback<(e: ChangeEvent<HTMLInputElement>) => void>(
    (e) => {
      const active = e.currentTarget.checked;

      if (timeExtent) {
        const newConfig = produce(
          chartConfig.interactiveFiltersConfig,
          (draft) => {
            if (draft?.timeRange) {
              const { from, to } = draft.timeRange.presets;
              draft.timeRange.active = active;

              // set min and max date as default presets for time brush
              if (active && !from && !to) {
                draft.timeRange.presets.from = timeExtent[0];
                draft.timeRange.presets.to = timeExtent[1];
              }
            }

            return draft;
          }
        );

        dispatch({
          type: "INTERACTIVE_FILTER_CHANGED",
          value: newConfig,
        });
      }
    },
    [chartConfig, timeExtent, dispatch]
  );

  const stateValue = get(
    state,
    `chartConfig.interactiveFiltersConfig.timeRange.active`
  );
  const checked = stateValue ? stateValue : false;

  return {
    name: "timeRange",
    checked,
    onChange,
  };
};

export const updateInteractiveTimeRangeFilter = produce(
  (
    config: InteractiveFiltersConfig,
    { timeExtent: [from, to] }: { timeExtent: [string, string] }
  ): InteractiveFiltersConfig => {
    if (!config?.timeRange) {
      return config;
    }

    config.timeRange.presets.from = from;
    config.timeRange.presets.to = to;

    return config;
  }
);

export const useInteractiveDataFiltersToggle = ({
  dimensions,
}: {
  dimensions: DimensionMetadataFragment[];
}) => {
  const [state, dispatch] = useConfiguratorState(isDescribing);
  const { chartConfig } = state;

  const onChange = useCallback<(e: ChangeEvent<HTMLInputElement>) => void>(
    (e) => {
      const active = e.currentTarget.checked;

      const newConfig = produce(
        chartConfig.interactiveFiltersConfig,
        (draft) => {
          if (draft?.dataFilters) {
            draft.dataFilters.active = active;

            // Default: toggle dimensions if none is selected, but they are set to true
            if (active && draft.dataFilters.componentIris.length === 0) {
              draft.dataFilters.componentIris = dimensions.map((d) => d.iri);
            }
          }

          return draft;
        }
      );

      dispatch({
        type: "INTERACTIVE_FILTER_CHANGED",
        value: newConfig,
      });
    },
    [chartConfig, dimensions, dispatch]
  );

  const stateValue = get(
    state,
    "chartConfig.interactiveFiltersConfig.dataFilters.active"
  );
  const checked = stateValue ? stateValue : false;

  return {
    name: "dataFilters",
    checked,
    onChange,
  };
};

// Add or remove a dimension from the interactive
// data filters dimensions list
export const toggleInteractiveFilterDataDimension = produce(
  (config: InteractiveFiltersConfig, iri: string): InteractiveFiltersConfig => {
    if (!config?.dataFilters.componentIris) {
      return config;
    }

    if (config.dataFilters.componentIris.includes(iri)) {
      const newComponentIris = config.dataFilters.componentIris.filter(
        (d) => d !== iri
      );
      const newDataFilters = {
        ...config.dataFilters,
        componentIris: newComponentIris,
      };
      return { ...config, dataFilters: newDataFilters };
    } else if (!config.dataFilters.componentIris.includes(iri)) {
      const newComponentIris = [...config.dataFilters.componentIris, iri];
      const newDataFilters = {
        ...config.dataFilters,
        componentIris: newComponentIris,
      };

      return { ...config, dataFilters: newDataFilters };
    } else {
      return config;
    }
  }
);
