import { MDXProvider } from "@mdx-js/react";
import { ContentLayout } from "./layout";
import { Intro, Tutorial, Examples, Contribute } from "../components/homepage";

import { Box } from "rebass";
const defaultMDXComponents = {
  wrapper: ContentLayout,
  // p: (props: $FixMe) => <p {...props} style={{ color: "red" }} />,
  Box,
  Intro,
  Tutorial,
  Examples,
  Contribute
};

export const ContentMDXProvider = ({
  children
}: {
  children: React.ReactNode;
}) => {
  return (
    <MDXProvider components={defaultMDXComponents}>{children}</MDXProvider>
  );
};