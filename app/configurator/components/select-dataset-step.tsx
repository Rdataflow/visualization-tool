import { t, Trans } from "@lingui/macro";
import { Box, Button, Theme, Typography } from "@mui/material";
import { makeStyles } from "@mui/styles";
import { AnimatePresence } from "framer-motion";
import Head from "next/head";
import NextLink from "next/link";
import { Router, useRouter } from "next/router";
import React, { useMemo } from "react";
import { useDebounce } from "use-debounce";

import Flex from "@/components/flex";
import { Footer } from "@/components/footer";
import {
  BrowseStateProvider,
  buildURLFromBrowseState,
  DataCubeAbout,
  DatasetResults,
  SearchDatasetControls,
  SearchDatasetInput,
  SearchFilters,
  useBrowseContext,
} from "@/configurator/components/dataset-browse";
import { DataSetMetadata } from "@/configurator/components/dataset-metadata";
import { DataSetPreview } from "@/configurator/components/dataset-preview";
import {
  PanelBannerWrapper,
  PanelLayout,
  PanelLeftWrapper,
  PanelMiddleWrapper,
} from "@/configurator/components/layout";
import {
  bannerPresenceProps,
  MotionBox,
  navPresenceProps,
} from "@/configurator/components/presence";
import { useDataCubesQuery } from "@/graphql/query-hooks";
import { Icon } from "@/icons";
import { useConfiguratorState, useLocale } from "@/src";

import { useRedirectToVersionedCube } from "./use-redirect-to-versioned-cube";

const softJSONParse = (v: string) => {
  try {
    return JSON.parse(v);
  } catch (e) {
    return null;
  }
};

const useStyles = makeStyles<Theme, { datasetPresent: boolean }>((theme) => ({
  panelLayout: {
    width: "100%",
    margin: "auto",
    left: 0,
    right: 0,
    position: "static",
    // FIXME replace 96px with actual header size
    marginTop: 96,
    height: "auto",
  },
  panelLeft: {
    backgroundColor: "transparent",
    paddingTop: ({ datasetPresent }) =>
      datasetPresent ? 48 : theme.spacing(5),
    boxShadow: "none",
    borderRightColor: theme.palette.grey[300],
    borderRightStyle: "solid",
    borderRightWidth: 1,
    transition: "padding-top 0.5s ease",
  },
  panelMiddle: {
    paddingLeft: 0,
    paddingTop: ({ datasetPresent }) =>
      datasetPresent ? 48 : theme.spacing(5),
    gridColumnStart: "middle",
    gridColumnEnd: "right",
    transition: "padding-top 0.5s ease",
  },
  panelBanner: {
    display: "flex",
    paddingLeft: 18,
    paddingRight: 18,
  },
  panelBannerContent: {
    flexDirection: "column",
    justifyContent: "center",
    maxWidth: 720,
    [theme.breakpoints.down("xs")]: {
      marginLeft: 0,
      marginRight: 0,
    },
    [theme.breakpoints.between("sm", "lg")]: {
      marginLeft: "auto",
      marginRight: "auto",
    },
    [theme.breakpoints.up("lg")]: {
      marginLeft: "20rem",
      marginRight: "20rem",
    },
  },
  panelBannerTitle: {
    color: theme.palette.grey[700],
    marginBottom: theme.spacing(4),
  },
  panelBannerDescription: {
    color: theme.palette.grey[600],
    marginBottom: theme.spacing(3),
  },
  filters: {
    display: "block",
    marginLeft: theme.spacing(4),
    marginBottom: theme.spacing(4),
    color: theme.palette.grey[800],
  },
}));

export const formatBackLink = (
  query: Router["query"]
): React.ComponentProps<typeof NextLink>["href"] => {
  const backParameters = softJSONParse(query.previous as string);
  if (!backParameters) {
    return "/browse";
  }
  return buildURLFromBrowseState(backParameters);
};

const SelectDatasetStepContent = () => {
  const locale = useLocale();
  const [configState] = useConfiguratorState();

  const browseState = useBrowseContext();
  const { search, order, includeDrafts, filters, dataset } = browseState;

  const [debouncedQuery] = useDebounce(search, 500, {
    leading: true,
  });
  const router = useRouter();
  const classes = useStyles({ datasetPresent: !!dataset });
  const backLink = useMemo(() => {
    return formatBackLink(router.query);
  }, [router.query]);
  // Use the debounced query value here only!
  const [datacubesQuery] = useDataCubesQuery({
    variables: {
      sourceType: configState.dataSource.type,
      sourceUrl: configState.dataSource.url,
      locale,
      query: debouncedQuery,
      order,
      includeDrafts,
      filters: filters
        ? filters.map((filter) => {
            return { type: filter.__typename, value: filter.iri };
          })
        : [],
    },
  });

  useRedirectToVersionedCube({
    dataSource: configState.dataSource,
    datasetIri: dataset,
  });

  if (configState.state !== "SELECTING_DATASET") {
    return null;
  }

  return (
    <PanelLayout className={classes.panelLayout}>
      <PanelLeftWrapper className={classes.panelLeft}>
        <AnimatePresence exitBeforeEnter>
          {dataset ? (
            <MotionBox
              {...navPresenceProps}
              px={4}
              key="dataset-metadata"
              custom={dataset}
            >
              <NextLink passHref href={backLink}>
                <Button
                  variant="contained"
                  color="secondary"
                  startIcon={<Icon name="chevronLeft" size={12} />}
                >
                  <Trans id="dataset-preview.back-to-results">
                    Back to the list
                  </Trans>
                </Button>
              </NextLink>
              <DataSetMetadata
                sx={{ mt: "3rem" }}
                dataSetIri={dataset}
                dataSource={configState.dataSource}
              />
            </MotionBox>
          ) : (
            <MotionBox
              key="search-filters"
              {...navPresenceProps}
              custom={false}
            >
              <SearchFilters data={datacubesQuery.data} />
            </MotionBox>
          )}
        </AnimatePresence>
      </PanelLeftWrapper>
      <AnimatePresence>
        {!dataset && (
          <MotionBox
            {...bannerPresenceProps}
            key="banner"
            sx={{ width: "100vw" }}
          >
            <PanelBannerWrapper className={classes.panelBanner}>
              <Flex className={classes.panelBannerContent}>
                <Typography variant="h1" className={classes.panelBannerTitle}>
                  Swiss Open Government Data
                </Typography>
                <Typography
                  variant="body2"
                  className={classes.panelBannerDescription}
                >
                  <Trans id="browse.datasets.description">
                    Explore datasets provided by the LINDAS Linked Data Service
                    by either filtering by categories or organisations or search
                    directly for specific keywords. Click on a dataset to see
                    more detailed information and start creating your own
                    visualizations.
                  </Trans>
                </Typography>
                <SearchDatasetInput browseState={browseState} />
              </Flex>
            </PanelBannerWrapper>
          </MotionBox>
        )}
      </AnimatePresence>
      <PanelMiddleWrapper className={classes.panelMiddle}>
        <Box sx={{ maxWidth: 1040 }}>
          <AnimatePresence exitBeforeEnter>
            {dataset ? (
              <MotionBox {...navPresenceProps} key="preview">
                <DataSetPreview
                  dataSetIri={dataset}
                  dataSource={configState.dataSource}
                />
              </MotionBox>
            ) : (
              <MotionBox {...navPresenceProps}>
                {filters.length > 0 && (
                  <Typography
                    key="filters"
                    className={classes.filters}
                    variant="h1"
                  >
                    {filters
                      .filter(
                        (f): f is Exclude<typeof f, DataCubeAbout> =>
                          f.__typename !== "DataCubeAbout"
                      )
                      .map((f) => f.label)
                      .join(", ")}
                  </Typography>
                )}

                <SearchDatasetControls
                  browseState={browseState}
                  searchResult={datacubesQuery.data}
                />
                <DatasetResults key="results" query={datacubesQuery} />
              </MotionBox>
            )}
          </AnimatePresence>
        </Box>
      </PanelMiddleWrapper>
    </PanelLayout>
  );
};

const PageTitle = () => {
  const { search, filters } = useBrowseContext();
  return (
    <Head>
      <title key="title">
        {search
          ? `"${search}"`
          : filters?.length > 0 && filters[0].__typename !== "DataCubeAbout"
          ? filters[0].label
          : t({ id: "browse.datasets.all-datasets" })}{" "}
        - visualize.admin.ch
      </title>
    </Head>
  );
};

export const SelectDatasetStep = () => {
  return (
    <BrowseStateProvider>
      <PageTitle />
      <SelectDatasetStepContent />
      <Box
        sx={{
          borderTop: "2px solid rgba(0,0,0,0.05)",
          mt: 8,
        }}
      >
        <Footer
          sx={{
            borderTopWidth: 0,
            ml: "auto",
            mr: "auto",
            width: "100%",
          }}
        />
      </Box>
    </BrowseStateProvider>
  );
};
