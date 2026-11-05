import { mockPhaseIdeationData } from 'api/phases/__mocks__/_mockServer';
import { IPhaseData, PhasePlacementType } from 'api/phases/types';

import {
  checkMoveToSpotlightSurveys,
  checkMoveToTimeline,
  invalidTimelineDates,
  getPhaseDateErrors,
} from './utils';

const buildPhase = (
  id: string,
  startAt: string,
  endAt: string | null,
  placementType: PhasePlacementType = 'on_timeline'
): IPhaseData => ({
  ...mockPhaseIdeationData,
  id,
  attributes: {
    ...mockPhaseIdeationData.attributes,
    start_at: startAt,
    end_at: endAt,
    placement_type: placementType,
  },
});

const ids = (phases: IPhaseData[]) => phases.map(({ id }) => id);

describe('checkMoveToTimeline', () => {
  const survey = buildPhase('survey', '2026-06-01', '2026-07-01', 'standalone');

  it('flags when later phases get renumbered', () => {
    const before = buildPhase('before', '2026-05-01', '2026-06-01');
    const after = buildPhase('after', '2026-07-01', '2026-08-01');

    expect(checkMoveToTimeline(survey, [before]).renumbersLaterPhases).toBe(
      false
    );
    expect(
      checkMoveToTimeline(survey, [before, after]).renumbersLaterPhases
    ).toBe(true);
  });
});

describe('invalidTimelineDates', () => {
  it('allows consecutive phases and an open-ended last phase', () => {
    expect(
      invalidTimelineDates([
        buildPhase('first', '2026-06-01', '2026-06-10'),
        buildPhase('last', '2026-06-10', null),
      ])
    ).toEqual([]);
  });

  it('blocks an overlap with an open-ended earlier phase', () => {
    expect(
      ids(
        invalidTimelineDates([
          buildPhase('first', '2026-06-01', null),
          buildPhase('survey', '2026-06-10', '2026-06-20'),
        ])
      )
    ).toEqual(['first', 'survey']);
  });

  it('blocks missing start dates, reversed dates and durations below 24 hours', () => {
    expect(
      ids(
        invalidTimelineDates([
          buildPhase('missing', '', null),
          buildPhase('reversed', '2026-06-03', '2026-06-01'),
          buildPhase('short', '2026-07-01T00:00:00Z', '2026-07-01T12:00:00Z'),
        ])
      )
    ).toEqual(['missing', 'reversed', 'short']);
  });
});

describe('checkMoveToSpotlightSurveys', () => {
  const survey = buildPhase('survey', '2026-06-01', '2026-07-01');
  const before = buildPhase('before', '2026-05-01', '2026-06-01');
  const after = buildPhase('after', '2026-07-01', '2026-08-01');
  const now = new Date('2026-06-15').getTime();

  it('leaves a gap when the survey sits between two phases', () => {
    const check = checkMoveToSpotlightSurveys(
      survey,
      [before, survey, after],
      now
    );

    expect(check.leavesGap).toBe(true);
    expect(check.renumbersLaterPhases).toBe(true);
    expect(check.newLastPhase).toBe(undefined);
  });

  it('makes the previous phase the last one when the survey was last', () => {
    const check = checkMoveToSpotlightSurveys(survey, [before, survey], now);

    expect(check.leavesGap).toBe(false);
    expect(check.newLastPhase?.id).toBe('before');
  });

  it('knows when the survey has ended', () => {
    const later = new Date('2026-07-02').getTime();

    expect(checkMoveToSpotlightSurveys(survey, [survey], now).ended).toBe(
      false
    );
    expect(checkMoveToSpotlightSurveys(survey, [survey], later).ended).toBe(
      true
    );
  });
});

describe('getPhaseDateErrors', () => {
  it.each<[string, string | null, string]>([
    ['', null, 'startRequired'],
    ['2026-06-01', 'invalid', 'endInvalid'],
    ['2026-06-03', '2026-06-01', 'endBeforeStart'],
    ['2026-06-01', '2026-06-01', 'endBeforeStart'],
    ['2026-06-01T00:00:00Z', '2026-06-01T12:00:00Z', 'durationTooShort'],
  ])('reports the specific range error for %s to %s', (start, end, type) => {
    const phase = buildPhase('phase', start, end);
    expect(getPhaseDateErrors(phase, [phase])).toEqual([{ type }]);
  });

  it('names each overlap without claiming valid dates are missing or too short', () => {
    const phase = buildPhase('B', '2026-02-17', '2026-11-20');
    const survey = buildPhase('survey', '2026-11-05', '2026-11-22');
    expect(getPhaseDateErrors(phase, [phase, survey])).toEqual([
      { type: 'overlap', phase: survey },
    ]);

    const corrected = buildPhase('B', '2026-02-17', '2026-11-05');
    expect(getPhaseDateErrors(corrected, [corrected, survey])).toEqual([]);
  });

  it('explains which later phase requires the open-ended phase to end', () => {
    const phase = buildPhase('open', '2026-06-01', null);
    const next = buildPhase('next', '2026-06-10', '2026-06-20');
    expect(getPhaseDateErrors(phase, [phase, next])).toEqual([
      { type: 'endRequired', phase: next },
    ]);
  });

  it('does not report an overlap caused by another phase with reversed dates', () => {
    const phase = buildPhase('phase', '2026-06-01', '2026-07-01');
    const invalid = buildPhase('invalid', '2026-06-20', '2026-06-10');
    expect(getPhaseDateErrors(phase, [phase, invalid])).toEqual([]);
    expect(getPhaseDateErrors(invalid, [phase, invalid])).toEqual([
      { type: 'endBeforeStart' },
    ]);
  });
});
