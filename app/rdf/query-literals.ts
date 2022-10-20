import { SELECT, sparql } from "@tpluscode/sparql-builder";
import { NamedNode, Literal } from "rdf-js";
import ParsingClient from "sparql-http-client/ParsingClient";

import batchLoad from "./batch-load";
import { pragmas } from "./create-source";

type PredicateOption = Record<string, NamedNode<string> | null>;

type ResourceLiteral<T extends PredicateOption> = {
  iri: NamedNode;
} & {
  [P in keyof T]?: Literal;
};

const buildResourceLiteralQuery = ({
  values,
  predicates,
}: {
  values: NamedNode<string>[];
  predicates: PredicateOption;
}) => {
  const q = SELECT.DISTINCT`?iri ${Object.keys(predicates).map((x) => `?${x}`)}`
    .WHERE`
      values ?iri {
        ${values}
      }

      ${Object.entries(predicates)
        .filter((x) => x[1])
        .map(([attr, namedNode]) => {
          return sparql`OPTIONAL { ?iri ${namedNode} ?${attr}. }`;
        })}
    `.prologue`${pragmas}`;

  return q;
};

/**
 * Load literals for a list of IDs (e.g. dimension values, positions, colors)
 */
export const loadResourceLiterals = async <Predicates extends PredicateOption>({
  ids,
  sparqlClient,
  predicates,
}: {
  ids: NamedNode[];
  sparqlClient: ParsingClient;
  predicates: Predicates;
}) => {
  return batchLoad<ResourceLiteral<Predicates>, NamedNode>({
    ids,
    sparqlClient,
    buildQuery: (values) => buildResourceLiteralQuery({ values, predicates }),
  });
};
