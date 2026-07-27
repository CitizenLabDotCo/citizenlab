import { addDays, format } from 'date-fns';

import { phasesData } from 'api/phases/__mocks__/_mockServer';
import { IPhaseData, ParticipationMethod } from 'api/phases/types';

import {
  excludeHidden,
  groupExtraSurveys,
  phaseHasPrimaryCTA,
} from './participationOptions';

const date = (daysFromNow: number) =>
  format(addDays(new Date(), daysFromNow), 'yyyy-MM-dd');

const phase = (
  attributes: Partial<IPhaseData['attributes']> = {},
  id?: string
): IPhaseData => {
  const base = phasesData[0];

  return {
    ...base,
    ...(id ? { id } : {}),
    attributes: {
      ...base.attributes,
      participation_method: 'native_survey',
      placement_type: 'standalone',
      start_at: date(-7),
      end_at: date(7),
      ...attributes,
    },
  };
};

describe('phaseHasPrimaryCTA', () => {
  const withCTA: ParticipationMethod[] = [
    'ideation',
    'proposals',
    'native_survey',
    'survey',
    'poll',
    'document_annotation',
  ];

  it.each(withCTA)('returns true for %s', (method) => {
    expect(phaseHasPrimaryCTA(phase({ participation_method: method }))).toBe(
      true
    );
  });

  it.each(['information', 'volunteering', 'common_ground'] as const)(
    'returns false for %s',
    (method) => {
      expect(phaseHasPrimaryCTA(phase({ participation_method: method }))).toBe(
        false
      );
    }
  );
});

describe('groupExtraSurveys', () => {
  it('returns empty groups for undefined input', () => {
    expect(groupExtraSurveys(undefined)).toEqual({ open: [], upcoming: [] });
  });

  it('groups standalone surveys by temporal state and drops past ones', () => {
    const openSurvey = phase({}, 'open');
    const upcomingSurvey = phase(
      { start_at: date(3), end_at: date(10) },
      'upcoming'
    );
    const pastSurvey = phase({ start_at: date(-10), end_at: date(-3) }, 'past');

    const { open, upcoming } = groupExtraSurveys([
      openSurvey,
      upcomingSurvey,
      pastSurvey,
    ]);

    expect(open.map((p) => p.id)).toEqual(['open']);
    expect(upcoming.map((p) => p.id)).toEqual(['upcoming']);
  });

  it('treats surveys without an end date as open', () => {
    const ongoing = phase({ end_at: null }, 'ongoing');
    expect(groupExtraSurveys([ongoing]).open.map((p) => p.id)).toEqual([
      'ongoing',
    ]);
  });

  it('ignores phases that are not standalone native surveys', () => {
    const timelinePhase = phase({ placement_type: 'on_timeline' });
    const standaloneIdeation = phase({ participation_method: 'ideation' });

    expect(groupExtraSurveys([timelinePhase, standaloneIdeation])).toEqual({
      open: [],
      upcoming: [],
    });
  });
});

describe('excludeHidden', () => {
  const phases = [phase({}, 'a'), phase({}, 'b')];

  it('returns all phases when nothing is hidden', () => {
    expect(excludeHidden(phases, undefined)).toEqual(phases);
    expect(excludeHidden(phases, [])).toEqual(phases);
  });

  it('filters out hidden phases and ignores unknown ids', () => {
    expect(excludeHidden(phases, ['b', 'deleted']).map((p) => p.id)).toEqual([
      'a',
    ]);
  });
});
