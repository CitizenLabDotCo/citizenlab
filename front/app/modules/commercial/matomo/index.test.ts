import config from '.';
import { mockRoutes } from './mockRoutes.mock';
import eventEmitter from 'utils/eventEmitter';
// import { trackPage } from 'utils/analytics';

// mocked inputs
import { setupMatomo } from './setup';
// import { trackPageChange } from './actions';

jest.mock('services/appConfiguration');
jest.mock('services/auth');
jest.mock('services/locale');
jest.mock('modules', () => ({ streamsToReset: [] }));
jest.mock('routes', () => ({
  __esModule: true,
  default: jest.fn(() => [mockRoutes]),
}));
jest.mock('./setup', () => ({
  setupMatomo: jest.fn(),
}));
jest.mock('./actions', () => ({
  // trackEvent: jest.fn(),
  trackPageChange: jest.fn(),
}));

describe('matomo: no cookies accepted', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('does not make any calls if no consent given', () => {
    (config as any).beforeMountApplication();
    eventEmitter.emit<any>('destinationConsentChanged', { matomo: false });

    expect(setupMatomo).not.toHaveBeenCalled();
  });

  it('sets up matomo and makes call for initial page after consent is given', () => {
    (config as any).beforeMountApplication();
    // trackPage('/en');
    eventEmitter.emit<any>('destinationConsentChanged', { matomo: true });

    expect(setupMatomo).toHaveBeenCalledTimes(1);
    // expect(trackPageChange).toHaveBeenCalledTimes(1);
    // expect(trackPageChange).toHaveBeenCalledWith('/en');
  });

  // it('tracks a page change', () => {
  //   (config as any).beforeMountApplication();
  //   eventEmitter.emit<any>('destinationConsentChanged', { matomo: true });

  //   trackPage('/en/sign-in');

  //   expect(window._paq).toContainEqual(['trackPageView', '/:locale/sign-in']);
  // });
});

describe('matomo: cookies already accepted', () => {});
