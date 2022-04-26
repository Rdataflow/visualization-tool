import { Box } from "@mui/material";
import { markdown, ReactSpecimen } from "catalog";

import { Contribute, Examples, Intro, Tutorial } from "@/homepage";

export default () => markdown`
> The Homepage is the main page you see when you enter the Visualize app.

It consists of 4 different components: Intro, Tutorial, Examples and Contribute. In order to compose a complete Homepage, you have to use them all in the correct order.

You can either import them directly to JSX files or create a separate MDX file and use a MDXProvider to render the page (see ContentMDXProvider component).

${(
  <ReactSpecimen>
    <Box>
      <Intro
        title="Visualize Swiss Open Government Data"
        teaser="Create and embed visualizations from any dataset provided by the LINDAS Linked Data Service."
        buttonLabel="Create a visualization"
      />
      <Tutorial
        headline="Visualize data in just a few steps…"
        step1="Select a dataset"
        step2="Edit the visualization"
        step3="Share & embed"
      />
      <Examples
        headline="Make it your own…"
        example1Headline="Create beautiful visualizations"
        example1Description="Choose from a wide range of chart types and configure them according to your needs."
        example2Headline="Use powerful customizations"
        example2Description="With the help of custom filters and data segmentation, even complex issues can be visualized."
      />
      <Contribute
        headline="Would you like to visualize your own data?"
        description="Find out how you can integrate your data into the LINDAS Linked Data Service."
        buttonLabel="Learn how"
        buttonUrl="https://lindas.admin.ch/?lang=en"
      />
    </Box>
  </ReactSpecimen>
)}

## How to use
~~~
import { Contribute, Examples, Intro, Tutorial } from "../homepage";

<Intro
  title="Visualize Swiss Open Government Data"
  teaser="Create and embed visualizations from any dataset provided by the LINDAS Linked Data Service."
  buttonLabel="Create a visualization"
/>
<Tutorial
  headline="Visualize data in just a few steps…"
  step1="Select a dataset"
  step2="Edit the visualization"
  step3="Share & embed"
/>
<Examples
  headline="Make it your own…"
  example1Headline="Create beautiful visualizations"
  example1Description="Choose from a wide range of chart types and configure them according to your needs."
  example2Headline="Use powerful customizations"
  example2Description="With the help of custom filters and data segmentation, even complex issues can be visualized."
/>
<Contribute
  headline="Would you like to visualize your own data?"
  description="Find out how you can integrate your data into the LINDAS Linked Data Service."
  buttonLabel="Learn how"
  buttonUrl="https://lindas.admin.ch/?lang=en"
/>
~~~
`;
