import { TPhases } from 'hooks/usePhases';
import { IProjectData } from 'api/projects/types';
import { isNilOrError, NilOrError } from 'utils/helperUtils';

export const isReady = (
  project: IProjectData | NilOrError,
  phases: TPhases
): project is IProjectData => {
  return (
    !isNilOrError(project) &&
    (project.attributes.process_type === 'continuous'
      ? true
      : !isNilOrError(phases))
  );
};
