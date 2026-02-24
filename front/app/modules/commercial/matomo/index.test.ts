import { trackPage } from 'utils/analytics';
import eventEmitter from 'utils/eventEmitter';

import { trackPageChange } from './actions';
import { setupMatomo } from './setup';

import config from '.';

jest.mock('api/app_configuration/appConfigurationStream');

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
      trackPage('/en');
      trackPage('/en/projects');

      expect(trackPageChange).toHaveBeenCalledTimes(2);
      expect(trackPageChange).toHaveBeenCalledWith('/en');
      expect(trackPageChange).toHaveBeenCalledWith('/en/projects');
    });
  });
});
