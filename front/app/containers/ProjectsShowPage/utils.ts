import { IPhases } from 'api/phases/types';
import { IProjectData } from 'api/projects/types';
import { isNilOrError, NilOrError } from 'utils/helperUtils';

export const isReady = (
  project: IProjectData | NilOrError,
  phases: IPhases | NilOrError
): project is IProjectData => {
  return (
    !isNilOrError(project) &&
    (project.attributes.process_type === 'continuous'
      ? true
      : !isNilOrError(phases))
  );
};
