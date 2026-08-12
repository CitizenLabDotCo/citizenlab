import React from 'react';

import { IdMethodData } from 'api/id_methods/types';
import { IPhasePermissionData } from 'api/phase_permissions/types';

import { render, screen, within, userEvent } from 'utils/testUtils/rtl';

import ActionForm from '.';

const ssoMethod = {
  id: 'method-1',
  type: 'id_method',
  attributes: {
    name: 'fake_sso',
    authentication_method: true,
    verification_method: false,
    method_metadata: { name: 'ItsMe' },
  },
} as IdMethodData;

// The combination of platform config the panel reacts to.
let mockPasswordLoginEnabled = true;
let mockIdMethods: IdMethodData[] = [ssoMethod];
let mockVerificationMethodConfigured = true;

jest.mock('hooks/useFeatureFlag', () =>
  jest.fn(({ name }: { name: string }) =>
    name === 'password_login' ? mockPasswordLoginEnabled : false
  )
);

jest.mock('api/id_methods/useIdMethods', () =>
  jest.fn(() => ({ data: { data: mockIdMethods } }))
);

jest.mock('api/id_methods/useVerificationMethod', () =>
  jest.fn(() => ({
    data: mockVerificationMethodConfigured
      ? { data: { attributes: { method_metadata: { name: 'ItsMe' } } } }
      : null,
  }))
);

jest.mock('api/phases/usePhase', () =>
  jest.fn(() => ({
    data: { data: { attributes: { participation_method: 'ideation' } } },
  }))
);

jest.mock(
  'api/permissions_phase_custom_fields/usePermissionsPhaseCustomFields',
  () => jest.fn(() => ({ data: { data: [] } }))
);

// Leaf sections with their own data dependencies, orthogonal to what we test.
jest.mock(
  'components/admin/ActionForm/AccessSection/GroupsSection',
  () => () => null
);
jest.mock(
  'components/admin/ActionForm/AccessSection/IdMethodsModal',
  () => () => null
);
jest.mock(
  'components/admin/ActionForm/DataSection/DemographicSection',
  () => () => null
);
jest.mock(
  'components/admin/ActionForm/DataSection/AnonymitySection',
  () => () => null
);

const buildPermission = (
  attributes: Partial<IPhasePermissionData['attributes']> = {}
): IPhasePermissionData =>
  ({
    id: 'perm-1',
    type: 'permission',
    attributes: {
      action: 'commenting_idea',
      permitted_by: 'users',
      global_custom_fields: false,
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
  } as IPhasePermissionData);

const renderForm = (
  attributes?: Partial<IPhasePermissionData['attributes']>,
  { defaultOpen = true }: { defaultOpen?: boolean } = {}
) =>
  render(
    <ActionForm
      phaseId="ph-1"
      permissionData={buildPermission(attributes)}
      title="Commenting"
      defaultOpen={defaultOpen}
      onChange={jest.fn()}
      onReset={jest.fn()}
    />
  );

beforeEach(() => {
  mockPasswordLoginEnabled = true;
  mockIdMethods = [ssoMethod];
  mockVerificationMethodConfigured = true;
});

describe('<ActionForm />', () => {
  describe('the access section', () => {
    it('offers the security checks whatever the sign-in methods are', () => {
      renderForm();
      expect(screen.getByText('Security requirements')).toBeInTheDocument();
      expect(
        screen.getByText('Participants sign in with email, Fake SSO.')
      ).toBeInTheDocument();
    });

    it('keeps the same section when password login is off', () => {
      mockPasswordLoginEnabled = false;
      renderForm();
      // Only the SSO method is a way in, but the security checks are still
      // there to be required.
      expect(
        screen.getByText('Participants sign in with Fake SSO.')
      ).toBeInTheDocument();
      expect(screen.getByText('Security requirements')).toBeInTheDocument();
    });
  });

  describe('admins & managers only', () => {
    it('does not render the data section and shows the staff-only hint', () => {
      renderForm({ permitted_by: 'admins_moderators' });
      expect(screen.queryByText('What we collect')).not.toBeInTheDocument();
      expect(
        screen.getByText(/Only admins and managers can take this action/i)
      ).toBeInTheDocument();
    });
  });

  describe('collapsed summary chips', () => {
    it('summarises the enabled methods and collected fields', () => {
      renderForm(
        { require_name: true, require_password: true },
        { defaultOpen: false }
      );
      // Body is not rendered when collapsed; only the summary chips are.
      expect(screen.queryByText('What we collect')).not.toBeInTheDocument();
      expect(screen.getByText('Sign-in required')).toBeInTheDocument();
      expect(screen.getByText('Confirmed email')).toBeInTheDocument();
      expect(screen.getByText('Name')).toBeInTheDocument();
      expect(screen.getByText('Password')).toBeInTheDocument();
    });

    it('shows the open-access chip when anyone can participate', () => {
      renderForm({ permitted_by: 'everyone' }, { defaultOpen: false });
      expect(screen.getByText('Anyone can participate')).toBeInTheDocument();
    });
  });

  describe('password tooltip integration', () => {
    it('surfaces the "email sign-up only" tooltip when an SSO method is enabled', async () => {
      renderForm();

      await userEvent.click(screen.getByText('Personal info'));
      const passwordRow = screen.getByText('Password').parentElement!;
      await userEvent.hover(
        within(passwordRow).getByTestId('tooltip-icon-button')
      );

      expect(
        await screen.findByText(
          /only requested from users who sign up with email/i
        )
      ).toBeInTheDocument();
    });

    it('does not surface the password tooltip when there is no SSO method', async () => {
      mockIdMethods = [];
      renderForm();

      await userEvent.click(screen.getByText('Personal info'));
      const passwordRow = screen.getByText('Password').parentElement!;
      expect(
        within(passwordRow).queryByTestId('tooltip-icon-button')
      ).not.toBeInTheDocument();
    });
  });
});
