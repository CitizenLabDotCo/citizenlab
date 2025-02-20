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
