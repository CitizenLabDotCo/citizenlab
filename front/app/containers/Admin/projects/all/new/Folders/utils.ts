import { useMemo } from 'react';

import { useSearchParams } from 'react-router-dom';

import { Parameters } from 'api/project_folders_mini/types';

import { removeSearchParams } from 'utils/cl-router/removeSearchParams';
import { updateSearchParams } from 'utils/cl-router/updateSearchParams';

export const setParam = <ParamName extends keyof Parameters>(
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

const MULTISELECT_PARAMS = new Set<string>([
  'status',
  'managers',
] satisfies Array<keyof Parameters>);

export const useParam = <ParamName extends keyof Parameters>(
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

const PARAMS: (keyof Parameters)[] = ['status', 'managers', 'search'];

export const useParams = () => {
  const [searchParams] = useSearchParams();

  return useMemo(
    () =>
      PARAMS.reduce((acc, paramName) => {
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
      }, {} as Partial<Parameters>),
    [searchParams]
  );
};
