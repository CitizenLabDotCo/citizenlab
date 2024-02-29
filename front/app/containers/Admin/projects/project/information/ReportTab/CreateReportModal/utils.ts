import { pastPresentOrFuture } from 'utils/dateUtils';
import { IPhaseData, ParticipationMethod } from 'api/phases/types';

export const PARTICIPATION_METHODS: ParticipationMethod[] = [
  'ideation',
  'native_survey',
];

export const findInitialPhase = (phases: IPhaseData[]) => {
  for (const phase of phases) {
    const isPastOrOngoing =
      pastPresentOrFuture(phase.attributes.start_at) === 'past';

    if (
      isPastOrOngoing &&
      PARTICIPATION_METHODS.includes(phase.attributes.participation_method)
    ) {
      return phase.id;
    }
  }

  return undefined;
};
