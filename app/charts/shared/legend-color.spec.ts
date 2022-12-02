import { HierarchyValue } from "@/graphql/resolver-types";

import { getLegendGroups } from "./legend-color-helpers";

describe("getLegendGroups", () => {
  const hierarchy: HierarchyValue[] = [
    { dimensionIri: "numbers", depth: 0, value: "1", label: "one" },
    { dimensionIri: "numbers", depth: 0, value: "2", label: "two" },
    { dimensionIri: "numbers", depth: 0, value: "3", label: "three" },
  ];

  it("should properly create groups when encountering top-level values", () => {
    const groups = getLegendGroups({
      title: "",
      labels: hierarchy.map((d) => d.label),
      getLabel: (d: string) => d,
      hierarchy,
      sort: true,
      useAbbreviations: false,
    });

    expect(groups.length).toEqual(1);
    expect(groups[0][1]).toEqual(["one", "two", "three"]);
  });
});
