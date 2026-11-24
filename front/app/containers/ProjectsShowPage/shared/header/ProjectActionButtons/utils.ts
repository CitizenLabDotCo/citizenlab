import { IPhaseData } from 'api/phases/types';
import { getPhaseActionDescriptor } from 'api/phases/utils';
import { IProjectData } from 'api/projects/types';

import { pastPresentOrFuture } from 'utils/dateUtils';

export type MethodCTA =
  | 'post_idea'
  | 'take_native_survey'
  | 'take_survey'
  | 'take_poll'
  | 'review_document'
  | 'volunteer'
  | 'vote';

export type SecondaryCTA = 'see_ideas' | 'see_results' | 'see_events';

interface GetMethodCTAParams {
  // Only the running phase: there is no primary CTA when no phase is running.
  currentPhase?: IPhaseData;
  publicationStatus: IProjectData['attributes']['publication_status'];
  hiddenOptionIds?: string[];
}

// Returns the primary call to action for the current phase's participation
// method, or null when there is none to show.
export const getMethodCTA = ({
  currentPhase,
  publicationStatus,
  hiddenOptionIds,
}: GetMethodCTAParams): MethodCTA | null => {
  if (!currentPhase || publicationStatus === 'archived') return null;

  // The timeline option can be unchecked in the participation box settings —
  // that hides its primary CTA only.
  if (hiddenOptionIds?.includes(currentPhase.id)) return null;

  switch (currentPhase.attributes.participation_method) {
    case 'ideation':
    case 'proposals':
      return 'post_idea';
    case 'native_survey':
      return 'take_native_survey';
    case 'survey':
      return getPhaseActionDescriptor(currentPhase, 'taking_survey').enabled
        ? 'take_survey'
        : null;
    case 'poll':
      return 'take_poll';
    case 'document_annotation':
      return 'review_document';
    case 'volunteering':
      return 'volunteer';
    case 'voting':
      return 'vote';
    default:
      return null;
  }
};

interface GetSecondaryCTAParams {
  // The running phase, or the last phase when none is running.
  phase?: IPhaseData;
  showEventsCTA: boolean;
}

export const getSecondaryCTA = ({
  phase,
  showEventsCTA,
}: GetSecondaryCTAParams): SecondaryCTA | null => {
  const ideasCount = phase?.attributes.ideas_count;
  if (
    phase?.attributes.participation_method === 'ideation' &&
    typeof ideasCount === 'number' &&
    ideasCount > 0
  ) {
    return 'see_ideas';
  }

  // Results are only shown on the phase once it has ended and they're shared.
  if (
    phase?.attributes.participation_method === 'voting' &&
    phase.attributes.autoshare_results_enabled &&
    !!phase.attributes.end_at &&
    pastPresentOrFuture(phase.attributes.end_at) === 'past'
  ) {
    return 'see_results';
  }

  if (showEventsCTA) return 'see_events';

  return null;
};
