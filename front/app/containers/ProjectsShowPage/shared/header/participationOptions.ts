import { IPhaseData, ParticipationMethod } from 'api/phases/types';

import { isSpotlightSurveyPhase } from 'components/ProjectPageBuilder/Widgets/SpotlightSurveys/utils';

import { pastPresentOrFuture } from 'utils/dateUtils';

const PRIMARY_CTA_METHODS: ParticipationMethod[] = [
  'ideation',
  'proposals',
  'native_survey',
  'poll',
  'document_annotation',
];

export function phaseHasPrimaryCTA(phase: IPhaseData) {
  return PRIMARY_CTA_METHODS.includes(phase.attributes.participation_method);
}

// Splits a project's standalone survey phases into the ones open for
// participation right now and the ones that open later. Past surveys are
// dropped — they never surface in the participation box.
export function groupSpotlightSurveys(phases: IPhaseData[] | undefined) {
  const open: IPhaseData[] = [];
  const upcoming: IPhaseData[] = [];

  (phases ?? []).filter(isSpotlightSurveyPhase).forEach((phase) => {
    const temporal = pastPresentOrFuture([
      phase.attributes.start_at,
      phase.attributes.end_at,
    ]);

    if (temporal === 'present') open.push(phase);
    if (temporal === 'future') upcoming.push(phase);
  });

  return { open, upcoming };
}

export function excludeHidden(
  phases: IPhaseData[],
  hiddenOptionIds: string[] | undefined
) {
  if (!hiddenOptionIds || hiddenOptionIds.length === 0) return phases;
  return phases.filter((phase) => !hiddenOptionIds.includes(phase.id));
}
