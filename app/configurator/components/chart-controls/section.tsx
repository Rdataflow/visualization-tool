import {
  Box,
  BoxProps,
  Collapse,
  Skeleton,
  Theme,
  Typography,
  TypographyProps,
} from "@mui/material";
import { makeStyles } from "@mui/styles";
import clsx from "clsx";
import {
  ElementType,
  forwardRef,
  HTMLProps,
  ReactNode,
  useContext,
  useMemo,
} from "react";
import React from "react";

import { Icon, IconName } from "@/icons";
import SvgIcAdd from "@/icons/components/IcAdd";
import SvgIcMinus from "@/icons/components/IcMinus";

import useDisclosure from "../use-disclosure";

const useControlSectionStyles = makeStyles<Theme, { isHighlighted?: boolean }>(
  (theme) => ({
    controlSection: {
      borderTopColor: theme.palette.grey[500],
      borderTopWidth: "1px",
      borderTopStyle: "solid",
      overflowX: "hidden",
      overflowY: "auto",
      flexShrink: 0,
      backgroundColor: ({ isHighlighted }) =>
        isHighlighted ? "primaryLight" : "grey.100",
    },
  })
);

const useSectionTitleStyles = makeStyles<
  Theme,
  {
    disabled?: boolean;
    color?: string;
    sectionOpen: boolean;
    gutterBottom: boolean;
    collapse?: boolean;
  }
>((theme) => ({
  root: {
    display: "flex",
    alignItems: "center",
    width: "100%",
    padding: theme.spacing(4),
    paddingBottom: theme.spacing(4),
    marginBottom: ({ gutterBottom }) => (gutterBottom ? 0 : -theme.spacing(2)),
    transition: "padding-bottom 300ms ease",
    border: "none",
    justifyContent: "flex-start",
    "&:hover": {
      cursor: ({ collapse }) => (collapse ? "pointer" : "initial"),
      backgroundColor: ({ collapse }) =>
        collapse ? theme.palette.grey[200] : "transparent",

      "& $icon": {
        color: theme.palette.grey[900],
      },
    },
  },
  text: {
    "& > svg:first-of-type": {
      marginRight: theme.spacing(2),
    },
    flexGrow: 1,
    display: "flex",
    alignItems: "center",
    color: ({ disabled, color }) =>
      disabled ? "grey.600" : color ?? "grey.800",
  },
  icon: {
    justifySelf: "flex-end",
    color: theme.palette.grey[600],
  },
}));

const ControlSectionContext = React.createContext({
  open: () => {},
  isOpen: false,
  close: () => {},
  setOpen: (_v: boolean | ((oldV: boolean) => boolean)) => {},
  collapse: true as boolean | undefined,
});

export const ControlSection = forwardRef<
  HTMLDivElement,
  {
    children: ReactNode;
    isHighlighted?: boolean;
    sx?: BoxProps["sx"];
    collapse?: boolean;
  } & Omit<HTMLProps<HTMLDivElement>, "ref">
>(({ role, children, isHighlighted, sx, collapse = false, ...props }, ref) => {
  const classes = useControlSectionStyles({ isHighlighted });
  const disclosure = useDisclosure(true);
  const ctx = useMemo(
    () => ({ ...disclosure, collapse }),
    [collapse, disclosure]
  );
  return (
    <ControlSectionContext.Provider value={ctx}>
      <Box
        ref={ref}
        role={role}
        data-testid="controlSection"
        sx={sx}
        {...props}
        className={clsx(classes.controlSection, props.className)}
      >
        {children}
      </Box>
    </ControlSectionContext.Provider>
  );
});

type ControlSectionContentProps = {
  component?: ElementType;
  role?: string;
  ariaLabelledBy?: string;
  children: ReactNode;
  // large for specific purposes, e.g. base layer map options
  // default for right panel options
  // none for left panel options
  gap?: "large" | "default" | "none";
  px?: "small" | "default";
  sx?: BoxProps["sx"];
} & BoxProps;

const useControlSectionContentStyles = makeStyles<
  Theme,
  Pick<ControlSectionContentProps, "gap" | "px">
>((theme) => ({
  controlSectionContent: {
    display: "flex",
    flexDirection: "column",
    gap: ({ gap }) =>
      theme.spacing(gap === "large" ? 3 : gap === "default" ? 2 : 0),
    padding: ({ px }) =>
      `0 ${theme.spacing(px === "small" ? 2 : 4)} ${theme.spacing(4)}`,
  },
}));

export const ControlSectionContent = ({
  component,
  role,
  ariaLabelledBy,
  children,
  gap = "default",
  px,
  sx,
  ...props
}: ControlSectionContentProps) => {
  const classes = useControlSectionContentStyles({ gap, px });
  const disclosure = useControlSectionContext();
  return (
    <Collapse in={disclosure.isOpen}>
      <Box
        component={component}
        role={role}
        aria-labelledby={ariaLabelledBy}
        {...props}
        className={classes.controlSectionContent}
        sx={sx}
      >
        {children}
      </Box>
    </Collapse>
  );
};

const useControlSectionContext = () => useContext(ControlSectionContext);

export const SectionTitle = ({
  color,
  iconName,
  titleId,
  disabled,
  children,
  sx,
  right,
  gutterBottom = true,
}: {
  color?: string;
  iconName?: IconName;
  titleId?: string;
  disabled?: boolean;
  children: ReactNode;
  sx?: TypographyProps["sx"];
  right?: React.ReactNode;
  gutterBottom?: boolean;
}) => {
  const { setOpen, isOpen, collapse } = useControlSectionContext();
  const classes = useSectionTitleStyles({
    disabled,
    color,
    sectionOpen: isOpen,
    gutterBottom,
    collapse,
  });
  return (
    <div
      className={classes.root}
      onClick={collapse ? () => setOpen((v) => !v) : undefined}
    >
      <Typography variant="h5" id={titleId} className={classes.text} sx={sx}>
        {iconName ? <Icon name={iconName} /> : null}
        {children}
      </Typography>
      {right}
      <span className={classes.icon}>
        {collapse ? isOpen ? <SvgIcMinus /> : <SvgIcAdd /> : null}
      </span>
    </div>
  );
};

export const ControlSectionSkeleton = ({
  sx,
}: {
  sx?: React.ComponentProps<typeof ControlSection>["sx"];
}) => (
  <ControlSection sx={{ mt: 2, ...sx }}>
    <ControlSectionContent px="small" gap="none">
      <Typography variant="h1">
        <Skeleton sx={{ bgcolor: "grey.300" }} />
      </Typography>{" "}
      <Skeleton
        sx={{ bgcolor: "grey.300" }}
        variant="rectangular"
        width="100%"
        height={118}
      />
    </ControlSectionContent>
  </ControlSection>
);
