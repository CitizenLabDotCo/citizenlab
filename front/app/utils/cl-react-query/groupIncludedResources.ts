// Helper type to extract the 'type' field from a union
type ExtractType<T> = T extends { type: infer U } ? U : never;

// Helper type to filter union members by type
type FilterByType<Union, TypeValue> = Union extends any
  ? Union extends { type: TypeValue }
    ? Union
    : never
  : never;

type GroupByType<T extends { type: string }> = {
  [K in ExtractType<T>]: FilterByType<T, K>[];
};

export const groupIncludedResources = <T extends { type: string }>(
  values: T[]
): GroupByType<T> => {
  const result: Record<string, T[]> = {};

  values.forEach((value) => {
    if (!(value.type in result)) {
      result[value.type] = [];
    }
    result[value.type].push(value);
  });

  return result as GroupByType<T>;
};

// Example usage
// type TypeA = { type: 'a'; valueA: string };
// type TypeB = { type: 'b'; valueB: number };

// const values: (TypeA | TypeB)[] = [
//   { type: 'a', valueA: 'hello' },
//   { type: 'b', valueB: 42 },
//   { type: 'a', valueA: 'world' },
// ];

// const result = groupIncludedResources(values);
// // result is typed as: { a: TypeA[]; b: TypeB[] }

// const aValues = result.a; // TypeA[]
// const bValues = result.b; // TypeB[]
