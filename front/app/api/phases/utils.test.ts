import { getSelectedView } from './utils';

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
