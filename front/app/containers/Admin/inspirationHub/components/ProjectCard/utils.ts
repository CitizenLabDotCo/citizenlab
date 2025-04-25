import { ParticipationMethod } from 'api/phases/types';
import { ProjectLibraryPhase } from 'api/project_library_phases/types';

const notEmpty = (
  method: ParticipationMethod | undefined
): method is ParticipationMethod => !!method;

export const getMethods = (
  projectLibraryPhases: (ProjectLibraryPhase | undefined)[]
) => {
  const methods = projectLibraryPhases
    .map((phase) => phase?.data.attributes.participation_method)
    .filter(notEmpty);

  const deduplicatedMethods = [...new Set(methods)];

  return deduplicatedMethods;
};
