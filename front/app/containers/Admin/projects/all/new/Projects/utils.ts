import { Parameters } from 'api/projects_mini_admin/types';

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
