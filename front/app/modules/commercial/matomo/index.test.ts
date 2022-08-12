import config from '.';
import { mockRoutes } from './matchPath.test';
import eventEmitter from 'utils/eventEmitter';

jest.mock('services/appConfiguration');
jest.mock('services/auth');
jest.mock('services/locale');
jest.mock('modules', () => ({ streamsToReset: [] }));
jest.mock('routes', () => ({
  __esModule: true,
  default: jest.fn(() => [mockRoutes]),
}));

global.window = Object.create(window);
Object.defineProperty(window, 'location', {
  value: { pathname: '/en' },
});

describe('matomo', () => {
  beforeEach(() => {
    window._paq = [];
  });

  it('does not make any calls if no consent given', () => {
    (config as any).beforeMountApplication();
    eventEmitter.emit<any>('destinationConsentChanged', { matomo: false });

    expect(window._paq).toEqual([]);
  });

  it('makes call for initial page after consent is given', () => {
    (config as any).beforeMountApplication();
    eventEmitter.emit<any>('destinationConsentChanged', { matomo: true });

    const expectedCalls = [
      ['enableLinkTracking'],
      ['enableHeartBeatTimer'],
      ['setDomains', 'wonderville.com/*'],
      ['setCookieDomain', 'wonderville.com/*'],
      ['setUserId', '522ae8cc-a5ed-4d31-9aa0-470904934ec6'],
      ['setTrackerUrl', '//matomo.hq.citizenlab.co/matomo.php'],
      ['setSiteId', '14'],
      ['addTracker', '//matomo.hq.citizenlab.co/matomo.php', '13'],
      ['setCustomDimension', 1, 'wonderville'],
      ['setCustomDimension', 2, 'c4b400e1-1786-5be2-af55-40730c6a843d'],
      ['setCustomDimension', 3, 'en'],
      ['setCustomUrl', '/en'],
      ['trackPageView', '/:locale'],
      ['enableLinkTracking'],
      ['enableHeartBeatTimer'],
      ['setDomains', 'wonderville.com/*'],
      ['setCookieDomain', 'wonderville.com/*'],
      ['setUserId', '522ae8cc-a5ed-4d31-9aa0-470904934ec6'],
      ['setTrackerUrl', '//matomo.hq.citizenlab.co/matomo.php'],
      ['setSiteId', '14'],
      ['addTracker', '//matomo.hq.citizenlab.co/matomo.php', '13'],
      ['setCustomDimension', 1, 'wonderville'],
      ['setCustomDimension', 2, 'c4b400e1-1786-5be2-af55-40730c6a843d'],
      ['setCustomDimension', 3, 'en'],
      ['setCustomUrl', '/en'],
      ['trackPageView', '/:locale'],
    ];

    expect(window._paq).toEqual(expectedCalls);
  });
});
