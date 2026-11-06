import { IUpdatedPhaseProperties, ParticipationMethod } from 'api/phases/types';

import { MessageDescriptor } from 'utils/cl-intl';

import { getSettingRows, hasSettings } from './phaseSettingRows';

const format = {
  formatMessage: ({ defaultMessage }: MessageDescriptor) =>
    String(defaultMessage),
  localize: () => 'localized',
};

const rows = (method: ParticipationMethod, settings: IUpdatedPhaseProperties) =>
  getSettingRows(method, settings, format).map(({ label, value }) => [
    label.defaultMessage,
    value,
  ]);

describe('getSettingRows', () => {
  it('only lists the settings a proposed phase sets', () => {
    expect(rows('ideation', {})).toEqual([]);
    expect(rows('ideation', { commenting_enabled: false })).toEqual([
      ['Commenting', 'Off'],
    ]);
  });

  it('shows the likes limit only when it is known', () => {
    const limited = { reacting_like_method: 'limited' } as const;

    expect(rows('ideation', limited)).toEqual([]);
    expect(
      rows('ideation', { ...limited, reacting_like_limited_max: 5 })
    ).toEqual([['Likes per person', '5']]);
    expect(rows('ideation', { reacting_like_method: 'unlimited' })).toEqual([
      ['Likes per person', 'Unlimited'],
    ]);
  });

  it('shows no screening as off', () => {
    expect(rows('ideation', { prescreening_mode: null })).toEqual([
      ['Screening before publication', 'Off'],
    ]);
    expect(rows('ideation', { prescreening_mode: 'flagged_only' })).toEqual([
      ['Screening before publication', 'Flagged inputs only'],
    ]);
  });

  it('shows a limit of null as unlimited', () => {
    expect(rows('voting', { voting_max_total: null })).toEqual([
      ['Maximum per voter', 'Unlimited'],
    ]);
    expect(rows('voting', { voting_max_total: 3 })).toEqual([
      ['Maximum per voter', '3'],
    ]);
  });

  it('names the option that was chosen', () => {
    expect(rows('voting', { voting_method: 'budgeting' })).toEqual([
      ['Voting method', 'Budget'],
    ]);
    expect(rows('survey', { survey_service: 'google_forms' })).toEqual([
      ['Survey tool', 'Google Forms'],
    ]);
  });

  it('localizes translated settings', () => {
    expect(
      rows('native_survey', { native_survey_title_multiloc: { en: 'Survey' } })
    ).toEqual([['Survey title', 'localized']]);
  });

  it('lists the settings that belong to the method', () => {
    expect(rows('poll', { commenting_enabled: true })).toEqual([]);
  });
});

describe('hasSettings', () => {
  it('tells apart the methods without settings', () => {
    expect(hasSettings('ideation')).toBe(true);
    expect(hasSettings('information')).toBe(false);
  });
});
