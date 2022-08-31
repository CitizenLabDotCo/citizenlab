import config from '.';
import { mockRoutes } from './matchPath.test';
import eventEmitter from 'utils/eventEmitter';
import { trackPage } from 'utils/analytics';

jest.mock('services/appConfiguration');
jest.mock('services/auth');
jest.mock('services/locale');
jest.mock('modules', () => ({ streamsToReset: [] }));
jest.mock('routes', () => ({
  __esModule: true,
  default: jest.fn(() => [mockRoutes]),
}));

global.window = Object.create(window);

describe('matomo', () => {
  beforeEach(() => {
    window._paq = [];
  });

  it('does not make any calls if no consent given', () => {
    (config as any).beforeMountApplication();
    eventEmitter.emit<any>('destinationConsentChanged', { matomo: false });

    expect(window._paq).toEqual([]);
  });

  // Note there is duplication in the values coming back from the array
  // but Matomo deals with this and does not make duplicate requests
  it('sets up matomo and makes call for initial page after consent is given', () => {
    (config as any).beforeMountApplication();
    eventEmitter.emit<any>('destinationConsentChanged', { matomo: true });

    expect(window._paq).toContainEqual(['enableLinkTracking']);

    trackPage('/en');
    expect(window._paq).toContainEqual(['setCustomUrl', '/en']);
    expect(window._paq).toContainEqual(['trackPageView', '/:locale']);
  });

  it('tracks a page change', () => {
    (config as any).beforeMountApplication();
    eventEmitter.emit<any>('destinationConsentChanged', { matomo: true });

    trackPage('/en/sign-in');

    expect(window._paq).toContainEqual(['trackPageView', '/:locale/sign-in']);
  });
});
