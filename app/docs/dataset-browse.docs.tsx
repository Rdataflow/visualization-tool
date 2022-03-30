/* eslint-disable import/no-anonymous-default-export */
import { Box } from "@mui/material";
import { markdown, ReactSpecimen } from "catalog";
import { ConfiguratorStateProvider } from "@/configurator";
import { DatasetResult } from "@/configurator/components/dataset-browse";
import { DataCubePublicationStatus } from "@/graphql/query-hooks";
import { states } from "@/docs/fixtures";

export default () => markdown`

## Dataset result

> Dataset results are shown when selecting a dataset at the beginning of the chart creation process.
  ${(
    <ConfiguratorStateProvider
      chartId={states[0].state}
      initialState={states[0]}
      allowDefaultRedirect={false}
    >
      <ReactSpecimen>
        <Box
          sx={{
            width: 800,
            justifyContent: "center",
            alignItems: "center",
            p: 5,
            backgroundColor: "muted.main",
          }}
        >
          <DatasetResult
            dataCube={{
              iri: "http://example.com/iri",
              themes: [
                {
                  __typename: "DataCubeTheme",
                  label: "Administration",
                  iri: "http://lindas.com/adminstration",
                },
              ],
              title:
                "Comptes des exploitations forestières en francs selon Année, Zone forestière, Canton et Variable",
              description:
                "Comptes des exploitations forestières en francs, dès 2015",
              datePublished: "2020-10-10",
              publicationStatus: "DRAFT" as DataCubePublicationStatus,
            }}
          />
          <DatasetResult
            dataCube={{
              iri: "http://example.com/iri",
              themes: [],
              title:
                "Comptes des exploitations forestières en francs selon Année, Zone forestière, Canton et Variable",
              description:
                "Comptes des exploitations forestières en francs, dès 2015",
              datePublished: "2020-10-10",
              publicationStatus: "PUBLISHED" as DataCubePublicationStatus,
            }}
          />
        </Box>
      </ReactSpecimen>
    </ConfiguratorStateProvider>
  )}


  ## How to use

~~~
import { DatasetResult } from "../components/dataset-selector";

<DatasetResult
  dataCube={{
    iri: 'http://'
    title:
      "Comptes des exploitations forestières en francs selon Année, Zone forestière, Canton et Variable",
    description:
      "Comptes des exploitations forestières en francs, dès 2015",
    datePublished: new Date(2020, 1, 1),
  }}
  selected={true}
/>
~~~

`;
