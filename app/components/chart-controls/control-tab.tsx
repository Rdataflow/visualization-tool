import * as React from "react";
import { FieldProps } from "../../domain/config-form";
import { Flex, Text } from "rebass";
import { Icon, IconName } from "../../icons";
import { Button } from "rebass";
import { ComponentWithMeta, getDimensionLabel } from "../../domain";

export const ControlTab = ({
  iconName,
  component,
  value,
  checked,
  disabled,
  onClick
}: {
  iconName: IconName;
  component?: ComponentWithMeta;
  disabled?: boolean;
  onClick: (x: string) => void;
} & FieldProps) => {
  return (
    <Button
      variant="control"
      value={value}
      onClick={() => onClick(value as string)}
      bg={checked ? "blueGreyDarker" : "monochrome.100"}
    >
      <Flex justifyContent="flex-start" alignItems="center">
        <Flex
          width={32}
          height={32}
          sx={{ minWidth: 32, borderRadius: "bigger" }}
          bg={checked ? "primary.base" : "monochrome.100"}
          color={checked ? "monochrome.100" : "monochrome.700"}
          justifyContent="center"
          alignItems="center"
        >
          <Icon size={20} name={iconName} />
        </Flex>
        <Flex flexDirection="column" alignItems="flex-start" mx={2}>
          <Text
            variant="meta"
            sx={{ color: "monochrome.600", lineHeight: [1, 1, 1] }}
          >
            {iconName}
          </Text>
          <Text
            variant="paragraph1"
            sx={{
              color: "monochrome.900",
              lineHeight: [1, 1, 1],
              textAlign: "left"
            }}
          >
            {component && getDimensionLabel(component)}
          </Text>
        </Flex>
      </Flex>
    </Button>
  );
};