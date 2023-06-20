import { isString } from 'lodash-es';

export const searchParamParser = <ParamName extends string>(
  paramNames: ParamName[]
) => {
  const parseSearchParams = (
    searchParams: URLSearchParams,
    newParams: Partial<Record<ParamName, any>>
  ) => {
    const newSearchParams: Partial<Record<ParamName, string>> = {};

    paramNames.forEach((param) => {
      setPropertyIfNecessary(newSearchParams, searchParams, newParams, param);
    });

    return newSearchParams;
  };

  return parseSearchParams;
};

// Situations in which need to add a property to newSearchParams:
//  1. if there is already a property in the search params, and the propery is not a key in newParams
//  2. if the propery is a key in newParams with a non-null value
const setPropertyIfNecessary = (
  newSearchParams: Partial<Record<string, string>>,
  searchParams: URLSearchParams,
  newParams: Partial<Record<string, any>>,
  param: string
) => {
  const currentParam = searchParams.get(param);

  if (currentParam !== null && !(param in newParams)) {
    newSearchParams[param] = currentParam;
    return;
  }

  const newParam = newParams[param];

  if (newParam) {
    newSearchParams[param] = isString(newParam)
      ? newParam
      : JSON.stringify(newParam);
    return;
  }
};
