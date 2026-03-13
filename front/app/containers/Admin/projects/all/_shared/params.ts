import { useMemo } from 'react';

import { useSearchParams } from 'react-router-dom';

import { Parameters } from 'api/projects_mini_admin/types';

import useFeatureFlag from 'hooks/useFeatureFlag';

import { removeSearchParams } from 'utils/cl-router/removeSearchParams';
import { updateSearchParams } from 'utils/cl-router/updateSearchParams';

export type Parameter = keyof Parameters;

export const PARAMS: Parameter[] = [
  'status',
  'managers',
  'search',
  'min_start_date',
  'max_start_date',
  'sort',
  'participation_states',
  'folder_ids',
  'participation_methods',
  'visibility',
  'discoverability',
  'review_state',
  'space_ids',
];

const MULTISELECT_PARAMS = new Set<string>([
  'status',
  'managers',
  'participation_states',
  'folder_ids',
  'participation_methods',
  'visibility',
  'discoverability',
  'space_ids',
] satisfies Parameter[]);

export const setParam = <ParamName extends Parameter>(
  paramName: ParamName,
  paramValue: Parameters[ParamName]
) => {
  const isNullishParam =
    !paramValue || (Array.isArray(paramValue) && paramValue.length === 0);

  if (isNullishParam) {
    removeSearchParams([paramName]);
  } else {
    updateSearchParams({ [paramName]: paramValue });
  }
};

export const useParam = <ParamName extends Parameter>(
  paramName: ParamName
): Parameters[ParamName] | undefined => {
  const [searchParams] = useSearchParams();

  const paramValue = searchParams.get(paramName);

  if (MULTISELECT_PARAMS.has(paramName)) {
    return (
      paramValue === null ? [] : JSON.parse(paramValue)
    ) as Parameters[typeof paramName];
  }

  return (paramValue ?? undefined) as Parameters[typeof paramName] | undefined;
};

export const useParams = () => {
  const [searchParams] = useSearchParams();
  const spacesEnabled = useFeatureFlag({ name: 'spaces' });

  return useMemo(() => {
    let params = PARAMS;

    if (!spacesEnabled) {
      params = params.filter((param) => param !== 'space_ids');
    }

    return params.reduce((acc, paramName) => {
      let value = searchParams.get(paramName);

      if (value === null) {
        return acc;
      }

      if (MULTISELECT_PARAMS.has(paramName)) {
        value = JSON.parse(value);
      }

      return {
        ...acc,
        [paramName]: value as Parameters[typeof paramName],
      };
    }, {} as Partial<Parameters>);
  }, [searchParams, spacesEnabled]);
};
