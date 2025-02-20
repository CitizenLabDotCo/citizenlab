import { RansackParams } from 'api/project_library_projects/types';

import { removeSearchParams } from 'utils/cl-router/removeSearchParams';
import { updateSearchParams } from 'utils/cl-router/updateSearchParams';

export const updateOrRemoveSearchParam = <
  ParamName extends keyof RansackParams
>(
  paramName: ParamName,
  paramValue: RansackParams[ParamName]
) => {
  if (paramValue) {
    updateSearchParams({ [paramName]: paramValue });
  } else {
    removeSearchParams([paramName]);
  }
};
