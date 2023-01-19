import React from 'react';
import { fireEvent, render } from 'utils/testUtils/rtl';
import ConsentManager from '.';
import { IConsentCookie } from './consent';
import { registerDestination } from './destinations';
import { isAdmin, isModerator } from 'services/permissions/roles';
import { setConsent } from './consent';

// mocks
jest.mock('utils/cl-intl');
jest.mock('services/appConfiguration');
jest.mock('modules', () => ({ streamsToReset: [] }));
jest.mock('utils/cl-router/Link', () => ({ children }) => <a>{children}</a>);
jest.mock('hooks/useLocale');

let mockAuthUser = null;
jest.mock('hooks/useAuthUser', () => () => mockAuthUser);

let mockAppConfiguration = {
  id: '1',
  attributes: {
    settings: {
      matomo: {
        allowed: true,
        enabled: true,
      },
      google_analytics: {
        allowed: true,
        enabled: true,
      },
    },
  },
};
jest.mock('hooks/useAppConfiguration', () => () => mockAppConfiguration);

let mockCookie: IConsentCookie | null = null;
jest.mock('./consent', () => ({
  getConsent: jest.fn(() => mockCookie),
  setConsent: jest.fn(),
}));

// add destinations for testing
registerDestination({
  key: 'matomo',
  category: 'analytics',
  feature_flag: 'matomo',
  name: () => 'Matomo',
});

registerDestination({
  key: 'google_analytics',
  category: 'analytics',
  feature_flag: 'google_analytics',
  name: () => 'Google Analytics',
});

registerDestination({
  key: 'intercom',
  category: 'functional',
  feature_flag: 'intercom',
  hasPermission: (user) =>
    !!user && (isAdmin({ data: user }) || isModerator({ data: user })),
  name: () => 'Intercom',
});

describe('<ConsentManager />', () => {
  describe('logged out, no cookie exists yet', () => {
    beforeEach(() => {
      mockCookie = null;
    });

    it('renders banner', () => {
      const { container } = render(<ConsentManager />);
      expect(container.querySelector('#e2e-cookie-banner')).toBeInTheDocument();
    });

    it('saves correct cookie if all cookies are accepted', () => {
      const { container } = render(<ConsentManager />);
      fireEvent.click(container.querySelector('.e2e-accept-cookies-btn'));

      expect(setConsent).toHaveBeenCalledWith({
        functional: true,
        analytics: true,
        advertising: true,
        savedChoices: {
          matomo: true,
          google_analytics: true,
        },
      });
    });

    it('rejects all cookies except function if banner is closed', () => {
      const { container } = render(<ConsentManager />);
      fireEvent.click(container.querySelector('.e2e-close-cookie-banner'));

      expect(setConsent).toHaveBeenCalledWith({
        functional: true,
        analytics: false,
        advertising: false,
        savedChoices: {
          matomo: false,
          google_analytics: false,
        },
      });
    });
  });

  describe('logged out, cookie exists', () => {
    it('does not render banner', () => {
      mockCookie = {
        functional: true,
        analytics: true,
        advertising: false,
        savedChoices: {
          matomo: true,
          google_analytics: true,
        },
      };

      const { container } = render(<ConsentManager />);
      expect(
        container.querySelector('#e2e-cookie-banner')
      ).not.toBeInTheDocument();
    });
  });

  // describe('logged in, no cookie exists yet', () => {
  //   // TODO
  // });

  // describe('logged in, cookie exists', () => {
  //   // TODO
  // });
});
