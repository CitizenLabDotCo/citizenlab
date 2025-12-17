import { BaseResponseData } from './fetcher';

export const transformResponseData = (responseData: BaseResponseData) => {
  if (
    !Array.isArray(responseData.included) ||
    responseData.included.length === 0
  ) {
    return responseData;
  }

  const includedByType: Record<string, any[]> = {};

  responseData.included.forEach((item) => {
    if (!(item.type in includedByType)) {
      includedByType[item.type] = [];
    }
    includedByType[item.type].push(item);
  });

  return {
    ...responseData,
    includedByType,
  };
};

// Helper type to extract the 'type' field from resources
type ExtractType<T> = T extends { type: infer U } ? U : never;

// Helper type to filter resources by type
type FilterByType<Union, Type> = Union extends { type: Type } ? Union : never;

// Helper type to build the includedByType object
type BuildIncludedByType<T> = T extends { type: string }
  ? {
      [K in ExtractType<T>]: FilterByType<T, K>[];
    }
  : never;

// Transform the response data type
export type TransformResponseData<T extends BaseResponseData> = T extends {
  included: infer IncludedArray;
}
  ? IncludedArray extends Array<infer IncludedItem>
    ? T & {
        includedByType: BuildIncludedByType<IncludedItem>;
      }
    : T
  : T;
