import * as React from "react";
import {
  useCombobox,
  UseComboboxState,
  UseComboboxStateChangeOptions,
  UseComboboxStateChange,
} from "downshift";
import { useState } from "react";
import { Box, BoxProps, Flex, FlexProps, Input } from "@theme-ui/components";
import { Trans } from "@lingui/macro";

const menuStyles = {
  listStyleType: "none",
  marginLeft: 0,
  position: "absolute",
  top: "3rem",
  left: 0,
  right: 0,
};

const AutocompleteList = React.forwardRef<HTMLDivElement>(
  ({ ...boxProps }: BoxProps, ref) => {
    return (
      <Box
        ref={ref}
        as="ul"
        {...boxProps}
        sx={{
          pl: 0,
          width: "100%",
          listStyleType: "none",
          ...boxProps.sx,
          bg: "monochrome100",
          boxShadow: "primary",
          borderRadius: 10,
          overflow: "hidden",
        }}
      >
        {boxProps.children}
      </Box>
    );
  }
);

type AutocompleteResultProps = { icon?: React.ReactNode } & BoxProps;

const AutocompleteResult = React.forwardRef<
  HTMLDivElement,
  AutocompleteResultProps
>(({ icon, ...boxProps }, ref) => {
  return (
    <Flex
      ref={ref}
      as="li"
      {...boxProps}
      sx={{
        cursor: "pointer",
        alignItems: "center",
        width: "100%",
        px: 4,
        py: 4,
      }}
    >
      {icon ? <Box sx={{ width: 24, height: 24, mr: 2 }}>{icon}</Box> : null}
      {boxProps.children}
    </Flex>
  );
});

export type AutocompleteProps<TItem> = {
  items: TItem[];
  placeholder?: string;
  getItemSearchText: (item: TItem) => string;
  getItemIcon?: (item: TItem) => React.ReactNode;
  onSelectedItemChange: (item: UseComboboxStateChange<TItem>) => void;
  sx?: FlexProps["sx"];
  generateItems?: (text: string) => TItem[];
};

function Autocomplete<TItem>({
  items,
  placeholder,
  getItemSearchText,
  getItemIcon,
  onSelectedItemChange,
  sx,
  generateItems,
}: AutocompleteProps<TItem>) {
  const [inputItems, setInputItems] = useState(items);

  const stateReducer = React.useCallback(
    (
      state: UseComboboxState<TItem>,
      actionAndChanges: UseComboboxStateChangeOptions<TItem>
    ) => {
      const { type, changes } = actionAndChanges;
      // returning an uppercased version of the item string.
      switch (type) {
        // also on selection.
        case useCombobox.stateChangeTypes.ItemClick:
        case useCombobox.stateChangeTypes.InputKeyDownEnter:
        case useCombobox.stateChangeTypes.InputBlur:
          return {
            ...changes,
            // if we had an item selected.
            ...(changes.selectedItem && {
              // we will show it uppercased.
              inputValue: getItemSearchText(changes.selectedItem),
            }),
          };
        default:
          return changes; // otherwise business as usual.
      }
    },
    [getItemSearchText]
  );
  const {
    isOpen,
    getMenuProps,
    getInputProps,
    getComboboxProps,
    highlightedIndex,
    getItemProps,
    inputValue,
  } = useCombobox({
    items: inputItems,
    stateReducer,
    onSelectedItemChange,
    onInputValueChange: ({ inputValue }) => {
      if (!inputValue) {
        return;
      }
      const inputItems = items.filter((item) => {
        const searchText = getItemSearchText(item);
        return searchText.toLowerCase().includes(inputValue.toLowerCase());
      });
      setInputItems(
        (generateItems ? generateItems(inputValue) : []).concat(inputItems)
      );
    },
  });

  return (
    <Flex sx={{ flexDirection: "column", position: "relative", ...sx }}>
      <div {...getComboboxProps()}>
        <Input
          {...getInputProps()}
          placeholder={placeholder}
          sx={{ bg: "monochrome100", width: 400, borderColor: "monochrome300" }}
        />
      </div>
      <AutocompleteList {...getMenuProps()} sx={menuStyles}>
        {isOpen ? (
          inputItems.length > 0 ? (
            inputItems.map((item, index) => (
              <AutocompleteResult
                style={
                  highlightedIndex === index
                    ? { backgroundColor: "#bde4ff" }
                    : {}
                }
                key={`${item}${index}`}
                icon={getItemIcon ? getItemIcon(item) : null}
                {...getItemProps({ item, index })}
              >
                {getItemSearchText(item)}
              </AutocompleteResult>
            ))
          ) : (
            <AutocompleteResult>
              <Trans key="autocomplete.no-result">No results</Trans>
            </AutocompleteResult>
          )
        ) : null}
      </AutocompleteList>
    </Flex>
  );
}

export default Autocomplete;