import { keyframes } from "@emotion/react";
import { Trans } from "@lingui/macro";
import {
  Alert,
  AlertProps,
  useTheme,
  AlertTitle,
  Box,
  BoxProps,
  Typography,
  Link,
} from "@mui/material";
import { makeStyles } from "@mui/styles";
import { ReactNode } from "react";

import Flex from "@/components/flex";
import { Icon, IconName } from "@/icons";

export const Error = ({ children }: { children: ReactNode }) => (
  <Flex
    sx={{
      justifyContent: "center",
      alignItems: "center",
      color: "error",
      borderColor: "error",
    }}
  >
    {children}
  </Flex>
);

const useHintStyles = makeStyles({
  root: {
    width: "100%",
    height: "100%",
    color: "hint",
    margin: "auto",
    textAlign: "center",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    flexGrow: 1,
  },
});

export const Hint = ({ children }: { children: ReactNode }) => {
  const classes = useHintStyles();
  return <Flex className={classes.root}>{children}</Flex>;
};

const delayedShow = keyframes`
  0% { opacity: 0 }
  100% { opacity: 1 }
`;

const spin = keyframes`
  0% { transform: rotate(-360deg) },
  100% { transform: rotate(0deg) }
`;

const Spinner = ({ size = 48, ...props }: { size?: number } & BoxProps) => {
  return (
    <Flex
      {...props}
      sx={{
        animation: `1s linear infinite ${spin}`,
        ...props.sx,
      }}
    >
      <Icon name="loading" size={size} />
    </Flex>
  );
};

const useLoadingStyles = makeStyles({
  root: {
    width: "100%",
    height: "100%",
    margin: "auto",
    textAlign: "center",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    flexGrow: 1,
    padding: 2,
    opacity: 0,
    color: "hint.main",
  },
  overlay: {
    position: "absolute",
    backgroundColor: "grey.100",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
  },
});

export const Loading = ({ delayMs = 1000 }: { delayMs?: number }) => {
  const classes = useLoadingStyles();
  return (
    <Flex
      className={classes.root}
      sx={{
        animation: `0s linear ${delayMs}ms forwards ${delayedShow}`,
      }}
    >
      <Spinner />
      <Typography component="div" variant="body1">
        <Trans id="hint.loading.data">Loading data…</Trans>
      </Typography>
    </Flex>
  );
};

export const LoadingOverlay = () => {
  const classes = useLoadingStyles();

  return (
    <Box className={classes.overlay}>
      <Loading delayMs={0} />
    </Box>
  );
};

export const NoDataHint = () => (
  <Alert severity="info" icon={<Icon name="warning" size={64} />}>
    <AlertTitle>
      <Trans id="hint.nodata.title">
        No data available for current filter selection
      </Trans>
    </AlertTitle>
    <Trans id="hint.nodata.message">
      Please try with another combination of filters.
    </Trans>
  </Alert>
);

export const LoadingDataError = ({ message }: { message?: string }) => (
  <Alert severity="error" icon={<Icon name="hintWarning" size={64} />}>
    <AlertTitle>
      <Trans id="hint.dataloadingerror.title">Data loading error</Trans>
    </AlertTitle>
    <Trans id="hint.dataloadingerror.message">
      The data could not be loaded.
    </Trans>
    <Link
      typography="body2"
      target="_blank"
      href="https://visualization-tool.status.interactivethings.io/"
      sx={{ mt: "0.5em" }}
    >
      <Trans id="hint.dataloadingerror.status">
        Check our status page for more information.
        <Icon name="linkExternal" size={14} />
      </Trans>
    </Link>

    {message ? (
      <pre style={{ marginTop: "0.5rem", marginLeft: "1rem", marginBottom: 0 }}>
        {message}
      </pre>
    ) : null}
  </Alert>
);

export const LoadingGeoDimensionsError = () => (
  <Alert severity="error" icon={<Icon name="hintWarning" size={64} />}>
    <AlertTitle>
      <Trans id="hint.coordinatesloadingerror.title">
        Coordinates loading error
      </Trans>
    </AlertTitle>
    <Trans id="hint.coordinatesloadingerror.message">
      There was a problem with loading the coordinates from geographical
      dimensions.
    </Trans>
  </Alert>
);

export const ChartUnexpectedError = ({ error }: { error?: Error }) => {
  const theme = useTheme();
  return (
    <Alert severity="error" icon={<Icon name="hintWarning" size={64} />}>
      <AlertTitle>
        <Trans id="hint.chartunexpected.title">Unexpected error</Trans>
      </AlertTitle>
      <Trans id="hint.chartunexpected.message">
        An unexpected error occurred while displaying this chart.
      </Trans>
      {error ? (
        <Box
          component="pre"
          my={2}
          mx={2}
          fontSize={theme.typography.body2.fontSize}
        >
          {error.message}
        </Box>
      ) : null}
    </Alert>
  );
};

export const OnlyNegativeDataHint = () => (
  <Alert severity="warning" icon={<Icon name="datasetError" size={64} />}>
    <AlertTitle>
      <Trans id="hint.only.negative.data.title">Negative Values</Trans>
    </AlertTitle>
    <Trans id="hint.only.negative.data.message">
      Negative data values cannot be displayed with this chart type.
    </Trans>
  </Alert>
);

export const Success = () => (
  <Alert severity="success" icon={<Icon name="datasetSuccess" size={64} />}>
    <Trans id="hint.publication.success">
      Your visualization is now published. You can share and embed it using the
      URL or the options below.
    </Trans>
  </Alert>
);

const mkHint = (severity: AlertProps["severity"], displayName: string) => {
  const Component = ({
    iconName,
    children,
    iconSize = 24,
  }: {
    iconName: IconName;
    children: ReactNode;
    iconSize?: number;
  }) => (
    <Alert severity={severity} icon={<Icon name={iconName} size={iconSize} />}>
      {children}
    </Alert>
  );
  Component.displayName = displayName;
  return Component;
};

export const HintRed = mkHint("error", "HintRed");
export const HintYellow = mkHint("warning", "HintYellow");
export const HintBlue = mkHint("info", "HintBlue");
