import { IPhaseData, ParticipationMethod } from 'api/phases/types';

import { isExtraSurveyPhase } from 'components/ProjectPageBuilder/Widgets/ExtraSurveys/utils';

import { pastPresentOrFuture } from 'utils/dateUtils';

// Methods whose phase produces a primary participation CTA in the
// participation box (see ProjectActionButtons).
const PRIMARY_CTA_METHODS: ParticipationMethod[] = [
  'ideation',
  'proposals',
  'native_survey',
  'survey',
  'poll',
  'document_annotation',
];

export function phaseHasPrimaryCTA(phase: IPhaseData) {
  return PRIMARY_CTA_METHODS.includes(phase.attributes.participation_method);
}

// Splits a project's standalone survey phases into the ones open for
// participation right now and the ones that open later. Past surveys are
// dropped — they never surface in the participation box.
export function groupExtraSurveys(phases: IPhaseData[] | undefined) {
  const open: IPhaseData[] = [];
  const upcoming: IPhaseData[] = [];

  (phases ?? []).filter(isExtraSurveyPhase).forEach((phase) => {
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
