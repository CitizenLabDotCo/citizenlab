import { isNilOrError, NilOrError } from 'utils/helperUtils';

import { IPhases } from 'api/phases/types';
import { IProjectData } from 'api/projects/types';

export const isReady = (
  project: IProjectData | NilOrError,
  phases: IPhases | NilOrError
): project is IProjectData => {
  return !isNilOrError(project) && !isNilOrError(phases);
};
