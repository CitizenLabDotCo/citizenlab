import { mockPhaseIdeationData } from './__mocks__/_mockServer';
import { IPhaseData, PhasePlacementType } from './types';
import { getPreviousTimelinePhase, getSelectedView } from './utils';

const buildPhase = (
  id: string,
  startAt: string,
  placementType: PhasePlacementType = 'on_timeline'
): IPhaseData => ({
  ...mockPhaseIdeationData,
  id,
  attributes: {
    ...mockPhaseIdeationData.attributes,
    start_at: startAt,
    placement_type: placementType,
  },
});

describe('getPreviousTimelinePhase', () => {
  const survey = buildPhase('survey', '2026-06-01', 'standalone');

  it('returns the timeline phase that starts last before the phase', () => {
    const earlier = buildPhase('earlier', '2026-01-01');
    const latest = buildPhase('latest', '2026-05-01');
    const later = buildPhase('later', '2026-07-01');

    expect(
      getPreviousTimelinePhase([later, earlier, latest, survey], survey)?.id
    ).toBe('latest');
  });

  it('ignores standalone phases and the phase itself', () => {
    const extra = buildPhase('extra', '2026-05-01', 'standalone');
    const timeline = buildPhase('timeline', '2026-02-01');

    expect(
      getPreviousTimelinePhase([extra, timeline, survey], survey)?.id
    ).toBe('timeline');
  });

  it('ignores a phase that starts at the same time', () => {
    const sameStart = buildPhase('same-start', '2026-06-01');

    expect(getPreviousTimelinePhase([sameStart, survey], survey)).toBe(
      undefined
    );
  });
});

describe('getSelectedView', () => {
  it('returns the default view when no view is requested', () => {
    expect(
      getSelectedView({
        availableViews: ['card', 'map'],
        defaultView: 'map',
      })
    ).toBe('map');
  });

  it('returns the requested view when the phase offers it', () => {
    expect(
      getSelectedView({
        requestedView: 'map',
        availableViews: ['card', 'map'],
        defaultView: 'card',
      })
    ).toBe('map');
  });

  it('falls back to the default view when the phase no longer offers the requested one', () => {
    expect(
      getSelectedView({
        requestedView: 'feed',
        availableViews: ['card', 'map'],
        defaultView: 'map',
      })
    ).toBe('map');
  });

  it('falls back to the card view when the default view is not offered either', () => {
    expect(
      getSelectedView({
        requestedView: 'feed',
        availableViews: ['card'],
        defaultView: 'map',
      })
    ).toBe('card');
  });

  it('keeps the requested view while the available views are unknown', () => {
    expect(
      getSelectedView({
        requestedView: 'feed',
        defaultView: 'card',
      })
    ).toBe('feed');
  });
});
