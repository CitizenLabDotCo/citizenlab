import { addDays, format } from 'date-fns';

import { phasesData } from 'api/phases/__mocks__/_mockServer';
import { IPhaseData } from 'api/phases/types';

import { getExtraSurveyState, isExtraSurveyPhase } from './utils';

const date = (daysFromNow: number) =>
  format(addDays(new Date(), daysFromNow), 'yyyy-MM-dd');

const extraSurveyPhase = (
  attributes: Partial<IPhaseData['attributes']> = {}
): IPhaseData => {
  const base = phasesData[0];

  return {
    ...base,
    attributes: {
      ...base.attributes,
      participation_method: 'native_survey',
      placement_type: 'standalone',
      start_at: date(-7),
      end_at: date(7),
      action_descriptors: {
        ...base.attributes.action_descriptors,
        posting_idea: { enabled: true, disabled_reason: null },
      },
      ...attributes,
    },
  };
};

const withPostingDisabledReason = (
  disabled_reason:
    | 'posting_limited_max_reached'
    | 'posting_disabled'
    | 'user_not_permitted'
    | 'user_not_signed_in'
) =>
  extraSurveyPhase({
    action_descriptors: {
      ...phasesData[0].attributes.action_descriptors,
      posting_idea: { enabled: false, disabled_reason },
    },
  });

describe('isExtraSurveyPhase', () => {
  it('is true only for standalone native survey phases', () => {
    expect(isExtraSurveyPhase(extraSurveyPhase())).toBe(true);
    expect(
      isExtraSurveyPhase(extraSurveyPhase({ placement_type: 'on_timeline' }))
    ).toBe(false);
    expect(
      isExtraSurveyPhase(extraSurveyPhase({ participation_method: 'ideation' }))
    ).toBe(false);
    expect(isExtraSurveyPhase(phasesData[0])).toBe(false);
  });
});

describe('getExtraSurveyState', () => {
  it('is upcoming before the start date', () => {
    expect(
      getExtraSurveyState(
        extraSurveyPhase({ start_at: date(3), end_at: date(10) })
      )
    ).toBe('upcoming');
  });

  it('is closed after the end date', () => {
    expect(
      getExtraSurveyState(
        extraSurveyPhase({ start_at: date(-10), end_at: date(-3) })
      )
    ).toBe('closed');
  });

  it('is open while running and posting is enabled', () => {
    expect(getExtraSurveyState(extraSurveyPhase())).toBe('open');
  });

  it('is open for an ongoing survey without an end date', () => {
    expect(getExtraSurveyState(extraSurveyPhase({ end_at: null }))).toBe(
      'open'
    );
  });

  it('is taken when the visitor already responded', () => {
    expect(
      getExtraSurveyState(
        withPostingDisabledReason('posting_limited_max_reached')
      )
    ).toBe('taken');
  });

  it('is closed when submissions are disabled', () => {
    expect(
      getExtraSurveyState(withPostingDisabledReason('posting_disabled'))
    ).toBe('closed');
  });

  it('is notEligible when the visitor is not permitted', () => {
    expect(
      getExtraSurveyState(withPostingDisabledReason('user_not_permitted'))
    ).toBe('notEligible');
  });

  it('stays open for reasons the visitor can fix by signing in', () => {
    expect(
      getExtraSurveyState(withPostingDisabledReason('user_not_signed_in'))
    ).toBe('open');
  });
});
