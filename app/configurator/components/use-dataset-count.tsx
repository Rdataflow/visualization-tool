import { useMemo } from "react";
import { useDatasetCountQuery } from "../../graphql/query-hooks";
import isAttrEqual from "../../utils/is-attr-equal";
import { BrowseFilter } from "./dataset-browse";

const countListToIndexedCount = (l: { count: number; iri: string }[]) =>
  Object.fromEntries(l.map((o) => [o.iri, o.count]));
const useDatasetCount = (filters: BrowseFilter[]): Record<string, number> => {
  const [{ data: datasetCounts }] = useDatasetCountQuery({
    variables: {
      theme: filters.find(isAttrEqual("__typename", "DataCubeTheme"))?.iri,
      organization: filters.find(
        isAttrEqual("__typename", "DataCubeOrganization")
      )?.iri,
    },
  });

  return useMemo(
    () =>
      datasetCounts?.datasetcount
        ? countListToIndexedCount(datasetCounts?.datasetcount)
        : {},
    [datasetCounts]
  );
};

export default useDatasetCount;