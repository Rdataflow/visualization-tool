import { Trans } from "@lingui/macro";
import {
  Box,
  Link,
  Link as MUILink,
  LinkProps,
  Stack,
  Typography,
  TypographyProps,
} from "@mui/material";
import sortBy from "lodash/sortBy";
import NextLink from "next/link";
import React, { ReactNode } from "react";

import Tag from "@/components/tag";
import { DataCubeMetadata } from "@/domain/data";
import { useFormatDate } from "@/formatters";
import { Icon } from "@/icons";
import { useLocale } from "@/locales/use-locale";
import { makeOpenDataLink } from "@/utils/opendata";

export const DatasetMetadata = ({
  cube,
  showTitle,
}: {
  cube: DataCubeMetadata;
  showTitle: boolean;
}) => {
  const locale = useLocale();
  const formatDate = useFormatDate();

  const openDataLink = cube ? makeOpenDataLink(locale, cube) : null;

  return (
    <div>
      {showTitle ? (
        <Typography variant="h4" sx={{ mb: 3 }} color="grey.700">
          {cube.title}
        </Typography>
      ) : null}

      <Stack spacing={2}>
        {cube.publisher && (
          <div>
            <DatasetMetadataTitle>
              <Trans id="dataset.metadata.source">Source</Trans>
            </DatasetMetadataTitle>
            <DatasetMetadataBody>
              <Box
                component="span"
                sx={{ "> a": { color: "grey.900" } }}
                dangerouslySetInnerHTML={{
                  __html: cube.publisher,
                }}
              />
            </DatasetMetadataBody>
          </div>
        )}

        <div>
          <DatasetMetadataTitle>
            <Trans id="dataset.metadata.date.created">Date Created</Trans>
          </DatasetMetadataTitle>
          <DatasetMetadataBody>
            {cube.datePublished ? formatDate(cube.datePublished) ?? "–" : "–"}
          </DatasetMetadataBody>
        </div>

        <div>
          <DatasetMetadataTitle>
            <Trans id="dataset.metadata.version">Version</Trans>
          </DatasetMetadataTitle>
          <DatasetMetadataBody>{cube.version ?? "–"}</DatasetMetadataBody>
        </div>

        <div>
          <DatasetMetadataTitle>
            <Trans id="dataset.metadata.email">Contact points</Trans>
          </DatasetMetadataTitle>
          <DatasetMetadataBody>
            {cube.contactPoint?.email && cube.contactPoint.name ? (
              <DatasetMetadataLink
                href={`mailto:${cube.contactPoint.email}`}
                label={cube.contactPoint.name ?? cube.contactPoint.email}
              />
            ) : (
              "–"
            )}
          </DatasetMetadataBody>
        </div>

        <div>
          <DatasetMetadataTitle>
            <Trans id="dataset.metadata.furtherinformation">
              Further information
            </Trans>
          </DatasetMetadataTitle>
          <DatasetMetadataBody>
            {cube.landingPage ? (
              <DatasetMetadataLink
                href={cube.landingPage}
                external
                label={
                  <Trans id="dataset.metadata.learnmore">
                    Learn more about the dataset
                  </Trans>
                }
              />
            ) : (
              "–"
            )}

            {openDataLink ? (
              <>
                <br />
                <DatasetMetadataLink
                  external
                  label="OpenData.swiss"
                  href={openDataLink}
                />
              </>
            ) : null}
          </DatasetMetadataBody>
        </div>
        <Stack spacing={2}>
          <DatasetMetadataTitle>
            <Trans id="dataset-preview.keywords">Keywords</Trans>
          </DatasetMetadataTitle>
          <DatasetTags cube={cube} />
        </Stack>
      </Stack>
    </div>
  );
};

const DatasetMetadataTitle = ({ children }: { children: ReactNode }) => (
  <Typography variant="body2" fontWeight={700} sx={{ color: "grey.700" }}>
    {children}
  </Typography>
);

const DatasetMetadataBody = ({
  children,
  sx,
}: {
  children: ReactNode;
  sx?: TypographyProps["sx"];
}) => (
  <Typography variant="body2" sx={{ color: "grey.900", ...sx }}>
    {children}
  </Typography>
);

const DatasetMetadataLink = ({
  href,
  label,
  external,
  ...props
}: {
  href: string;
  label: string | React.ReactElement;
  external?: boolean;
} & LinkProps) => (
  <Link
    underline="hover"
    color="primary"
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    sx={{ display: "inline-flex", alignItems: "center", gap: 1 }}
    {...props}
  >
    {label}
    {external ? <Icon name="linkExternal" size={12} /> : null}
  </Link>
);

const DatasetTags = ({ cube }: { cube: DataCubeMetadata }) => {
  return (
    <Stack spacing={1} direction="column">
      {cube.creator?.iri && (
        <DatasetMetadataTag
          type="organization"
          iri={cube.creator.iri}
          label={cube.creator.label}
        />
      )}
      {cube.themes &&
        sortBy(cube.themes, (d) => d.label).map(
          (t) =>
            t.iri &&
            t.label && (
              <DatasetMetadataTag
                key={t.iri}
                type="theme"
                iri={t.iri}
                label={t.label}
              />
            )
        )}
    </Stack>
  );
};

type DatasetMetadataTagProps = {
  type: "organization" | "theme";
  iri: string;
  label?: string | null;
};

const DatasetMetadataTag = (props: DatasetMetadataTagProps) => {
  const { type, iri, label } = props;

  return (
    <NextLink
      key={iri}
      href={`/browse/${type}/${encodeURIComponent(iri)}`}
      passHref
      legacyBehavior
    >
      <Tag
        component={MUILink}
        // @ts-ignore
        underline="none"
        type={type}
        title={label ?? undefined}
        sx={{
          maxWidth: "100%",
          display: "flex",
          whiteSpace: "nowrap",
          textOverflow: "ellipsis",
          overflow: "hidden",
        }}
      >
        {label}
      </Tag>
    </NextLink>
  );
};
