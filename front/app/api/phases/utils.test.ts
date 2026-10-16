import { IPhaseData } from './types';
import { getPhaseSaveRedirectTab, getSelectedView } from './utils';

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

describe('getPhaseSaveRedirectTab', () => {
  const phase = (participation_method) =>
    ({ attributes: { participation_method } } as IPhaseData);

  it('returns the survey form tab for a native survey phase', () => {
    expect(getPhaseSaveRedirectTab(phase('native_survey'))).toBe('survey-form');
  });

  it('keeps the regular landing tab for other participation methods', () => {
    expect(getPhaseSaveRedirectTab(phase('ideation'))).toBe('ideas');
    expect(getPhaseSaveRedirectTab(phase('proposals'))).toBe('proposals');
    expect(getPhaseSaveRedirectTab(phase('poll'))).toBe('polls');
    expect(getPhaseSaveRedirectTab(phase('information'))).toBe('setup');
  });
});
