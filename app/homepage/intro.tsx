import { Box, Button, Flex, Text } from "@theme-ui/components";
import { ReactNode } from "react";
import { IconAreaChart } from "../icons/ic-area-chart";
import { IconBarChart } from "../icons/ic-bar-chart";
import { IconColumnChart } from "../icons/ic-column-chart";
import { IconFilter } from "../icons/ic-filter";
import { IconLineChart } from "../icons/ic-line-chart";
import { IconPieChart } from "../icons/ic-pie-chart";
import { IconScatterplot } from "../icons/ic-scatterplot";
import { IconSegment } from "../icons/ic-segment";
import { IconTable } from "../icons/ic-table";
import { IconText } from "../icons/ic-text";
import { IconX } from "../icons/ic-x";
import { IconY } from "../icons/ic-y";
import { HintRed } from "../components/hint";
import { LocalizedLink } from "../components/links";

const ICONS = [
  { Icon: IconX, color: "#375172" },
  { Icon: IconScatterplot, color: "#32B8DF" },
  { Icon: IconColumnChart, color: "#F9C16E" },
  { Icon: IconPieChart, color: "#F38B3C" },
  { Icon: IconAreaChart, color: "#008F85" },
  { Icon: IconLineChart, color: "#C97146" },
  { Icon: IconTable, color: "#928D88" },
  { Icon: IconY, color: "#8D5A54" },
  { Icon: IconSegment, color: "#8D5A54" },
  { Icon: IconFilter, color: "#375172" },
  { Icon: IconText, color: "#32B8DF" },
  { Icon: IconBarChart, color: "#008F85" },
];

export const Intro = ({
  hint,
  title,
  teaser,
  buttonLabel,
}: {
  hint: string;
  title: string;
  teaser: string;
  buttonLabel: string;
}) => {
  return (
    <>
      <Box sx={{ maxWidth: "64rem", m: "0 auto" }}>
        <Box sx={{ mx: 4, mt: 6 }}>
          <HintRed iconName="hintWarning">{hint}</HintRed>
        </Box>
      </Box>
      <Box
        sx={{
          pb: [7, 8],
          margin: "0 auto",
          maxWidth: "105rem",
          display: "grid",
          alignItems: "center",
          justifyItems: "center",
          gridTemplateColumns: "repeat(16, minmax(16px, 1fr))",
          gridTemplateRows: "repeat(5, minmax(72px, auto))",
          gridTemplateAreas: [
            // Show 6 icons
            `'i0 . . . i1 . . . . . . i2 . . . .'
              't t t t t t t t t t t t t t t t'
              't t t t t t t t t t t t t t t t'
              't t t t t t t t t t t t t t t t'
              '. . i3 . . . . i4 . . . . . i5 . .'`,

            // Show 8 icons
            `'i0 . . . i1 . . . . . . i2 . . . .'
              '. t t t t t t t t t t t t t t i7'
              'i6 t t t t t t t t t t t t t t .'
              '. t t t t t t t t t t t t t t .'
              '. . i3 . . . . i4 . . . . . i5 . .'`,

            // Show 12 icons
            `'i0 . . . i1 . . . . . . i2 . . . i8'
              '. . i11 t t t t t t t t t t . . .'
              'i6 . . t t t t t t t t t t i7 . .'
              '. . . t t t t t t t t t t . . i9'
              '. i10 . i3 . . . i4 . . . . . i5 . .'`,
          ],
        }}
      >
        {ICONS.map(({ Icon, color }, i) => {
          return (
            <Box
              key={i}
              sx={{
                gridArea: `i${i}`,
                display: [
                  i > 5 ? "none" : "block",
                  i > 7 ? "none" : "block",
                  "block",
                ],
                placeSelf:
                  i % 2 === 0
                    ? "end end"
                    : i % 3 === 0
                    ? "start start"
                    : "center center",
              }}
            >
              <Icon color={color} size={24} />
            </Box>
          );
        })}

        <Box
          sx={{
            p: 4,
            gridArea: "t",
            maxWidth: "64rem",
          }}
        >
          <Title>{title}</Title>
          <Teaser>{teaser}</Teaser>
          <Flex sx={{ justifyContent: "center" }}>
            <LocalizedLink
              pathname="/[locale]/create/[chartId]"
              query={{ chartId: "new" }}
              passHref
            >
              <Button as="a" variant="primary">
                {buttonLabel}
              </Button>
            </LocalizedLink>
          </Flex>
        </Box>
      </Box>
    </>
  );
};

export const Title = ({ children }: { children: ReactNode }) => (
  <Text
    as="h1"
    sx={{
      color: "monochrome800",
      textAlign: "center",
      fontFamily: "body",
      lineHeight: 1.2,
      fontWeight: "bold",
      fontSize: [8, "3.5rem", "3.5rem"],
      mb: [4],
    }}
  >
    {children}
  </Text>
);
export const Teaser = ({ children }: { children: ReactNode }) => (
  <Text
    variant="paragraph1"
    sx={{
      fontSize: [4, 4, 4],
      textAlign: "center",
      color: "monochrome700",
      mb: [6, 5],
    }}
  >
    {children}
  </Text>
);