import { useMemo } from 'react';

import { Parameters } from 'api/projects_mini_admin/types';

import useFeatureFlag from 'hooks/useFeatureFlag';

import { removeSearchParams } from 'utils/cl-router/removeSearchParams';
import { updateSearchParams } from 'utils/cl-router/updateSearchParams';
import { useSearch } from 'utils/router';

export const PARAMS = [
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
] as const;

export type Parameter = (typeof PARAMS)[number];

// Compile-time check that every PARAMS entry is a valid Parameters key.
// (`satisfies` on the export line above confuses ts-prune 0.10.x.)
type _ParamsCheck = Parameter extends keyof Parameters ? true : never;
const _paramsCheck: _ParamsCheck = true;
void _paramsCheck;

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
  const searchParams = useSearch({
    from: '/$locale/admin/projects/',
  });

  return searchParams[paramName] as Parameters[typeof paramName] | undefined;
};

export const useParams = () => {
  const searchParams = useSearch({
    from: '/$locale/admin/projects/',
  });
  const spacesEnabled = useFeatureFlag({ name: 'spaces' });

  return useMemo(() => {
    const params: readonly Parameter[] = spacesEnabled
      ? PARAMS
      : PARAMS.filter((param) => param !== 'space_ids');

    return params.reduce((acc, paramName) => {
      const value = searchParams[paramName];

      if (value === undefined) {
        return acc;
      }

      return {
        ...acc,
        [paramName]: value as Parameters[typeof paramName],
      };
    }, {} as Partial<Parameters>);
  }, [searchParams, spacesEnabled]);
};
