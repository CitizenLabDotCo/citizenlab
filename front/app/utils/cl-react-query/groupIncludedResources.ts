// Helper type to extract the 'type' field from a union
type ExtractType<T> = T extends { type: infer U } ? U : never;

// Helper type to filter union members by type
type FilterByType<Union, TypeValue> = Union extends any
  ? Union extends { type: TypeValue }
    ? Union
    : never
  : never;

type GroupByType<T extends { type: string }> = {
  [K in ExtractType<T>]?: FilterByType<T, K>[];
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
