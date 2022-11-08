import { t } from "@lingui/macro";
import { CircularProgress, Theme, Typography } from "@mui/material";
import { makeStyles } from "@mui/styles";
import { extent, timeFormat, TimeLocaleObject, timeParse } from "d3";
import get from "lodash/get";
import React, {
  ChangeEvent,
  ReactNode,
  useCallback,
  useMemo,
  useState,
} from "react";

import Flex from "@/components/flex";
import {
  Checkbox,
  DayPickerField,
  Input,
  Label,
  Radio,
  Select,
  Slider,
  Switch,
} from "@/components/form";
import { ColorPickerMenu } from "@/configurator/components/chart-controls/color-picker";
import {
  AnnotatorTab,
  AnnotatorTabProps,
  ControlTab,
  OnOffControlTab,
} from "@/configurator/components/chart-controls/control-tab";
import {
  getTimeIntervalFormattedSelectOptions,
  getTimeIntervalWithProps,
} from "@/configurator/components/ui-helpers";
import {
  Option,
  OptionGroup,
  useActiveFieldField,
  useChartFieldField,
  useChartOptionRadioField,
  useChartOptionSliderField,
  useMetaField,
  useSingleFilterField,
} from "@/configurator/config-form";
import {
  isMultiFilterFieldChecked,
  useChartOptionBooleanField,
  useChartOptionSelectField,
  useMultiFilterContext,
  useSingleFilterSelect,
} from "@/configurator/config-form";
import {
  isConfiguring,
  useConfiguratorState,
} from "@/configurator/configurator-state";
import { FIELD_VALUE_NONE } from "@/configurator/constants";
import { truthy } from "@/domain/types";
import { useTimeFormatLocale } from "@/formatters";
import { DimensionMetadataFragment, TimeUnit } from "@/graphql/query-hooks";
import SvgIcEdit from "@/icons/components/IcEdit";
import { useLocale } from "@/locales/use-locale";
import { getPalette } from "@/palettes";

const useFieldEditIconStyles = makeStyles<Theme>((theme) => ({
  root: {
    color: theme.palette.primary.main,
  },
}));

const FieldEditIcon = () => {
  const classes = useFieldEditIconStyles();
  return <SvgIcEdit width={18} height={18} className={classes.root} />;
};

const useStyles = makeStyles<Theme>((theme) => ({
  loadingIndicator: {
    color: theme.palette.grey[700],
    display: "inline-block",
    marginTop: theme.spacing(1),
    marginLeft: theme.spacing(2),
  },
}));

export const ControlTabField = ({
  component,
  value,
  labelId,
}: {
  component?: DimensionMetadataFragment;
  value: string;
  labelId: string;
}) => {
  const field = useActiveFieldField({
    value,
  });

  return (
    <ControlTab
      component={component}
      value={`${field.value}`}
      labelId={labelId}
      checked={field.checked}
      onClick={field.onClick}
      rightIcon={<FieldEditIcon />}
    />
  );
};

export const OnOffControlTabField = ({
  value,
  label,
  icon,
  active,
}: {
  value: string;
  label: ReactNode;
  icon: string;
  active?: boolean;
}) => {
  const { checked, onClick } = useActiveFieldField({
    value,
  });

  return (
    <OnOffControlTab
      value={value}
      label={label}
      icon={icon}
      checked={checked}
      active={active}
      onClick={onClick}
    />
  );
};

export const DataFilterSelect = ({
  dimensionIri,
  label,
  options,
  id,
  disabled,
  isOptional,
  controls,
  optionGroups,
  tooltipText,
  onOpen,
}: {
  dimensionIri: string;
  label: string;
  options: Option[];
  id: string;
  disabled?: boolean;
  isOptional?: boolean;
  controls?: React.ReactNode;
  optionGroups?: [OptionGroup, Option[]][];
  tooltipText?: string;
  onOpen?: () => void;
}) => {
  const fieldProps = useSingleFilterSelect({ dimensionIri });

  const noneLabel = t({
    id: "controls.dimensionvalue.none",
    message: `No Filter`,
  });

  const optionalLabel = t({
    id: "controls.select.optional",
    message: `optional`,
  });

  const allOptions = useMemo(() => {
    return isOptional
      ? [
          {
            value: FIELD_VALUE_NONE,
            label: noneLabel,
            isNoneValue: true,
          },
          ...options,
        ]
      : options;
  }, [isOptional, options, noneLabel]);

  return (
    <Select
      id={id}
      label={isOptional ? `${label} (${optionalLabel})` : label}
      disabled={disabled}
      options={allOptions}
      controls={controls}
      optionGroups={optionGroups}
      tooltipText={tooltipText}
      onOpen={onOpen}
      {...fieldProps}
    />
  );
};

const formatDate = timeFormat("%Y-%m-%d");
const parseDate = timeParse("%Y-%m-%d");

export const DataFilterSelectDay = ({
  dimensionIri,
  label,
  options,
  disabled,
  isOptional,
  controls,
}: {
  dimensionIri: string;
  label: string;
  options: Option[];
  disabled?: boolean;
  isOptional?: boolean;
  controls?: React.ReactNode;
}) => {
  const fieldProps = useSingleFilterSelect({ dimensionIri });

  const noneLabel = t({
    id: "controls.dimensionvalue.none",
    message: `No Filter`,
  });

  const optionalLabel = t({
    id: "controls.select.optional",
    message: `optional`,
  });

  const allOptions = useMemo(() => {
    return isOptional
      ? [
          {
            value: FIELD_VALUE_NONE,
            label: noneLabel,
            isNoneValue: true,
          },
          ...options,
        ]
      : options;
  }, [isOptional, options, noneLabel]);

  const allOptionsSet = useMemo(() => {
    return new Set(
      allOptions
        .filter((x) => x.value !== FIELD_VALUE_NONE)
        .map((x) => {
          try {
            return x.value;
          } catch (e) {
            console.warn(`Bad value ${x.value}`);
            return;
          }
        })
        .filter(truthy)
    );
  }, [allOptions]);

  const isDisabled = useCallback(
    (date: Date) => {
      return !allOptionsSet.has(formatDate(date));
    },
    [allOptionsSet]
  );

  const dateValue = useMemo(() => {
    const parsed = fieldProps.value ? parseDate(fieldProps.value) : undefined;
    return parsed || new Date();
  }, [fieldProps.value]);

  const [minDate, maxDate] = useMemo(() => {
    const [min, max] = extent(Array.from(allOptionsSet));
    if (!min || !max) {
      return [];
    }
    return [new Date(min), new Date(max)] as const;
  }, [allOptionsSet]);

  return (
    <DayPickerField
      label={isOptional ? `${label} (${optionalLabel})` : label}
      disabled={disabled}
      controls={controls}
      onChange={fieldProps.onChange}
      name={dimensionIri}
      value={dateValue}
      isDayDisabled={isDisabled}
      minDate={minDate}
      maxDate={maxDate}
    />
  );
};

export const DataFilterSelectTime = ({
  dimensionIri,
  label,
  from,
  to,
  timeUnit,
  timeFormat,
  id,
  disabled,
  isOptional,
  controls,
  tooltipText,
}: {
  dimensionIri: string;
  label: string;
  from: string;
  to: string;
  timeUnit: TimeUnit;
  timeFormat: string;
  id: string;
  disabled?: boolean;
  isOptional?: boolean;
  controls?: React.ReactNode;
  tooltipText?: string;
}) => {
  const fieldProps = useSingleFilterSelect({ dimensionIri });
  const formatLocale = useTimeFormatLocale();

  const noneLabel = t({
    id: "controls.dimensionvalue.none",
    message: `No Filter`,
  });

  const optionalLabel = t({
    id: "controls.select.optional",
    message: `optional`,
  });

  const fullLabel = isOptional ? `${label} (${optionalLabel})` : label;

  const timeIntervalWithProps = useMemo(() => {
    return getTimeIntervalWithProps(
      from,
      to,
      timeUnit,
      timeFormat,
      formatLocale
    );
  }, [from, to, timeUnit, timeFormat, formatLocale]);

  const options = useMemo(() => {
    return timeIntervalWithProps.range > 100
      ? []
      : getTimeIntervalFormattedSelectOptions(timeIntervalWithProps);
  }, [timeIntervalWithProps]);

  const allOptions = useMemo(() => {
    return isOptional
      ? [
          {
            value: FIELD_VALUE_NONE,
            label: noneLabel,
            isNoneValue: true,
          },
          ...options,
        ]
      : options;
  }, [isOptional, options, noneLabel]);

  if (options.length) {
    return (
      <Select
        id={id}
        label={fullLabel}
        disabled={disabled}
        options={allOptions}
        sortOptions={false}
        controls={controls}
        tooltipText={tooltipText}
        {...fieldProps}
      />
    );
  }

  return (
    <TimeInput
      id={id}
      label={fullLabel}
      value={fieldProps.value}
      timeFormat={timeFormat}
      formatLocale={formatLocale}
      isOptional={isOptional}
      tooltipText={tooltipText}
      onChange={fieldProps.onChange}
    />
  );
};

export const TimeInput = ({
  id,
  label,
  value,
  timeFormat,
  formatLocale,
  isOptional,
  tooltipText,
  onChange,
}: {
  id: string;
  label: string;
  value: string | undefined;
  timeFormat: string;
  formatLocale: TimeLocaleObject;
  isOptional: boolean | undefined;
  tooltipText?: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
}) => {
  const [inputValue, setInputValue] = useState(
    value === FIELD_VALUE_NONE ? undefined : value
  );

  const [parseDateValue, formatDateValue] = useMemo(
    () => [formatLocale.parse(timeFormat), formatLocale.format(timeFormat)],
    [timeFormat, formatLocale]
  );

  const onInputChange = useCallback<(e: ChangeEvent<HTMLInputElement>) => void>(
    (e) => {
      setInputValue(e.currentTarget.value);

      if (e.currentTarget.value === "") {
        if (isOptional) {
          onChange(e);
        } else {
          setInputValue(value);
        }
      } else {
        const parsed = parseDateValue(e.currentTarget.value);
        const isValidDate =
          parsed !== null && formatDateValue(parsed) === e.currentTarget.value;

        if (isValidDate) {
          onChange(e);
        }
      }
    },
    [formatDateValue, onChange, parseDateValue, value, isOptional]
  );

  return (
    <Input
      name={id}
      label={label}
      value={inputValue}
      tooltipText={tooltipText}
      onChange={onInputChange}
    />
  );
};

export const AnnotatorTabField = ({
  value,
  emptyValueWarning,
  ...tabProps
}: {
  value: string;
  emptyValueWarning?: React.ReactNode;
} & Omit<AnnotatorTabProps, "onClick">) => {
  const fieldProps = useActiveFieldField({
    value,
  });

  const [state] = useConfiguratorState(isConfiguring);
  const locale = useLocale();
  const hasText = useMemo(() => {
    const key = value as "title" | "description";
    return state.meta[key]?.[locale] !== "";
  }, [state.meta, value, locale]);

  return (
    <AnnotatorTab
      {...tabProps}
      lowerLabel={
        hasText ? null : (
          <Typography variant="caption" color="warning.main">
            {emptyValueWarning}
          </Typography>
        )
      }
      value={`${fieldProps.value}`}
      checked={fieldProps.checked}
      onClick={fieldProps.onClick}
      rightIcon={<FieldEditIcon />}
    />
  );
};

export const MetaInputField = ({
  label,
  metaKey,
  locale,
  value,
  disabled,
  tooltipText,
}: {
  label: string | ReactNode;
  metaKey: string;
  locale: string;
  value?: string;
  disabled?: boolean;
  tooltipText?: string;
}) => {
  const field = useMetaField({
    metaKey,
    locale,
    value,
  });

  return (
    <Input
      label={label}
      {...field}
      disabled={disabled}
      tooltipText={tooltipText}
    />
  );
};

const useMultiFilterColorPicker = (value: string) => {
  const [state, dispatch] = useConfiguratorState(isConfiguring);
  const { dimensionIri, colorConfigPath } = useMultiFilterContext();
  const { activeField, chartConfig } = state;
  const onChange = useCallback(
    (color: string) => {
      if (activeField) {
        dispatch({
          type: "CHART_COLOR_CHANGED",
          value: {
            field: activeField,
            colorConfigPath,
            color,
            value,
          },
        });
      }
    },

    [colorConfigPath, dispatch, activeField, value]
  );

  const path = colorConfigPath ? `${colorConfigPath}.` : "";
  const color = get(
    chartConfig,
    `fields["${activeField}"].${path}colorMapping["${value}"]`
  );

  const palette = useMemo(() => {
    return getPalette(
      get(
        chartConfig,
        `fields["${activeField}"].${colorConfigPath ?? ""}.palette`
      )
    );
  }, [chartConfig, colorConfigPath, activeField]);

  const checkedState = dimensionIri
    ? isMultiFilterFieldChecked(chartConfig, dimensionIri, value)
    : null;

  return useMemo(
    () => ({
      color,
      palette,
      onChange,
      checked: checkedState,
    }),
    [color, palette, onChange, checkedState]
  );
};

export const MultiFilterFieldColorPicker = ({ value }: { value: string }) => {
  const { color, checked, palette, onChange } =
    useMultiFilterColorPicker(value);

  return color && checked ? (
    <ColorPickerMenu
      colors={palette}
      selectedColor={color}
      onChange={onChange}
    />
  ) : null;
};

export const SingleFilterField = ({
  dimensionIri,
  label,
  value,
  disabled,
}: {
  dimensionIri: string;
  label: string;
  value: string;
  disabled?: boolean;
}) => {
  const field = useSingleFilterField({
    dimensionIri,
    value,
  });

  return <Radio label={label} disabled={disabled} {...field} />;
};

export const ColorPickerField = ({
  field,
  path,
  label,
  disabled,
}: {
  field: string;
  path: string;
  label: ReactNode;
  disabled?: boolean;
}) => {
  const locale = useLocale();
  const [state, dispatch] = useConfiguratorState();

  const updateColor = useCallback(
    (value: string) =>
      dispatch({
        type: "CHART_OPTION_CHANGED",
        value: {
          locale,
          field,
          path,
          value,
        },
      }),
    [locale, dispatch, field, path]
  );

  if (state.state !== "CONFIGURING_CHART") {
    return null;
  }

  const color = get(state, `chartConfig.fields["${field}"].${path}`);

  return (
    <Flex
      sx={{
        justifyContent: "space-between",
        alignItems: "center",
        width: "100%",
      }}
    >
      <Label htmlFor="xyz">{label}</Label>
      <ColorPickerMenu
        colors={getPalette()}
        selectedColor={color}
        onChange={(c) => updateColor(c)}
        disabled={disabled}
      />
    </Flex>
  );
};

export const ChartFieldField = ({
  label,
  field,
  options,
  optional,
  disabled,
}: {
  label: string;
  field: string;
  options: Option[];
  optional?: boolean;
  disabled?: boolean;
}) => {
  const classes = useStyles();
  const { fetching, ...fieldProps } = useChartFieldField({ field });

  const noneLabel = t({
    id: "controls.dimension.none",
    message: `No dimension selected`,
  });

  const optionalLabel = t({
    id: "controls.select.optional",
    message: `optional`,
  });

  return (
    <Select
      key={`select-${field}-dimension`}
      id={field}
      label={
        <>
          {optional ? (
            <span>
              {label} ({optionalLabel})
            </span>
          ) : (
            <span>{label}</span>
          )}
          {fetching ? (
            <CircularProgress size={12} className={classes.loadingIndicator} />
          ) : null}
        </>
      }
      disabled={disabled || fetching}
      options={
        optional
          ? [
              {
                value: FIELD_VALUE_NONE,
                label: noneLabel,
                isNoneValue: true,
              },
              ...options,
            ]
          : options
      }
      {...fieldProps}
    />
  );
};

export const ChartOptionRadioField = ({
  label,
  field,
  path,
  value,
  defaultChecked,
  disabled = false,
}: {
  label: string;
  field: string | null;
  path: string;
  value: string;
  defaultChecked?: boolean;
  disabled?: boolean;
}) => {
  const fieldProps = useChartOptionRadioField({
    path,
    field,
    value,
  });

  return (
    <Radio
      disabled={disabled}
      label={label}
      {...fieldProps}
      checked={fieldProps.checked ?? defaultChecked}
    />
  );
};

export const ChartOptionSliderField = ({
  label,
  field,
  path,
  disabled = false,
  min = 0,
  max = 1,
  step = 0.1,
  defaultValue,
}: {
  label: string;
  field: string | null;
  path: string;
  disabled?: boolean;
  min?: number;
  max?: number;
  step?: number;
  defaultValue: number;
}) => {
  const fieldProps = useChartOptionSliderField({
    path,
    field,
    min,
    max,
    defaultValue,
  });

  return (
    <Slider
      disabled={disabled}
      label={label}
      min={min}
      max={max}
      step={step}
      {...fieldProps}
    />
  );
};

export const ChartOptionCheckboxField = ({
  label,
  field,
  path,
  defaultValue = false,
  disabled = false,
}: {
  label: string;
  field: string | null;
  path: string;
  defaultValue?: boolean;
  disabled?: boolean;
}) => {
  const fieldProps = useChartOptionBooleanField({
    field,
    path,
    defaultValue,
  });

  return (
    <Checkbox
      disabled={disabled}
      label={label}
      {...fieldProps}
      checked={fieldProps.checked ?? defaultValue}
    />
  );
};

export const ChartOptionSelectField = <ValueType extends {} = string>({
  id,
  label,
  field,
  path,
  disabled = false,
  options,
  getValue,
  getKey,
  isOptional,
}: {
  id: string;
  label: string | ReactNode;
  field: string;
  path: string;
  disabled?: boolean;
  options: Option[];
  getValue?: (x: string) => ValueType | undefined;
  getKey?: (x: ValueType) => string;
  isOptional?: boolean;
}) => {
  const fieldProps = useChartOptionSelectField({
    field,
    path,
    getValue,
    getKey,
  });
  const noneLabel = t({
    id: "controls.dimension.none",
    message: "None",
  });

  const optionalLabel = t({
    id: "controls.select.optional",
    message: "optional",
  });

  const allOptions = useMemo(() => {
    return isOptional
      ? [
          {
            value: FIELD_VALUE_NONE,
            label: noneLabel,
            isNoneValue: true,
          },
          ...options,
        ]
      : options;
  }, [isOptional, options, noneLabel]);

  return (
    <Select
      id={id}
      disabled={disabled}
      label={isOptional ? `${label} (${optionalLabel})` : label}
      options={allOptions}
      {...fieldProps}
    />
  );
};

export const ChartOptionSwitchField = ({
  label,
  field,
  path,
  defaultValue = false,
  disabled = false,
}: {
  label: string;
  field: string | null;
  path: string;
  defaultValue?: boolean;
  disabled?: boolean;
}) => {
  const fieldProps = useChartOptionBooleanField({
    field,
    path,
    defaultValue,
  });

  return (
    <Switch
      disabled={disabled}
      label={label}
      {...fieldProps}
      checked={fieldProps.checked ?? defaultValue}
    />
  );
};

export const OnOffTabField = () => {};
