import React from 'react';

import { IUserData } from 'api/users/types';

import eventEmitter from 'utils/eventEmitter';
import { isAdmin, isRegularUser } from 'utils/permissions/roles';
import { render, act, screen, userEvent } from 'utils/testUtils/rtl';

// mocked functions
import { setConsent, IConsentCookie } from './consent';
import { registerDestination } from './destinations';

import ConsentManager from '.';

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

    it('opens and closes the preference modal', async () => {
      // opens
      const user = userEvent.setup();
      const { container } = render(<ConsentManager />);
      expect(
        container.querySelector('#e2e-preference-dialog')
      ).not.toBeInTheDocument();
      await user.click(screen.getByTestId('manage-preferences-btn'));

      expect(
        container.querySelector('#e2e-preference-dialog')
      ).toBeInTheDocument();

      // closes
      const closeButton = screen.getByTestId('e2e-preferences-cancel');

      await user.click(closeButton);
      expect(
        container.querySelector('#e2e-preference-dialog')
      ).not.toBeInTheDocument();
    });

    it('saves correct cookie if all cookies are accepted', async () => {
      const user = userEvent.setup();
      render(<ConsentManager />);
      await user.click(screen.getByTestId('accept-cookies-btn'));

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

    it('rejects all cookies except functional if banner is closed', async () => {
      const user = userEvent.setup();
      render(<ConsentManager />);
      await user.keyboard('[Escape]');

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

    it('rejects all cookies except functional if preference modal is opened and confirmed without changes', async () => {
      const user = userEvent.setup();
      const { container } = render(<ConsentManager />);
      await user.click(screen.getByTestId('manage-preferences-btn'));
      await user.click(container.querySelector('#e2e-preferences-save'));

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

    it('accepts only functional and analytics cookies if analytics is enabled in preference modal', async () => {
      const user = userEvent.setup();
      const { container } = render(<ConsentManager />);
      await user.click(screen.getByTestId('manage-preferences-btn'));
      await user.click(container.querySelector('#analytics-radio-true'));
      await user.click(container.querySelector('#e2e-preferences-save'));

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

    it('does not render the preference modal/screen (yet)', () => {
      const { container } = render(<ConsentManager />);
      expect(
        container.querySelector('#e2e-preference-dialog')
      ).not.toBeInTheDocument();
    });

    it('still allows cookies to be changed through modal', async () => {
      const { container } = render(<ConsentManager />);
      const user = userEvent.setup();
      expect(
        container.querySelector('#e2e-preference-dialog')
      ).not.toBeInTheDocument();

      act(() => eventEmitter.emit('openConsentManager'));

      await user.click(screen.getByTestId('manage-preferences-btn'));

      expect(
        container.querySelector('#e2e-preference-dialog')
      ).toBeInTheDocument();

      await user.click(container.querySelector('#analytics-radio-false'));
      await user.click(container.querySelector('#e2e-preferences-save'));

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

    it('accepting all cookies sends the right preferences and closes the modal, even when opened multiple times', async () => {
      // This test is important because we can accept all cookies multiple times
      // (e.g. after we launch the modal again from the platform footer).
      // There used to be a bug where the modal would not close after accepting cookies for the second time.
      // The function that dealt with "accept all" was also once implemented in a way that kept existing preferences
      // (even if they were false).
      const user = userEvent.setup();
      const { container } = render(<ConsentManager />);
      // Simulate opening the consent manager.
      // We use events to trigger the modal from e.g. the platform footer.
      act(() => eventEmitter.emit('openConsentManager'));
      await user.click(screen.getByTestId('accept-cookies-btn'));

      expect(setConsent).toHaveBeenCalledWith({
        functional: true,
        analytics: true,
        advertising: true,
        savedChoices: {
          matomo: true,
          google_analytics: true,
        },
      });

      expect(
        container.querySelector('#e2e-cookie-banner')
      ).not.toBeInTheDocument();
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
