import config from '.';
import { mockRoutes } from './mockRoutes.mock';
import eventEmitter from 'utils/eventEmitter';
import { trackPage } from 'utils/analytics';

// mocked inputs
import { setupMatomo } from './setup';
import { trackPageChange } from './actions';

jest.mock('services/appConfiguration');
jest.mock('services/auth');
jest.mock('services/locale');
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

describe('matomo', () => {
  beforeAll(() => {
    (config as any).beforeMountApplication();
  });

  beforeEach(() => {
    jest.clearAllMocks();
    eventEmitter.emit<any>('destinationConsentChanged', { matomo: false });
  });

  describe('with consent from beginning', () => {
    it('calls setupMatomo', () => {
      eventEmitter.emit<any>('destinationConsentChanged', { matomo: true });
      expect(setupMatomo).toHaveBeenCalledTimes(1);
    });

    it('registers page changes', () => {
      eventEmitter.emit<any>('destinationConsentChanged', { matomo: true });
      trackPage('/en');
      trackPage('/en/projects');

      expect(trackPageChange).toHaveBeenCalledTimes(2);
      expect(trackPageChange).toHaveBeenCalledWith('/en');
      expect(trackPageChange).toHaveBeenCalledWith('/en/projects');
    });
  });

  describe('with consent given later', () => {
    it('calls setupMatomo when consent is given', () => {
      expect(setupMatomo).toHaveBeenCalledTimes(0);
      eventEmitter.emit<any>('destinationConsentChanged', { matomo: true });
      expect(setupMatomo).toHaveBeenCalledTimes(1);
    });

    it('registers page changes when consent is given', () => {
      trackPage('/en');
      trackPage('/en/projects');
      expect(trackPageChange).not.toHaveBeenCalled();

      eventEmitter.emit<any>('destinationConsentChanged', { matomo: true });

      expect(trackPageChange).toHaveBeenCalledTimes(2);
      expect(trackPageChange).toHaveBeenCalledWith('/en');
      expect(trackPageChange).toHaveBeenCalledWith('/en/projects');
    });
  });
});
