import moment from 'moment-timezone';

import patchMomentDeAtJanuary from './patchMomentDeAtJanuary';

describe('patchMomentDeAtJanuary', () => {
  beforeAll(() => {
    // Load moment's built-in de-at locale (normally loaded lazily in App).
    require('moment/locale/de-at');
    patchMomentDeAtJanuary();
  });

  const january = () => moment(new Date(2026, 0, 5, 14, 30)).locale('de-at');

  it('renders January as "Januar" instead of moment\'s default "Jänner"', () => {
    expect(january().format('MMMM')).toBe('Januar');
    expect(january().format('LLL')).toBe('5. Januar 2026 14:30');
    expect(january().format('MMMM')).not.toBe('Jänner');
  });

  it('leaves other months and the abbreviated January untouched', () => {
    expect(moment(new Date(2026, 1, 1)).locale('de-at').format('MMMM')).toBe(
      'Februar'
    );
    expect(january().format('MMM')).toBe('Jän.');
  });

  it('does not leave the global locale changed as a side effect', () => {
    moment.locale('en');
    patchMomentDeAtJanuary();
    expect(moment.locale()).toBe('en');
  });
});
