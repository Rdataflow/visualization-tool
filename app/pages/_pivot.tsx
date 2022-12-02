import {
  Typography,
  FormControlLabel,
  Switch,
  Box,
  Card as MUICard,
  CircularProgress,
  Theme,
  lighten,
} from "@mui/material";
import { makeStyles, styled } from "@mui/styles";
import clsx from "clsx";
import groupBy from "lodash/groupBy";
import mapValues from "lodash/mapValues";
import React, { ChangeEvent, useMemo, useState } from "react";
import { useEffect } from "react";
import Inspector from "react-inspector";
import { Column, useSortBy, useTable, useExpanded } from "react-table";

import { Loading } from "@/components/hint";
import {
  Dimension,
  HierarchyValue,
  Measure,
  useDataCubeObservationsQuery,
  useDimensionHierarchyQuery,
} from "@/graphql/query-hooks";
import { visitHierarchy } from "@/rdf/tree-utils";
import useEvent from "@/utils/use-event";

const Card = styled(MUICard)({
  border: "1px solid #ccc",
  backgroundColor: "#eee",
  padding: "1rem",
  marginTop: 16,
  marginBottom: 16,
});

const intDatasource = {
  sourceUrl: "https://int.lindas.admin.ch/query",
  sourceType: "sparql",
};

type Dataset = {
  label: string;
  iri: string;
  datasource: typeof intDatasource;
};

const datasets: Record<string, Dataset> = mapValues(
  {
    "https://environment.ld.admin.ch/foen/fab_Offentliche_Ausgaben_test3/8": {
      label: "ausgaben",
      datasource: intDatasource,
    },
    "https://environment.ld.admin.ch/foen/ubd000502_sad_01/7": {
      label: "Gas",
      datasource: intDatasource,
    },
  },
  (v, k) => ({ ...v, iri: k })
);

type Observation = Record<string, any>;
type PivottedObservation = Record<string, any>;

const useStyles = makeStyles((theme: Theme) => ({
  pivotTableRoot: {
    display: "grid",
    gridTemplateColumns: "280px 1fr",
    gridTemplateAreas: `
"options chart"
    `,
    gridGap: "1rem",
  },
  pivotTableOptions: {
    paddingTop: "1rem",
    gridArea: "options",
  },
  pivotTableChart: {
    gridArea: "chart",
    overflowX: "hidden",
  },
  pivotTableContainer: {
    overflowX: "scroll",
  },
  pivotTableTable: {
    width: "100%",
    fontSize: "12px",
    borderCollapse: "collapse",
    "& td, & th": {
      border: "1px solid #ccc",
      whiteSpace: "nowrap",
      padding: "4px",
    },
  },
  optionGroup: {
    "& + &": {
      marginTop: "0.75rem",
    },
  },
  row: {
    transition: "background-color 0.3s ease",
  },
  expanded: {},
  depth_0: {
    "&$expanded": {
      background: lighten(theme.palette.primary.light, 0.75),
    },
  },
  depth_1: {
    "&$expanded": {
      background: lighten(theme.palette.primary.light, 0.5),
    },
  },
  depth_2: {
    "&$expanded": {
      background: lighten(theme.palette.primary.light, 0.15),
    },
  },
}));

const indexHierarchy = (hierarchy: HierarchyValue[]) => {
  const byLabel = new Map<string, HierarchyValue>();
  const parentsByIri = new Map<string, HierarchyValue>();
  const childrenByIri = new Map<string, HierarchyValue[]>();
  const byIri = new Map<string, HierarchyValue>();
  visitHierarchy(hierarchy, (x_) => {
    const x = x_ as HierarchyValue;
    byLabel.set(x.label, x);
    byIri.set(x.value, x);

    const children = x.children as HierarchyValue[];
    if (children) {
      childrenByIri.set(x.value, children);
      for (let child of children) {
        parentsByIri.set(child.value, x);
      }
    }
  });
  return { byLabel, parentsByIri, childrenByIri, byIri };
};

const useBarStyles = makeStyles<Theme>((theme) => ({
  root: {
    backgroundColor: theme.palette.primary.main,
  },
}));

const Bar = ({ percent }: { percent: number }) => {
  const classes = useBarStyles();
  return (
    <div
      className={classes.root}
      style={{ height: 4, width: (100 * percent) / 100 }}
    ></div>
  );
};

const PivotTable = ({ dataset }: { dataset: typeof datasets[string] }) => {
  const [activeMeasures, setActiveMeasures] = useState<
    Record<Measure["iri"], boolean>
  >({});
  const [pivotDimension, setPivotDimension] = useState<Dimension>();
  const [hierarchyDimension, setHierarchyDimension] = useState<Dimension>();
  const [ignoredDimensions, setIgnoredDimensions] = useState<
    Record<Dimension["iri"], boolean>
  >({});

  const [{ data, fetching }] = useDataCubeObservationsQuery({
    variables: {
      iri: dataset.iri,
      sourceUrl: "https://int.lindas.admin.ch/query",
      sourceType: "sparql",
      locale: "en",
    },
  });

  const [{ data: hierarchyData, fetching: fetchingHierarchy }] =
    useDimensionHierarchyQuery({
      variables: {
        cubeIri: dataset.iri,
        dimensionIri: hierarchyDimension?.iri!,
        sourceUrl: "https://int.lindas.admin.ch/query",
        sourceType: "sparql",
        locale: "en",
      },
      pause: !hierarchyDimension,
    });

  const classes = useStyles();

  const allDimensions = data?.dataCubeByIri?.dimensions;
  const dimensions = useMemo(
    () =>
      data?.dataCubeByIri?.dimensions.filter((d) => !ignoredDimensions[d.iri]),
    [data?.dataCubeByIri?.dimensions, ignoredDimensions]
  );
  const measures = data?.dataCubeByIri?.measures;
  const observations = useMemo(() => {
    return data?.dataCubeByIri?.observations?.data || [];
  }, [data]);

  const handleChangePivot = (ev: ChangeEvent<HTMLSelectElement>) => {
    const name = ev.currentTarget.value;
    setPivotDimension(dimensions?.find((d) => d.iri === name));
  };

  const handleChangeHierarchy = (ev: ChangeEvent<HTMLSelectElement>) => {
    const name = ev.currentTarget.value;
    setHierarchyDimension(dimensions?.find((d) => d.iri === name));
  };

  const handleToggleMeasure = useEvent((ev: ChangeEvent<HTMLInputElement>) => {
    const measureIri = ev.currentTarget.getAttribute("name");
    if (!measureIri) {
      return;
    }
    setActiveMeasures((am) =>
      am ? { ...am, [measureIri]: !am[measureIri] } : {}
    );
  });

  const handleToggleIgnoredDimension = useEvent(
    (ev: ChangeEvent<HTMLInputElement>) => {
      const dimensionIri = ev.currentTarget.getAttribute("name");
      if (!dimensionIri) {
        return;
      }
      setIgnoredDimensions((ignored) =>
        ignored ? { ...ignored, [dimensionIri]: !ignored[dimensionIri] } : {}
      );
    }
  );

  const hierarchyIndexes = useMemo(() => {
    const hierarchy = hierarchyData?.dataCubeByIri?.dimensionByIri?.hierarchy;
    if (hierarchy) {
      return indexHierarchy(hierarchy);
    }
  }, [hierarchyData?.dataCubeByIri?.dimensionByIri?.hierarchy]);

  const { pivotted, pivotUniqueValues, tree } = useMemo(() => {
    if (!pivotDimension || !dimensions || !measures) {
      return {
        pivotted: [],
        pivotUniqueValues: [],
      };
    } else {
      const restDimensions =
        dimensions.filter((f) => f !== pivotDimension) || [];
      const rowKey = (row: Observation) => {
        return restDimensions.map((d) => row[d.iri]).join("/");
      };
      const pivotGroups = Object.values(
        groupBy(observations, (x) =>
          restDimensions?.map((d) => x[d.iri]).join("/")
        )
      );
      const pivotUniqueValues = new Set<Observation[string]>();
      const rowIndex = new Map<string, { subRows?: PivottedObservation[] }>();

      // Create pivotted rows with pivot dimension values as columns
      const pivotted: PivottedObservation[] = [];
      pivotGroups.forEach((g) => {
        // Start from values that are the same within the group
        const row = Object.fromEntries(
          restDimensions.map((d) => [d.iri, g[0][d.iri]])
        );

        // Add pivoted dimensions
        for (let item of g) {
          const pivotValueAttr = `${pivotDimension.iri}/${
            item[pivotDimension.iri]
          }`;
          // @ts-ignore
          row[pivotValueAttr] = Object.fromEntries(
            measures.map((m) => [m.iri, item[m.iri]])
          );
          pivotUniqueValues.add(item[pivotDimension.iri]);
        }
        rowIndex.set(rowKey(row), row);
        pivotted.push(row);
      });

      // Regroup rows with their parent row
      const tree: PivottedObservation[] = [];
      pivotted.forEach((row) => {
        if (hierarchyDimension && hierarchyIndexes) {
          const hierarchyLabel = row[hierarchyDimension.iri];
          const hierarchyNode = hierarchyIndexes.byLabel.get(hierarchyLabel);
          const parentNode = hierarchyIndexes.parentsByIri.get(
            hierarchyNode?.value!
          );
          const parentKey = rowKey({
            ...row,
            [hierarchyDimension.iri]: parentNode?.label,
          });
          const parentRow = rowIndex.get(parentKey);
          if (parentRow) {
            parentRow.subRows = parentRow.subRows || [];
            parentRow.subRows.push(row);
          } else {
            tree.push(row);
          }
        } else {
          tree.push(row);
        }
      });
      return {
        pivotted,
        tree,
        pivotUniqueValues: Array.from(pivotUniqueValues).sort(),
      } as const;
    }
  }, [
    pivotDimension,
    dimensions,
    measures,
    observations,
    hierarchyDimension,
    hierarchyIndexes,
  ]);

  const columns = useMemo((): Column<Observation>[] => {
    if (!dimensions || !measures) {
      return [];
    } else if (pivotDimension) {
      const dimensionColumns: Column<Observation>[] = dimensions
        .filter((d) => d.iri !== pivotDimension.iri)
        .sort((a) => {
          if (a.iri === hierarchyDimension?.iri) {
            return 1;
          } else {
            return 0;
          }
        })
        .map((d) => ({
          id: d.iri,
          accessor: (x: Observation) => x[d.iri],
          Header: d.label,
        }));

      const pivotColumns: Column<Observation>[] = pivotUniqueValues.map(
        (uv) => ({
          Header: uv,
          columns: measures
            .filter((m) => activeMeasures?.[m.iri] !== false)
            .map((m) => {
              const showBars = m.label.includes("%");
              return {
                Header: m.label,
                Cell: ({ cell }) => {
                  return (
                    <>
                      {cell.value}
                      {showBars ? (
                        <Bar percent={parseFloat(cell.value)} />
                      ) : null}
                    </>
                  );
                },
                id: `${pivotDimension.iri}/${uv}/${m.iri}`,
                accessor: (x) => {
                  return x[`${pivotDimension.iri}/${uv}`]?.[m.iri] || "";
                },
              };
            }),
        })
      );

      const dimensionAndHierarchyColumns = dimensionColumns.map((d) => {
        if (d.id === hierarchyDimension?.iri) {
          const col: Column<Observation> = {
            ...d,
            Cell: ({ cell, row }) => {
              const style = {
                // We can even use the row.depth property
                // and paddingLeft to indicate the depth
                // of the row
                paddingLeft: `${row.depth * 1}rem`,
              };
              return (
                // Use the row.canExpand and row.getToggleRowExpandedProps prop getter
                // to build the toggle for expanding a row
                <span
                  {...(row.canExpand
                    ? row.getToggleRowExpandedProps({
                        style,
                      })
                    : {
                        style,
                      })}
                >
                  {row.canExpand ? (row.isExpanded ? "▼  " : "▶  ") : null}
                  {cell.value}
                </span>
              );
            },
          };
          return col;
        } else {
          return d;
        }
      });

      return [...dimensionAndHierarchyColumns, ...pivotColumns];
    } else {
      const all = [...dimensions, ...measures];
      return all.map((d) => {
        return {
          accessor: (x) => x[d.iri],
          Header: d.label,
        };
      });
    }
  }, [
    dimensions,
    measures,
    pivotDimension,
    pivotUniqueValues,
    hierarchyDimension?.iri,
    activeMeasures,
  ]);

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
    expandedDepth,
  } = useTable(
    {
      columns: columns,
      data: pivotDimension && tree ? tree : observations,
    },
    useSortBy,
    useExpanded
  );
  console.log(expandedDepth);
  useEffect(() => {
    if (!Object.keys(activeMeasures).length && measures) {
      setActiveMeasures(Object.fromEntries(measures.map((m) => [m.iri, true])));
    }
  }, [activeMeasures, measures]);

  return (
    <Box className={classes.pivotTableRoot}>
      <div className={classes.pivotTableOptions}>
        <div className={classes.optionGroup}>
          <Typography variant="h6" gutterBottom display="block">
            Pivot columns
          </Typography>
          <select
            onChange={handleChangePivot}
            value={pivotDimension?.iri || "-"}
          >
            <option value="-">-</option>
            {dimensions?.map((d) => {
              return (
                <option key={d.iri} value={d.iri}>
                  {d.label}
                </option>
              );
            })}
          </select>
        </div>
        <div className={classes.optionGroup}>
          <Typography variant="h6" gutterBottom display="block">
            Group rows by
          </Typography>
          <select
            onChange={handleChangeHierarchy}
            value={hierarchyDimension?.iri || "-"}
          >
            <option value="-">-</option>
            {dimensions?.map((d) => {
              return (
                <option key={d.iri} value={d.iri}>
                  {d.label}
                </option>
              );
            })}
          </select>

          {fetchingHierarchy ? (
            <CircularProgress size={12} sx={{ ml: 2 }} />
          ) : null}
        </div>
        <div className={classes.optionGroup}>
          <Typography variant="h6" gutterBottom display="block">
            Measures
          </Typography>
          {measures?.map((m) => {
            return (
              <FormControlLabel
                key={m.iri}
                label={m.label}
                componentsProps={{ typography: { variant: "caption" } }}
                control={
                  <Switch
                    size="small"
                    checked={activeMeasures?.[m.iri]}
                    onChange={handleToggleMeasure}
                    name={m.iri}
                  />
                }
              />
            );
          })}
        </div>
        <div className={classes.optionGroup}>
          <Typography variant="h6" display="block">
            Ignored dimensions
          </Typography>
          <Typography variant="caption" gutterBottom display="block">
            If some dimensions contain duplicate information with another
            dimension, it is necessary to ignore them for the grouping to work.
            <br />
            Ex: the Hierarchy column of the Gas dataset is a duplicate of the
            Source of emission column, it needs to be ignored.
          </Typography>
          {allDimensions?.map((d) => {
            return (
              <FormControlLabel
                key={d.iri}
                label={d.label}
                componentsProps={{ typography: { variant: "caption" } }}
                control={
                  <Switch
                    size="small"
                    checked={ignoredDimensions?.[d.iri]}
                    onChange={handleToggleIgnoredDimension}
                    name={d.iri}
                  />
                }
              />
            );
          })}
        </div>
      </div>
      <div className={classes.pivotTableChart}>
        <Card elevation={0}>
          <details>
            <summary>
              <Typography variant="h6" display="inline">
                Debug
              </Typography>
            </summary>

            <Typography variant="overline" display="block">
              Columns
            </Typography>
            <Inspector data={columns} />
            <Typography variant="overline" display="block">
              Pivotted
            </Typography>
            <Inspector data={pivotted} />
            <Typography variant="overline" display="block">
              Pivotted tree
            </Typography>
            <Inspector data={tree} />
            <Typography variant="overline" display="block">
              Hierarchy
            </Typography>
            <Inspector
              data={hierarchyData?.dataCubeByIri?.dimensionByIri?.hierarchy}
            />
            <Typography variant="overline" display="block">
              Hierarchy indexes
            </Typography>
            <Inspector data={hierarchyIndexes} />
          </details>
        </Card>
        {fetching ? <Loading /> : null}
        <div className={classes.pivotTableContainer}>
          <table {...getTableProps()} className={classes.pivotTableTable}>
            <thead>
              {headerGroups.map((headerGroup) => (
                // eslint-disable-next-line react/jsx-key
                <tr {...headerGroup.getHeaderGroupProps()}>
                  {headerGroup.headers.map((column) => (
                    // eslint-disable-next-line react/jsx-key
                    <th
                      {...column.getHeaderProps(column.getSortByToggleProps())}
                    >
                      {column.render("Header")}
                      <span>
                        {column.isSorted
                          ? column.isSortedDesc
                            ? " 🔽"
                            : " 🔼"
                          : ""}
                      </span>
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody {...getTableBodyProps()}>
              {rows.map((row) => {
                prepareRow(row);
                return (
                  // eslint-disable-next-line react/jsx-key
                  <tr
                    {...row.getRowProps()}
                    className={clsx(
                      classes.row,
                      row.isExpanded ? classes.expanded : null,
                      classes[
                        `depth_${
                          expandedDepth - row.depth
                        }` as keyof typeof classes
                      ]
                    )}
                  >
                    {row.cells.map((cell) => {
                      return (
                        // eslint-disable-next-line react/jsx-key
                        <td {...cell.getCellProps()}>{cell.render("Cell")}</td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </Box>
  );
};

const Page = () => {
  const [dataset, setDataset] = useState(
    datasets[Object.keys(datasets)[0] as keyof typeof datasets]!
  );

  const handleChangeDataset = (ev: ChangeEvent<HTMLSelectElement>) => {
    const name = ev.currentTarget.value;
    if (name in datasets) {
      setDataset(datasets[name as keyof typeof datasets]);
    }
  };

  return (
    <Box m={5}>
      <Typography variant="h2">Pivot table</Typography>
      <Typography variant="overline" display="block">
        Dataset
      </Typography>

      <select onChange={handleChangeDataset} value={dataset.iri}>
        {Object.keys(datasets).map((k) => {
          const dataset = datasets[k as keyof typeof datasets];
          return (
            <option key={dataset.iri} value={dataset.iri}>
              {dataset.label}
            </option>
          );
        })}
      </select>
      <PivotTable key={dataset.iri} dataset={dataset} />
    </Box>
  );
};

export default Page;
