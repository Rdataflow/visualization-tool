import clsx from "clsx";
import { fold } from "fp-ts/lib/Either";
import { pipe } from "fp-ts/lib/function";
import { useState } from "react";
import { Layouts } from "react-grid-layout";

import { ChartPanelLayoutTypeProps } from "@/components/chart-panel";
import ChartGridLayout from "@/components/react-grid";
import { ReactGridLayoutsType, isLayouting } from "@/configurator";
import { useConfiguratorState } from "@/src";
import { assert } from "@/utils/assert";

export const chartPanelLayoutGridClasses = {
  root: "chart-panel-grid-layout",
  dragHandle: "chart-panel-grid-layout-drag-handle",
};

const decodeLayouts = (layouts: Layouts) => {
  return pipe(
    ReactGridLayoutsType.decode(layouts),
    fold(
      (err) => {
        console.error("Error while decoding react-grid-layout", err);
        return undefined;
      },
      (d) => {
        return d;
      }
    )
  );
};

const ChartPanelLayoutGrid = (props: ChartPanelLayoutTypeProps) => {
  const { chartConfigs } = props;
  const [config, dispatch] = useConfiguratorState(isLayouting);
  const [layouts, setLayouts] = useState<Layouts>(() => {
    assert(
      config.layout.type === "dashboard" && config.layout.layout === "tiles",
      "ChartPanelLayoutGrid should be rendered only for dashboard layout with tiles"
    );

    return config.layout.layouts;
  });

  const handleChangeLayouts = (layouts: Layouts) => {
    const layout = config.layout;
    assert(
      layout.type === "dashboard" && layout.layout === "tiles",
      "ChartPanelLayoutGrid should be rendered only for dashboard layout with tiles"
    );

    const parsedLayouts = decodeLayouts(layouts);
    if (!parsedLayouts) {
      return;
    }

    dispatch({
      type: "LAYOUT_CHANGED",
      value: {
        ...layout,
        layouts: parsedLayouts,
      },
    });
    setLayouts(layouts);
  };

  return (
    <ChartGridLayout
      className={clsx("layout", chartPanelLayoutGridClasses.root)}
      layouts={layouts}
      resize
      draggableHandle={`.${chartPanelLayoutGridClasses.dragHandle}`}
      onLayoutChange={(_l, allLayouts) => handleChangeLayouts(allLayouts)}
    >
      {chartConfigs.map((chartConfig) => props.renderChart(chartConfig))}
    </ChartGridLayout>
  );
};

export default ChartPanelLayoutGrid;