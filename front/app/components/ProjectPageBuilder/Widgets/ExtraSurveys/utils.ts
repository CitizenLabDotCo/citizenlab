import { ButtonStyles } from '@citizenlab/cl2-component-library';
import { Multiloc } from 'typings';

import { IPhaseData } from 'api/phases/types';
import { getPhaseActionDescriptor } from 'api/phases/utils';

import { pastPresentOrFuture } from 'utils/dateUtils';

export type SurveyButtonFormat = 'button' | 'card';

export type ExtraSurveysProps = {
  surveyPhaseId?: string;
  buttonFormat?: SurveyButtonFormat;
  buttonStyle?: ButtonStyles;
  buttonText?: Multiloc;
};

export type ExtraSurveyState =
  | 'open'
  | 'upcoming'
  | 'closed'
  | 'taken'
  | 'notEligible';

export function isExtraSurveyPhase(phase: IPhaseData) {
  return (
    phase.attributes.placement_type === 'standalone' &&
    phase.attributes.participation_method === 'native_survey'
  );
}

// Reasons the visitor cannot fix by signing in or completing requirements —
// for these the button locks instead of sending them into the auth flow.
const UNFIXABLE_REASONS = new Set([
  'user_not_permitted',
  'user_not_in_group',
  'user_blocked',
  'project_inactive',
  'inactive_phase',
]);

export function getExtraSurveyState(phase: IPhaseData): ExtraSurveyState {
  const { start_at, end_at } = phase.attributes;

  const temporal = pastPresentOrFuture([start_at, end_at]);
  if (temporal === 'future') return 'upcoming';
  if (temporal === 'past') return 'closed';

  const { enabled, disabled_reason } = getPhaseActionDescriptor(
    phase,
    'posting_idea'
  );
  if (enabled) return 'open';
  if (disabled_reason === 'posting_limited_max_reached') return 'taken';
  if (
    disabled_reason === 'posting_disabled' ||
    disabled_reason === 'posting_not_supported'
  ) {
    return 'closed';
  }
  if (UNFIXABLE_REASONS.has(disabled_reason)) return 'notEligible';

  // Fixable reasons (not signed in, missing requirements): the survey page
  // itself walks the visitor through the auth flow.
  return 'open';
}
