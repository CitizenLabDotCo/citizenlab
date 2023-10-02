import React from 'react';
import { fireEvent, render, act } from 'utils/testUtils/rtl';
import ConsentManager from '.';

// events
import eventEmitter from 'utils/eventEmitter';

// utils
import { registerDestination } from './destinations';
import { isAdmin, isRegularUser } from 'utils/permissions/roles';

// typings
import { IUserData } from 'api/users/types';

// mocked functions
import { setConsent, IConsentCookie } from './consent';

// mocks

jest.mock('utils/cl-router/Link', () => ({ children }) => (
  <button>{children}</button>
));

let mockAuthUser: IUserData | null = null;
jest.mock('api/me/useAuthUser', () => () => ({ data: { data: mockAuthUser } }));

const mockAppConfiguration = {
  data: {
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
        intercom: {
          allowed: true,
          enabled: true,
        },
      },
    },
  },
};
jest.mock('api/app_configuration/useAppConfiguration', () => () => {
  return { data: mockAppConfiguration };
});

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
    !!user && (isAdmin({ data: user }) || !isRegularUser({ data: user })),
  name: () => 'Intercom',
});

describe('<ConsentManager />', () => {
  describe('logged out, no cookie exists yet', () => {
    beforeEach(() => {
      mockAuthUser = null;
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

    it('rejects all cookies except functional if banner is closed', () => {
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

    it('rejects all cookies except functional if preference modal is openend and confirmed without changes', () => {
      const { container } = render(<ConsentManager />);
      fireEvent.click(container.querySelector('.integration-open-modal'));
      fireEvent.click(container.querySelector('#e2e-preferences-save'));

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

    it('accepts only functional and analytics cookies if analytics is enabled in preference modal', () => {
      const { container } = render(<ConsentManager />);
      fireEvent.click(container.querySelector('.integration-open-modal'));
      fireEvent.click(container.querySelector('#analytics-radio-true'));
      fireEvent.click(container.querySelector('#e2e-preferences-save'));

      expect(setConsent).toHaveBeenCalledWith({
        functional: true,
        analytics: true,
        advertising: false,
        savedChoices: {
          matomo: true,
          google_analytics: true,
        },
      });
    });
  });

  describe('logged out, cookie exists', () => {
    beforeEach(() => {
      mockAuthUser = null;
      mockCookie = {
        functional: true,
        analytics: true,
        advertising: false,
        savedChoices: {
          matomo: true,
          google_analytics: true,
        },
      };
    });

    it('does not render banner', () => {
      const { container } = render(<ConsentManager />);
      expect(
        container.querySelector('#e2e-cookie-banner')
      ).not.toBeInTheDocument();
    });

    it('still allows cookies to be changes through modal', () => {
      const { container } = render(<ConsentManager />);
      expect(
        container.querySelector('#e2e-preference-dialog')
      ).not.toBeInTheDocument();

      act(() => eventEmitter.emit('openConsentManager'));
      expect(
        container.querySelector('#e2e-preference-dialog')
      ).toBeInTheDocument();

      fireEvent.click(container.querySelector('#analytics-radio-false'));
      fireEvent.click(container.querySelector('#e2e-preferences-save'));

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

  describe('logged in, cookie exists', () => {
    beforeEach(() => {
      mockCookie = {
        functional: true,
        analytics: true,
        advertising: false,
        savedChoices: {
          matomo: true,
          google_analytics: true,
        },
      };
    });

    it('does not show banner if no new permissions required', () => {
      mockAuthUser = {
        attributes: {
          roles: [],
          highest_role: 'user',
        },
      } as any;

      const { container } = render(<ConsentManager />);
      expect(
        container.querySelector('#e2e-cookie-banner')
      ).not.toBeInTheDocument();
    });

    it('shows banner if new permissions required', () => {
      mockAuthUser = {
        attributes: {
          roles: [{ type: 'admin' }],
        },
      } as any;

      const { container } = render(<ConsentManager />);
      expect(container.querySelector('#e2e-cookie-banner')).toBeInTheDocument();
    });
  });
});
