import { isString } from 'lodash-es';
import { QueryParametersUpdate } from 'components/IdeaCards/IdeasWithFiltersSidebar';

// Situations in which need to add a property to newSearchParams:
//  1. if there is already a property in the search params, and the propery is not a key in newParams
//  2. if the propery is a key in newParams with a non-null value
const setPropertyIfNecessary = (
  newSearchParams: Record<string, string>,
  searchParams: URLSearchParams,
  newParams: QueryParametersUpdate,
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

const PARAMS: (keyof QueryParametersUpdate)[] = [
  'sort',
  'search',
  'idea_status',
  'topics',
];

export const parseSearchParams = (
  searchParams: URLSearchParams,
  newParams: QueryParametersUpdate
) => {
  const newSearchParams: Record<string, string> = {};
  PARAMS.forEach((param) => {
    setPropertyIfNecessary(newSearchParams, searchParams, newParams, param);
  });

  return newSearchParams;
};
