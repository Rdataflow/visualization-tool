import { literal } from "@rdfjs/data-model";
import {
  DataCube as RDFDataCube,
  DataCubeEntryPoint,
  Dimension as RDFDimension,
  Measure as RDFMeasure
} from "@zazuko/query-rdf-data-cube";
import { GraphQLJSONObject } from "graphql-type-json";
import { Filters, parseObservationValue } from "../domain";
import { SPARQL_ENDPOINT } from "../domain/env";
import { locales, parseLocaleString } from "../locales/locales";
import { QueryResolvers, Resolvers, DataCubeResolvers } from "./resolver-types";
import { ResolvedDimension, ResolvedMeasure } from "./shared-types";

let entryPointCache = new Map<string, DataCubeEntryPoint>();
const getEntryPoint = (
  _locale: string | null | undefined
): DataCubeEntryPoint => {
  const locale = parseLocaleString(_locale || "");

  let entry = entryPointCache.get(locale);

  if (entry) {
    return entry;
  }

  entry = new DataCubeEntryPoint(SPARQL_ENDPOINT, {
    languages: [locale, ...locales.filter(l => l !== locale), ""],
    extraMetadata: [
      {
        variable: "contact",
        iri: "https://pcaxis.described.at/contact",
        multilang: true
      },
      {
        variable: "source",
        iri: "https://pcaxis.described.at/source",
        multilang: true
      },
      {
        variable: "survey",
        iri: "https://pcaxis.described.at/survey",
        multilang: true
      },
      {
        variable: "database",
        iri: "https://pcaxis.described.at/database",
        multilang: true
      },
      {
        variable: "unit",
        iri: "https://pcaxis.described.at/unit",
        multilang: true
      },
      {
        variable: "note",
        iri: "https://pcaxis.described.at/note",
        multilang: true
      },
      {
        variable: "dateCreated",
        iri: "http://schema.org/dateCreated",
        multilang: false
      },
      { variable: "dateModified", iri: "http://schema.org/dateModified" },
      {
        variable: "description",
        iri: "http://www.w3.org/2000/01/rdf-schema#comment",
        multilang: true
      }
    ]
  });

  entryPointCache.set(locale, entry);

  return entry;
};

/** Cache value data type per Dimension IRI */
let dataTypeCache = new Map<string, string | undefined>();
const getDataTypeOfDimension = async (
  cube: RDFDataCube,
  dimension: RDFDimension
) => {
  if (dataTypeCache.has(dimension.iri.value)) {
    return dataTypeCache.get(dimension.iri.value);
  }

  const [exampleValue] = await cube
    .query()
    .select({ d: dimension })
    .limit(1)
    .execute();

  const dataType =
    exampleValue.d.value.termType === "Literal"
      ? exampleValue.d.value.datatype.value
      : undefined;

  dataTypeCache.set(dimension.iri.value, dataType);

  return dataType;
};

const constructFilters = async (cube: RDFDataCube, filters: Filters) => {
  const dimensions = await cube.dimensions();
  const dimensionsByIri = dimensions.reduce<
    Record<string, RDFDimension | undefined>
  >((acc, d) => {
    acc[d.iri.value] = d;
    return acc;
  }, {});

  const filterEntries = await Promise.all(
    Object.entries(filters).map(async ([dimIri, filter]) => {
      const dimension = dimensionsByIri[dimIri];

      if (!dimension) {
        return [];
      }

      const dataType = await getDataTypeOfDimension(cube, dimension);

      const selectedValues =
        filter.type === "single"
          ? [dataType ? literal(filter.value, dataType) : filter.value]
          : filter.type === "multi"
          ? // If values is an empty object, we filter by something that doesn't exist
            Object.keys(filter.values).length > 0
            ? Object.entries(filter.values).flatMap(([value, selected]) =>
                selected ? [dataType ? literal(value, dataType) : value] : []
              )
            : ["EMPTY_VALUE"]
          : [];

      // FIXME: why doesn't .equals work for date types but .in does?
      // Temporary solution: filter everything usin .in!
      // return selectedValues.length === 1
      //   ? [dimension.component.in([toTypedValue(selectedValues[0])])]
      //   :
      return selectedValues.length > 0 ? [dimension.in(selectedValues)] : [];
    })
  );

  return ([] as $Unexpressable[]).concat(...filterEntries);
};

const Query: QueryResolvers = {
  dataCubes: async (_, { locale }) => {
    return getEntryPoint(locale).dataCubes();
  },
  dataCubeByIri: async (_, { iri, locale }) => {
    return getEntryPoint(locale).dataCubeByIri(iri);
  }
};

const DataCube: DataCubeResolvers = {
  iri: dataCube => dataCube.iri,
  title: dataCube => dataCube.label.value,
  contact: dataCube => dataCube.extraMetadata.get("contact")?.value ?? null,
  source: dataCube => dataCube.extraMetadata.get("source")?.value ?? null,
  description: dataCube =>
    dataCube.extraMetadata.get("description")?.value ?? null,
  dateCreated: dataCube =>
    dataCube.extraMetadata.get("dateCreated")?.value ?? null,
  dimensions: async dataCube => {
    return (await dataCube.dimensions()).map(dimension => ({
      dataCube,
      dimension
    }));
  },
  dimensionByIri: async (dataCube, { iri }) => {
    const dimension = (await dataCube.dimensions()).find(
      dimension => dimension.iri.value === iri
    );
    return dimension
      ? {
          dataCube,
          dimension
        }
      : null;
  },
  measures: async dataCube => {
    return (await dataCube.measures()).map(measure => ({
      dataCube,
      measure
    }));
  },
  observations: async (dataCube, { limit, filters, measures }) => {
    const constructedFilters = filters
      ? await constructFilters(dataCube, filters)
      : [];

    // TODO: Selecting dimensions explicitly makes the query slower (because labels are only included for selected components). Can this be improved?
    const unmappedDimensions = (await dataCube.dimensions()).flatMap((d, i) => {
      return measures?.find(iri => iri === d.iri.value)
        ? []
        : ([[`dim${i}`, d]] as [string, RDFDimension][]);
    });

    const selectedFields = [
      ...unmappedDimensions,
      ...(measures
        ? measures.map(
            (iri, i) =>
              [`comp${i}`, new RDFMeasure({ iri })] as [string, RDFMeasure]
          )
        : [])
    ];

    const query = dataCube
      .query()
      .limit(limit ?? null)
      .select(selectedFields)
      .filter(constructedFilters);

    return {
      dataCube,
      query,
      selectedFields
    };
  }
};

const dimensionResolvers = {
  iri: ({ dimension }: ResolvedDimension) => dimension.iri.value,
  label: ({ dimension }: ResolvedDimension) => dimension.label.value,
  values: async ({ dataCube, dimension }: ResolvedDimension) => {
    const values = await dataCube.componentValues(dimension);
    return values.map(({ value, label }) => {
      return {
        value: value.value,
        label: label.value !== "" ? label.value : value.value
      };
    });
  }
};

export const resolvers: Resolvers = {
  Filters: GraphQLJSONObject,
  Observation: GraphQLJSONObject,
  RawObservation: GraphQLJSONObject,
  Query,
  DataCube,
  ObservationsQuery: {
    data: async ({ query, selectedFields }) => {
      const observations = await query.execute();
      // TODO: Optimize Performance
      const fullyQualifiedObservations = observations.map(obs => {
        return Object.fromEntries(
          Object.entries(obs).map(([k, v]) => [
            selectedFields.find(([selK]) => selK === k)![1].iri.value,
            parseObservationValue(v)
          ])
        );
      });

      return fullyQualifiedObservations;
    },
    rawData: async ({ query, selectedFields }) => {
      const observations = await query.execute();
      // TODO: Optimize Performance
      const fullyQualifiedObservations = observations.map(obs => {
        return Object.fromEntries(
          Object.entries(obs).map(([k, v]) => [
            selectedFields.find(([selK]) => selK === k)![1].iri.value,
            v
          ])
        );
      });

      return fullyQualifiedObservations;
    },
    sparql: async ({ query }) => {
      return query.toSparql();
    }
  },
  Dimension: {
    __resolveType({ dimension }) {
      const scaleOfMeasure = dimension.extraMetadata.scaleOfMeasure;

      if (
        scaleOfMeasure &&
        /cube\/scale\/Temporal\/?$/.test(scaleOfMeasure.value)
      ) {
        return "TemporalDimension";
      }

      // FIXME: Remove this once we're sure that scaleOfMeasure always works
      if (
        /(Jahr|Année|Anno|Year|Zeit|Time|Temps|Tempo)/i.test(
          dimension.label.value
        )
      ) {
        return "TemporalDimension";
      }

      return "NominalDimension";
    }
  },
  NominalDimension: {
    ...dimensionResolvers
  },
  OrdinalDimension: {
    ...dimensionResolvers
  },
  TemporalDimension: {
    ...dimensionResolvers
  },
  Measure: {
    iri: ({ measure }: ResolvedMeasure) => measure.iri.value,
    label: ({ measure }: ResolvedMeasure) => measure.label.value
  }
};