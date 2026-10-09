import { mockPhaseIdeationData } from 'api/phases/__mocks__/_mockServer';
import { IPhaseData, PhasePlacementType } from 'api/phases/types';

import { checkMoveToSpotlightSurveys, checkMoveToTimeline } from './utils';

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

  it('finds the timeline phases the survey overlaps', () => {
    const before = buildPhase('before', '2026-05-01', '2026-06-01');
    const overlapping = buildPhase('overlapping', '2026-06-15', '2026-08-01');
    const after = buildPhase('after', '2026-07-01', '2026-08-01');

    const check = checkMoveToTimeline(survey, [before, overlapping, after]);

    expect(ids(check.overlappingPhases)).toEqual(['overlapping']);
  });

  it('closes an earlier open-ended phase instead of counting it as an overlap', () => {
    const openEnded = buildPhase('open-ended', '2026-05-01', null);

    const check = checkMoveToTimeline(survey, [openEnded]);

    expect(check.overlappingPhases).toEqual([]);
    expect(check.phaseToClose?.id).toBe('open-ended');
  });

  it('blocks an open-ended survey that would not be the last phase', () => {
    const openEndedSurvey = buildPhase(
      'survey',
      '2026-06-01',
      null,
      'standalone'
    );
    const before = buildPhase('before', '2026-05-01', '2026-06-01');
    const after = buildPhase('after', '2026-09-01', '2026-10-01');

    expect(
      checkMoveToTimeline(openEndedSurvey, [before]).openEndedNotLast
    ).toBe(false);
    expect(
      checkMoveToTimeline(openEndedSurvey, [before, after]).openEndedNotLast
    ).toBe(true);
  });

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
