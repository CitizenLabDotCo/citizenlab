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

    console.log(window._paq)
  });

  it('tracks page change', () => {
    (config as any).beforeMountApplication();
    eventEmitter.emit<any>('destinationConsentChanged', { matomo: true });

    trackPage('/en/sign-in');

    console.log(window._paq)
  })
});
