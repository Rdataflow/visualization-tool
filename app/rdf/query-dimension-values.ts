import { SELECT } from "@tpluscode/sparql-builder";
import { Literal, NamedNode, Term } from "rdf-js";
import { cube } from "./namespace";
import { sparqlClient } from "./sparql-client";

interface DimensionValue {
  value: Literal | NamedNode<string>;
}

/**
 * Load dimension values.
 */
export async function loadDimensionValues({
  datasetIri,
  dimensionIri,
}: {
  datasetIri: Term | undefined;
  dimensionIri: Term | undefined;
}): Promise<Array<Literal | NamedNode>> {
  const query = SELECT.DISTINCT`?value`.WHERE`
    ${datasetIri} ${cube.observationSet} ?observationSet .
    ?observationSet ${cube.observation} ?observation .
    ?observation ${dimensionIri} ?value .
  `;

  let result: Array<DimensionValue> = [];

  try {
    result = (await query.execute(sparqlClient.query, {
      operation: "postUrlencoded",
    })) as unknown as Array<DimensionValue>;
  } catch {
    console.warn(`Failed to fetch dimension values for ${datasetIri}.`);
  } finally {
    return result.map((d) => d.value);
  }
}