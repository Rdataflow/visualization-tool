import { ReactNode } from "react";
import { Box, Flex, Text } from "theme-ui";
import { ChartPublished } from "../components/chart-published";
import { HomepageSection } from "./generic";

export const Examples = ({
  headline,
  example1Headline,
  example1Description,
  example2Headline,
  example2Description,
  example3Headline,
  example3Description,
}: {
  headline: string;
  example1Headline: string;
  example1Description: string;
  example2Headline: string;
  example2Description: string;
  example3Headline?: string;
  example3Description?: string;
}) => {
  return (
    <Box
      sx={{
        maxWidth: 1024,
        margin: [0, 0, "0 auto"],
        p: 4,
        color: "monochrome800",
      }}
    >
      <HomepageSection>{headline}</HomepageSection>
      <Example headline={example1Headline} description={example1Description}>
        <ChartPublished
          dataSet="https://environment.ld.admin.ch/foen/ubd003701/1"
          meta={{
            title: {
              de: "Lärmbelastung durch Verkehr",
              en: "Traffic noise pollution",
              fr: "Exposition au bruit du trafic",
              it: "Esposizione al rumore del traffico",
            },
            description: {
              de: "",
              en: "",
              fr: "",
              it: "",
            },
          }}
          chartConfig={{
            fields: {
              x: {
                sorting: {
                  sortingType: "byMeasure",
                  sortingOrder: "desc",
                },
                componentIri:
                  "https://environment.ld.admin.ch/foen/ubd003701/verkehrsart",
              },
              y: {
                componentIri:
                  "https://environment.ld.admin.ch/foen/ubd003701/wert",
              },
              segment: {
                type: "grouped",
                palette: "category10",
                sorting: {
                  sortingType: "byTotalSize",
                  sortingOrder: "asc",
                },
                colorMapping: {
                  "https://environment.ld.admin.ch/foen/ubd003701/periode/D":
                    "#ff7f0e",
                  "https://environment.ld.admin.ch/foen/ubd003701/periode/N":
                    "#1f77b4",
                },
                componentIri:
                  "https://environment.ld.admin.ch/foen/ubd003701/periode",
              },
            },
            filters: {
              "https://environment.ld.admin.ch/foen/ubd003701/beurteilung": {
                type: "single",
                value:
                  "https://environment.ld.admin.ch/foen/ubd003701/beurteilung/%3EIGWLSV",
              },
              "https://environment.ld.admin.ch/foen/ubd003701/gemeindetype": {
                type: "single",
                value:
                  "https://environment.ld.admin.ch/foen/ubd003701/gemeindeTyp/CH",
              },
              "https://environment.ld.admin.ch/foen/ubd003701/laermbelasteteeinheit":
                {
                  type: "single",
                  value:
                    "https://environment.ld.admin.ch/foen/ubd003701/laermbelasteteEinheit/Pers",
                },
            },
            chartType: "column",
            interactiveFiltersConfig: {
              time: {
                active: false,
                presets: {
                  to: "",
                  from: "",
                  type: "range",
                },
                componentIri: "",
              },
              legend: {
                active: false,
                componentIri: "",
              },
              dataFilters: {
                active: true,
                componentIris: [
                  "https://environment.ld.admin.ch/foen/ubd003701/gemeindetype",
                  "https://environment.ld.admin.ch/foen/ubd003701/laermbelasteteeinheit",
                ],
              },
            },
          }}
          configKey={""}
        />
      </Example>
      <Example
        headline={example2Headline}
        description={example2Description}
        reverse
      >
        <ChartPublished
          dataSet="https://culture.ld.admin.ch/sfa/StateAccounts_Office/4/"
          meta={{
            title: {
              de: "Verteilung der Ausgaben und Einnahmen nach Ämtern",
              en: "Distribution of expenses and income by office",
              fr: "Répartition des dépenses et recettes par office",
              it: "Ripartizione delle spese e delle entrate per ufficio",
            },
            description: {
              de: "",
              en: "",
              fr: "",
              it: "",
            },
          }}
          chartConfig={{
            fields: {
              x: {
                componentIri: "http://www.w3.org/2006/time#Year",
              },
              y: {
                componentIri: "http://schema.org/amount",
              },
              segment: {
                type: "stacked",
                palette: "category10",
                sorting: {
                  sortingType: "byDimensionLabel",
                  sortingOrder: "asc",
                },
                colorMapping: {
                  "https://culture.ld.admin.ch/sfa/StateAccounts_Office/OperationCharacter/OC1":
                    "#1f77b4",
                  "https://culture.ld.admin.ch/sfa/StateAccounts_Office/OperationCharacter/OC2":
                    "#ff7f0e",
                },
                componentIri:
                  "https://culture.ld.admin.ch/sfa/StateAccounts_Office/operationcharacter",
              },
            },
            filters: {
              "https://culture.ld.admin.ch/sfa/StateAccounts_Office/office": {
                type: "single",
                value:
                  "https://culture.ld.admin.ch/sfa/StateAccounts_Office/Office/O7",
              },
            },
            chartType: "area",
            interactiveFiltersConfig: {
              time: {
                active: true,
                presets: {
                  to: "2013-12-31T23:00:00.000Z",
                  from: "1950-12-31T23:00:00.000Z",
                  type: "range",
                },
                componentIri: "",
              },
              legend: {
                active: true,
                componentIri: "",
              },
              dataFilters: {
                active: true,
                componentIris: [
                  "https://culture.ld.admin.ch/sfa/StateAccounts_Office/office",
                ],
              },
            },
          }}
          configKey={""}
        />
      </Example>
      {example3Headline && example3Description && (
        <Example
          headline={example3Headline}
          description={example3Description}
        ></Example>
      )}
    </Box>
  );
};

const Example = ({
  headline,
  description,
  reverse,
  children,
}: {
  headline: string;
  description: string;
  reverse?: boolean;
  children?: ReactNode;
}) => (
  <Flex
    sx={{
      flexDirection: ["column", "column", "row"],
      justifyContent: ["flex-start", "flex-start", "space-between"],
      alignItems: "center",
      mb: 6,
    }}
  >
    <Box
      sx={{
        order: reverse ? [1, 1, 2] : [2, 2, 1],
        minWidth: 0,
        width: ["100%", "100%", "50%"],
        ml: reverse ? [0, 0, 8] : 0,
        mr: reverse ? 0 : [0, 0, 8],
      }}
    >
      <Text
        as="h3"
        sx={{
          fontSize: [5, 5, 6],
          lineHeight: 1.5,
          fontFamily: "body",
          fontWeight: "bold",
          mb: [2, 2, 4],
        }}
      >
        {headline}
      </Text>
      <Text
        as="p"
        sx={{
          fontSize: 4,
          lineHeight: 1.5,
          fontFamily: "body",
          mt: 4,
          mb: [2, 2, 0],
        }}
      >
        {description}
      </Text>
    </Box>
    <Box
      sx={{
        order: reverse ? 1 : 2,
        borderWidth: "1px",
        borderStyle: "solid",
        borderColor: "monochrome300",
        boxShadow: "primary",
        width: ["100%", "100%", "50%"],
        mt: 2,
        minWidth: 0,
        maxWidth: ["unset", "unset", 512],
      }}
    >
      {children}
    </Box>
  </Flex>
);
