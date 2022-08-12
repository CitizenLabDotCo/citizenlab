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

jest.mock('components/ConsentManager/destinations', () => ({
  ...jest.requireActual('components/ConsentManager/destinations'),
  isDestinationActive: jest.fn(() => true),
}));

let pagesViewed: string[] = [];
const mockMatomoTrackPageView = jest.fn((path: string) => {
  pagesViewed.push(path);
});

jest.mock('.', () => ({
  ...jest.requireActual('.'),
  __esModule: true,
  trackMatomoPageview: mockMatomoTrackPageView,
}));

global.window = Object.create(window);
window._paq = [];
Object.defineProperty(window, 'location', {
  value: { pathname: '/' },
});

describe('matomo', () => {
  it('does not make any calls if no consent given', () => {
    pagesViewed = [];

    (config as any).beforeMountApplication();
    eventEmitter.emit<any>('destinationConsentChanged', {});

    expect(pagesViewed).toEqual([]);
  });

  it.only('makes call for initial page after consent is given', () => {
    pagesViewed = [];

    (config as any).beforeMountApplication();
    eventEmitter.emit<any>('destinationConsentChanged', { matomo: true });

    expect(pagesViewed).toEqual(['/']);
  });
});
