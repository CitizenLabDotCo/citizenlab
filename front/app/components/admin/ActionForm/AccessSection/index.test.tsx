import React from 'react';

import { IdMethodData } from 'api/id_methods/types';
import { IPermissionData } from 'api/permissions/types';

import { render, screen } from 'utils/testUtils/rtl';

import AccessSection from '.';

// ---- Controllable platform config -------------------------------------------
// Which sign-in methods the platform offers: email and SMS come from feature
// flags, anything else from the id methods.
let mockPasswordLoginEnabled = true;
let mockSmsEnabled = true;
let mockSmsLoginEnabled = true;
let mockIdMethods: IdMethodData[] = [];

jest.mock('hooks/useFeatureFlag', () =>
  jest.fn(({ name }: { name: string }) => {
    if (name === 'password_login') return mockPasswordLoginEnabled;
    if (name === 'sms') return mockSmsEnabled;
    if (name === 'sms_login') return mockSmsLoginEnabled;
    return false;
  })
);

jest.mock('api/id_methods/useIdMethods', () =>
  jest.fn(() => ({ data: { data: mockIdMethods } }))
);

// Not under test - stub out the children with their own data dependencies.
jest.mock(
  'components/admin/ActionForm/AccessSection/GroupsSection',
  () => () => null
);
jest.mock(
  'components/admin/ActionForm/AccessSection/SecurityRequirementsSection',
  () => () => <div data-testid="security-requirements-section" />
);
jest.mock(
  'components/admin/ActionForm/AccessSection/IdMethodsModal/Trigger',
  () => () => <div data-testid="id-method-fields-trigger" />
);

const buildIdMethod = (name: string, authentication: boolean): IdMethodData =>
  ({
    id: `method-${name}`,
    type: 'id_method',
    attributes: {
      name,
      authentication_method: authentication,
      verification_method: !authentication,
      method_metadata: { name },
    },
  } as IdMethodData);

const buildPermission = (
  attributes: Partial<IPermissionData['attributes']> = {}
): IPermissionData =>
  ({
    id: 'perm-1',
    type: 'permission',
    attributes: {
      action: 'commenting_idea',
      permitted_by: 'users',
      custom_fields_behavior: 'global',
      verification_expiry: null,
      access_denied_explanation_multiloc: {},
      everyone_tracking_enabled: false,
      user_data_collection: 'all_data',
      require_confirmed_email: true,
      confirmed_email_expiry: null,
      require_name: true,
      require_password: true,
      require_verification: false,
      permitted_by_everyone_allowed: false,
      ...attributes,
    },
    relationships: {
      permission_scope: { data: { id: 'ph-1', type: 'phase' } },
      groups: { data: [] },
    },
  } as IPermissionData);

const renderSection = (attributes?: Partial<IPermissionData['attributes']>) =>
  render(
    <AccessSection
      permission={buildPermission(attributes)}
      showAnyone
      onChange={jest.fn()}
    />
  );

beforeEach(() => {
  mockPasswordLoginEnabled = true;
  mockSmsEnabled = true;
  mockSmsLoginEnabled = true;
  mockIdMethods = [];
});

describe('<AccessSection />', () => {
  it('renders the "Who can participate" header', () => {
    renderSection();
    expect(screen.getByText('Who can participate')).toBeInTheDocument();
  });

  describe('the sign-in methods named on the "Require sign-in" card', () => {
    it('lists email and SMS when password login and SMS are both on', () => {
      renderSection();
      expect(
        screen.getByText('Participants sign in with email, SMS.')
      ).toBeInTheDocument();
    });

    it('leaves out SMS when the sms feature is off', () => {
      mockSmsEnabled = false;
      renderSection();
      expect(
        screen.getByText('Participants sign in with email.')
      ).toBeInTheDocument();
    });

    it('leaves out SMS when sms login is off', () => {
      mockSmsLoginEnabled = false;
      renderSection();
      expect(
        screen.getByText('Participants sign in with email.')
      ).toBeInTheDocument();
    });

    it('leaves out both email and SMS when password login is off', () => {
      mockPasswordLoginEnabled = false;
      mockIdMethods = [buildIdMethod('fake_sso', true)];
      renderSection();
      expect(
        screen.getByText('Participants sign in with Fake SSO.')
      ).toBeInTheDocument();
    });

    it('names a single authentication id method', () => {
      mockIdMethods = [buildIdMethod('franceconnect', true)];
      renderSection();
      expect(
        screen.getByText('Participants sign in with email, SMS, FranceConnect.')
      ).toBeInTheDocument();
    });

    it('falls back to the generic SSO label with several authentication methods', () => {
      mockIdMethods = [
        buildIdMethod('franceconnect', true),
        buildIdMethod('fake_sso', true),
      ];
      renderSection();
      expect(
        screen.getByText(
          'Participants sign in with email, SMS, SSO (see identification methods link below).'
        )
      ).toBeInTheDocument();
    });

    it('ignores id methods that are verification-only', () => {
      mockIdMethods = [buildIdMethod('franceconnect', false)];
      renderSection();
      expect(
        screen.getByText('Participants sign in with email, SMS.')
      ).toBeInTheDocument();
    });

    it('warns when no sign-in method is available at all', () => {
      mockPasswordLoginEnabled = false;
      renderSection();
      expect(
        screen.getByText('No sign-in method is enabled on this platform.')
      ).toBeInTheDocument();
    });
  });

  describe('when an account is required (permitted_by: users)', () => {
    it('shows the security checks section and the identification-methods link', () => {
      renderSection();
      expect(
        screen.getByTestId('security-requirements-section')
      ).toBeInTheDocument();
      expect(
        screen.getByTestId('id-method-fields-trigger')
      ).toBeInTheDocument();
    });
  });

  describe('when no account is required (permitted_by: everyone)', () => {
    it('does not show the security checks section', () => {
      renderSection({ permitted_by: 'everyone' });
      expect(
        screen.queryByTestId('security-requirements-section')
      ).not.toBeInTheDocument();
    });

    it('does not offer the identification-methods trigger', () => {
      renderSection({ permitted_by: 'everyone' });
      expect(
        screen.queryByTestId('id-method-fields-trigger')
      ).not.toBeInTheDocument();
    });

    it('still names the sign-in methods on the card', () => {
      renderSection({ permitted_by: 'everyone' });
      expect(
        screen.getByText('Participants sign in with email, SMS.')
      ).toBeInTheDocument();
    });
  });
});
