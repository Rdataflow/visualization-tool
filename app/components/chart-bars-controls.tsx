import React from "react";
import { DimensionWithMeta, MeasureWithMeta } from "../domain/data";
import { ColorPalette, ControlList, ControlSection } from "./chart-controls";
import { Field } from "./field";

export const ChartBarsControls = ({
  chartId,
  timeDimensions,
  categoricalDimensions,
  measuresDimensions
}: {
  chartId: string;
  timeDimensions: DimensionWithMeta[];
  categoricalDimensions: DimensionWithMeta[];
  measuresDimensions: MeasureWithMeta[];
}) => {
  return (
    <>
      <ControlSection title="Horizontale Achse" note="x-Achse">
        <ControlList>
          <Field
            type="select"
            chartId={chartId}
            path={"x"}
            label={"Dimension wählen"}
            options={[...timeDimensions,...categoricalDimensions].map(({ component }) => ({
              value: component.iri.value,
              label: component.labels[0].value
            }))}
          />
        </ControlList>
      </ControlSection>
      <ControlSection title="Vertikale Achse" note="y-Achse">
        <ControlList>
          <Field
            type="select"
            chartId={chartId}
            path={"height"}
            label={"Werte wählen"}
            options={measuresDimensions.map(({ component }) => ({
              value: component.iri.value,
              label: component.labels[0].value
            }))}
          />
        </ControlList>
      </ControlSection>
      <ControlSection title="Farbe">
        <ControlList>
          <Field
            type="select"
            chartId={chartId}
            path={"color"}
            label={"Dimension wählen"}
            options={[...timeDimensions,...categoricalDimensions].map(({ component }) => ({
              value: component.iri.value,
              label: component.labels[0].value
            }))}
          />
        </ControlList>
      </ControlSection>
      <ControlSection title="Darstellung">
        <ControlList>
          <ColorPalette
            type="select"
            chartId={chartId}
            path={"palette"}
            label={"Farbpalette:"}
          />
        </ControlList>
      </ControlSection>
    </>
  );
};