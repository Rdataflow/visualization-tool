import { Loading, Error } from "../components/hint";
import { markdown, ReactSpecimen } from "catalog";

export default () => markdown`

> Hints are components used to display an information.

They are variants of the \`Box\` components. As a convenience, they are also available as components with semantic names.

~~~
import { Box } from "rebass"

<Box variant="error">
  An error occurred!
</Box>
~~~
is equivalent to
~~~
import { Error } from "./components/hint"

<Error>
  An error occurred!
</Error>
~~~

## Loading indicator
${(
  <ReactSpecimen>
    <div style={{ height: 150 }}>
      <Loading>Updating data...</Loading>
    </div>
  </ReactSpecimen>
)}

## Error message
${(
  <ReactSpecimen>
    <div style={{ height: 150 }}>
      <Error>An Error occurred!</Error>
    </div>
  </ReactSpecimen>
)}
`;