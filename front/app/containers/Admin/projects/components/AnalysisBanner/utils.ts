import { ParticipationMethod } from 'api/phases/types';

/**
 * Returns the analysis scope for a participation method.
 * - 'project' for ideation/voting: these are transitive methods where the
 *   input form (CustomForm) is defined at the project level and shared across phases.
 * - 'phase' for others (native_survey, proposals): the form is defined per phase.
 */
export const getAnalysisScope = (
  participationMethod: ParticipationMethod | undefined
): 'project' | 'phase' => {
  return participationMethod === 'ideation' || participationMethod === 'voting'
    ? 'project'
    : 'phase';
};
