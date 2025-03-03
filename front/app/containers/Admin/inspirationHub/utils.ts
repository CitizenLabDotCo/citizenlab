import { useMemo } from 'react';

import { useSearchParams } from 'react-router-dom';

import { RansackParams } from 'api/project_library_projects/types';

import { removeSearchParams } from 'utils/cl-router/removeSearchParams';
import { updateSearchParams } from 'utils/cl-router/updateSearchParams';

export const setRansackParam = <ParamName extends keyof RansackParams>(
  paramName: ParamName,
  paramValue: RansackParams[ParamName]
) => {
  if (paramValue) {
    updateSearchParams({ [paramName]: paramValue });
  } else {
    removeSearchParams([paramName]);
  }
};

export const useRansackParam = <ParamName extends keyof RansackParams>(
  paramName: ParamName
): RansackParams[ParamName] => {
  const [searchParams] = useSearchParams();
  return searchParams.get(paramName) as RansackParams[typeof paramName];
};

const RANSACK_PARAMS: (keyof RansackParams)[] = [
  'q[tenant_country_alpha2]',
  'q[tenant_population_group_eq]',
  'q[score_total_gteq]',
  'q[phases_participation_method_eq]',
  'q[topic_id_eq]',
  'q[status_eq]',
  'q[visibility_eq]',
  'q[practical_end_at_gteq]',
  'q[practical_end_at_lt]',
  'q[title_en_or_description_en_or_tenant_name_cont]',
  'q[s]',
];

export const useRansackParams = () => {
  const [searchParams] = useSearchParams();
  return useMemo(
    () =>
      RANSACK_PARAMS.reduce((acc, paramName) => {
        const value = searchParams.get(paramName);

        if (value === null) {
          return acc;
        }

        return {
          ...acc,
          [paramName]: value as RansackParams[typeof paramName],
        };
      }, {} as RansackParams),
    [searchParams]
  );
};
